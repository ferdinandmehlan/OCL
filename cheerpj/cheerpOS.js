// An array of {path:"/path",handler:handlerObj} ordered by the most specific to the least
var cheerpjFSMounts = [];

function cheerpjFSInit()
{
	// Keep these ordered from the most specific to the least
	cheerpjFSMounts.push(new CheerpJWebFolder("/app/",appUrlPrefix ? appUrlPrefix : "", false, cheerpjJarJsOverridePath));
	cheerpjFSMounts.push(new CheerpJWebFolder("/apps/",appUrlPrefix ? appUrlPrefix : "", true, null));
	cheerpjFSMounts.push(new CheerpJIndexedDBFolder("/files/"));
	cheerpjFSMounts.push(new CheerpJWebFolder("/lt/",loaderPath,false,null));
	cheerpjFSMounts.push(new CheerpJWebFolder("/lts/",loaderPath,true,null));
	cheerpjFSMounts.push(new CheerpJStringFolder("/str/"));
	cheerpjFSMounts.push(new CheerpJDevFolder("/dev/"));
	cheerpjFSMounts.push(new CheerpJRootFolder("/"));
	var conFileData = cheerpjCreateConsole(null, null, cheerpjDefaultConsoleWrite);
	var conFD = { fileData: conFileData, offset: 0, flags: 0 };
	cjFDs[0] = conFD;
	cjFDs[1] = conFD;
	cjFDs[2] = conFD;
	conFileData.refCount+=3;
}

function CheerpJFileData(parent, path, len, inodeId, permType)
{
	this.refCount = 0;
	this.length = len | 0;
	this.dirty = 0;
	this.parent = parent;
	// path is local to the mount point
	this.path = path;
	this.inodeId = inodeId | 0;
	// data is linear not chunked data
	this.data = null;
	// chunks is for chunked data
	this.chunks = null;
	// mount contains the ops structure
	this.mount = null;
	// permissions and file type following 'stat' conventions
	this.permType = permType | 0;
}

CheerpJFileData.prototype.getFullPath = function()
{
	return cheerpjNormalizePath(this.parent.mountPoint+this.path);
}

function CheerpJFolder(mp)
{
	this.mountPoint = mp;
	this.hasReadWrite = false;
	// { statAsync, listAsync, makeFileData, createDirAsync, loadAsync }
	this.mountOps = null;
	// { readAsync, writeAsync, commitFileData };
	this.inodeOps = null;
	this.devId = CheerpJFolder.lastDevId;
	CheerpJFolder.lastDevId = CheerpJFolder.lastDevId + 1|0
}

CheerpJFolder.lastDevId = 1;

function CheerpJRootFolder(mp)
{
	CheerpJFolder.call(this, mp);
	this.mountOps = RootOps;
}

CheerpJRootFolder.prototype = Object.create(CheerpJFolder.prototype);

function rootStatAsync(mp, path, fileRef, p)
{
	if(path == "/")
	{
		fileRef.permType = /*S_IFDIR*/0x4000 | /*0555*/0x16d;
		// Use the dev id as the inode id
		fileRef.inodeId = 0;
		return;
	}
	// Iterate over the mount points
	for(var i=0;i<cheerpjFSMounts.length;i++)
	{
		var f = cheerpjFSMounts[i];
		if(f.mountPoint == path + "/")
		{
			fileRef.permType = /*S_IFDIR*/0x4000 | /*0555*/0x16d;
			// Use the dev id as the inode id
			fileRef.inodeId = f.devId;
			return;
		}
	}
	fileRef.permType = 0;
}

function rootListAsync(mp, path, fileRef, p)
{
	// Only the root itself can be listed
	if(path != "/")
		return;
	for(var i=0;i<cheerpjFSMounts.length;i++)
	{
		var f = cheerpjFSMounts[i];
		fileRef.push(f.mountPoint);
	}
}

var RootOps = { statAsync: rootStatAsync, listAsync: rootListAsync, makeFileData: null, createDirAsync: null, loadAsync: null };

function CheerpJWebFolder(mp, basePath, isSplit, jarJSOverride)
{
	CheerpJFolder.call(this, mp);
	this.mountOps = WebOps;
	this.inodeOps = WebInodeOps;
	this.basePath = basePath;
	this.hasReadWrite = isSplit;
	this.jarJSOverride = jarJSOverride;
	// Make this a member as it needs to be overridden for jnlp support
	this.mapPath = webMapPath;
	this.headCache = {};
	// We need to assign unique ids to each file, and they must persist over the lifetime of the application
	this.inodeMap = {}
	this.lastInode = 1;
}

CheerpJWebFolder.prototype = Object.create(CheerpJFolder.prototype);

function webLoadAsync(mp, path, fileRef, p)
{
	var xhr = new XMLHttpRequest();
	xhr.fileRef = fileRef;
	xhr.thread = currentThread;
	fileRef.inodeId = webGetInode(mp, path);
	var url = mp.mapPath(mp, path);
	xhr.url = url;
	xhr.method = "GET";
	xhr.open("GET", url);
	xhr.responseType="arraybuffer";
	xhr.onload=cheerpjFileLoaded;
	xhr.onerror=cheerpjNetworkError;
	xhr.send();
	buildContinuations(p,false);
	currentThread.state = "BLOCKED_ON_FILE";
	throw "CheerpJContinue";
}

function webGetInode(mp, path)
{
	var ret = mp.inodeMap[path];
	if(ret !== undefined)
		return ret;
	ret = mp.lastInode;
	mp.lastInode = mp.lastInode + 1|0;
	mp.inodeMap[path] = ret;
	return ret;
}

function webStatAsync(mp, path, fileRef, p)
{
	var cached = mp.headCache[path];
	if(cached !== undefined)
	{
		fileRef.fileLength = cached | 0;
		fileRef.inodeId = webGetInode(mp, path);
		fileRef.permType = /*S_IFREG*/0x8000 | /*0444*/0x124;
		return;
	}
	if(path == "")
	{
		fileRef.inodeId = webGetInode(mp, path);
		fileRef.permType = /*S_IFDIR*/0x4000 | /*0555*/0x16d;
		return;
	}
	var xhr = new XMLHttpRequest();
	xhr.fileRef = fileRef;
	xhr.thread = currentThread;
	var url = mp.mapPath(mp, path);
	xhr.url = url;
	xhr.method = "HEAD";
	xhr.open("HEAD", url);
	xhr.responseType="arraybuffer";
	xhr.onload = function(e) {
		var xhr = e.target;
		xhr.onload = null;
		xhr.onerror = null;
		if(xhr.status == 200)
		{
			var hdr = null;
			var inodeId = 0;
			var permType = 0;
			if(xhr.responseURL && xhr.responseURL.endsWith("/"))
			{
				permType = /*S_IFDIR*/0x4000 | /*0555*/0x16d;
			}
			else if(hdr = xhr.getResponseHeader("Content-Length"))
			{
				fileRef.fileLength = parseInt(hdr);
				mp.headCache[path] = fileRef.fileLength;
				inodeId = webGetInode(mp, path);
				permType = /*S_IFREG*/0x8000 | /*0444*/0x124;
			}
			else if(hdr = xhr.getResponseHeader("ETag"))
			{
				if(hdr.startsWith("W/\""))
				{
					var hexLenEnd = hdr.indexOf("-");
					var hexLen = hdr.substring(3, hexLenEnd);
					fileRef.fileLength = parseInt(hexLen, 16);
					mp.headCache[path] = fileRef.fileLength;
					inodeId = webGetInode(mp, path);
					permType = /*S_IFREG*/0x8000 | /*0444*/0x124;
				}
			}
			fileRef.inodeId = inodeId | 0;
			fileRef.permType = permType | 0;
		}
		else if(xhr.status == 403 || xhr.status == 404)
		{
			// Forbidden, does this look like a directory name?
			if(xhr.responseURL && xhr.responseURL.endsWith("/"))
			{
				fileRef.permType = /*S_IFDIR*/0x4000 | /*0555*/0x16d;
			}
			else
			{
				fileRef.permType = 0;
			}
		}
		else
		{
			fileRef.permType = 0;
		}
		xhr.thread.state = "READY";
		cheerpjSchedule();
	};
	xhr.onerror = cheerpjNetworkError;
	xhr.send();
	buildContinuations(p,false);
	currentThread.state = "BLOCKED_ON_STAT";
	throw "CheerpJContinue";
}

function webMapPath(mp, path)
{
	if(path.endsWith(".jar.js") && mp.jarJSOverride)
		return mp.jarJSOverride + path;
	else
		return mp.basePath + path;
}

function webMakeFileData(mp, path, mode, p)
{
	assert(mp.hasReadWrite);
	assert(mode == "r");
	var fileRef={}
	var a={p:p,f:webMakeFileData,pc:0,fileRef:fileRef,path:path,mp:mp};
	a.pc=0;mp.mountOps.statAsync(mp, path, fileRef, a);
	assert(fileRef.permType);
	// Prepare 1MB chunks
	var numChunks = ((fileRef.fileLength + (1024*1024-1)) / (1024*1024)) | 0;
	var chunks = [];
	for(var i=0;i<numChunks;i++)
		chunks[i] = null;
	var fileData = new CheerpJFileData(mp, path, fileRef.fileLength|0, fileRef.inodeId|0, fileRef.permType|0);
	fileData.mount = mp.inodeOps;
	fileData.chunks = chunks;
	return fileData;
}

function webReadAsync(fileData, fileOffset, buf, off, len, flags, p)
{
	var chunkSize = 1024*1024;
	var curChunk = fileOffset / chunkSize | 0;
	var endChunk = (fileOffset + len) / chunkSize | 0;
	var fileRef={cheerpjDownload:null};
	var a={p:p,f:webReadAsync,pc:0,chunkSize:chunkSize,fileData:fileData,fileOffset:fileOffset,
			buf:buf,off:off,len:len,curChunk:curChunk,endChunk:endChunk,fileRef:fileRef};
	while(curChunk <= endChunk){
		if(fileData.chunks[curChunk])
		{
			var curChunk = curChunk+1|0;
			continue;
		}
		var xhr = new XMLHttpRequest();
		xhr.fileRef = fileRef;
		xhr.thread = currentThread;
		var url = webMapPath(fileData.parent, fileData.path + ".c" + curChunk + ".txt");
		xhr.url = url;
		xhr.method = "GET";
		xhr.open("GET", url);
		xhr.responseType="arraybuffer";
		xhr.onload=cheerpjFileLoaded;
		xhr.onerror=cheerpjNetworkError;
		xhr.send();
		buildContinuations(a,false);
		currentThread.state = "BLOCKED_ON_FILE";
		throw "CheerpJContinue";
		a.pc=0;;
		fileData.chunks[curChunk]=fileRef.cheerpjDownload;
		var curChunk = a.curChunk = curChunk+1|0;
	}
	// All chunks are now loaded
	var curChunk = fileOffset / chunkSize | 0;
	var curOffset = fileOffset - (curChunk*chunkSize) | 0;
	var i=0;
	while(i<len)
	{
		var c = fileData.chunks[curChunk];
		if((len-i) < (chunkSize-curOffset))
			chunkSize = curOffset+(len-i);
		for(var j=curOffset;j<chunkSize;j++)
		{
			buf[off+i|0]=c[j];
			i++;
		}
		curChunk++;
		curOffset=0;
	}
	assert(i==len);
	return len;
}

function webIoctlAsync()
{
	return -22;
}

var WebOps = { statAsync: webStatAsync, listAsync: null, makeFileData: webMakeFileData, createDirAsync: null, loadAsync: webLoadAsync };
var WebInodeOps = { readAsync: webReadAsync, writeAsync: null, ioctlAsync: webIoctlAsync, commitFileData: null };

function CheerpJIndexedDBFolder(mp)
{
	CheerpJFolder.call(this, mp);
	this.mountOps = IdbOps;
	this.inodeOps = IdbInodeOps;
	this.hasReadWrite = true;
	this.dbConnection = null;
	this.dEntries = {};
}

CheerpJIndexedDBFolder.prototype = Object.create(CheerpJFolder.prototype);

function idbTrap(e)
{
debugger
}

function idbStatAsync(mp, path, fileRef, p)
{
	var a={p:p,pc:0,f:idbStatAsync,mp:mp,path:path,fileRef:fileRef};
	a.pc=0;idbEnsureDBConnection(mp, a);
	// We get here after dbConnection is valid
	assert(path[path.length-1]!='/');
	var tx = a.tx = mp.dbConnection.transaction("files", "readonly");
	var store = a.store = tx.objectStore("files");
	// Find the directory
	var req = a.req = store.get(path);
	assert(req.readyState != "done");
	req.thread = currentThread;
	req.fileRef = fileRef;
	req.onerror = idbTrap;
	req.onsuccess = function(e)
	{
		this.onerror = null;
		this.onsuccess = null;
		var res = this.result;
		if(!res)
		{
			this.fileRef.permType = 0;
		}
		else
		{
			this.fileRef.inodeId = res.inodeId;
			if(res.type == "dir")
				this.fileRef.permType = /*S_IFDIR*/0x4000 | /*0777*/0x1ff;
			else if(res.type == "s")
				this.fileRef.permType = /*S_IFSOCK*/0xc000 | /*0666*/0x1b6;
			else
			{
				assert(res.type == "file");
				this.fileRef.permType = /*S_IFREG*/0x8000 | /*0666*/0x1b6;
				this.fileRef.fileLength = res.contents == null ? 0 : res.contents.length;
			}
		}
		this.thread.state = "READY";
		cheerpjSchedule();
	}
	currentThread.state = "WAIT_FOR_DB";
	// Go back to the caller
	buildContinuations(a.p, false);
	throw "CheerpJContinue";
}

function idbListAsync(mp,path, fileRef, p)
{
	var a={p:p,pc:0,f:idbListAsync,mp:mp,path:path,fileRef:fileRef};
	a.pc=0;idbEnsureDBConnection(mp, a);
	// We get here after dbConnection is valid
	assert(path[path.length-1]!='/');
	var tx = a.tx = mp.dbConnection.transaction("files", "readonly");
	var store = a.store = tx.objectStore("files");
	// Find the directory
	var req = a.req = store.get(path);
	assert(req.readyState != "done");
	req.thread = currentThread;
	req.fileRef = fileRef;
	req.onerror = idbTrap;
	req.onsuccess = function(e)
	{
		this.onerror = null;
		this.onsuccess = null;
		var res = this.result;
		if(res && res.type == "dir")
		{
			var c = res.contents;
			for(var i=0;i<c.length;i++)
				fileRef.push(c[i]);
		}
		// If there is no event, this is an sync handling
		if(e){
			this.thread.state = "READY";
			cheerpjSchedule();
		}
	}
	if(req.readyState == "done"){
		req.onsuccess(null);
	}else{
		currentThread.state = "WAIT_FOR_DB";
		// Go back to the caller
		buildContinuations(a.p, false);
		throw "CheerpJContinue";
	}
}

function idbCreateDirAsync(mp, path, fileRef, p)
{
	var a={p:p,pc:0,f:idbCreateDirAsync,mp:mp,path:path,fileRef:fileRef,parentPath:null,req:null,store:null,tx:null};
	a.pc=0;idbEnsureDBConnection(mp, a);
	// We get here after dbConnection is valid
	assert(path[path.length-1]!='/');
	// Find where the parent directory ends
	var parentEnd = path.lastIndexOf('/');
	assert(parentEnd >= 0);
	var parentPath = path.substring(0, parentEnd);
	a.parentPath = parentPath;
	var tx = a.tx = mp.dbConnection.transaction("files", "readwrite");
	tx.thread = currentThread;
	var store = a.store = tx.objectStore("files");
	function gotParent(res, asyncThread)
	{
		if(!res)
			fileRef.exists = 0;
		else
			fileRef.exists = (res.type == "dir" ? 5 : 3);
		if(fileRef.exists !== 5)
		{
			// Parent directory does not exist or it's not a directory
			if(asyncThread)
			{
				asyncThread.state = "READY";
				fileRef.exists = 0;
				cheerpjSchedule();
			}
			return false;
		}
		// Add this new object to the parent Path
		var childPath = path.substring(parentPath.length);
		assert(childPath[0]=='/');
		for(var i=0;i<res.contents.length;i++)
		{
			if(res.contents[i] == childPath)
			{
				if(asyncThread)
				{
					asyncThread.state = "READY";
					fileRef.exists = 5;
					cheerpjSchedule();
				}
				return false;
			}
		}
		res.contents.push(childPath);
		idbAddDEntry(mp, parentPath, res);
		store.put(res, parentPath);
		if(asyncThread == null)
			asyncThread = currentThread;
		var inodeReq = store.get("");
		assert(inodeReq.readyState != "done");
		inodeReq.onerror = idbTrap;
		inodeReq.onsuccess = function()
		{
			var curInodeId = this.result.nextInode++;
			store.put(this.result, "");
			store.put({ type: "dir", contents:[], inodeId: curInodeId}, path);
			asyncThread.state = "READY";
			fileRef.exists = 5;
			cheerpjSchedule();
		}
		return true;
	}
	var cachedDE = idbCheckDEntry(mp, parentPath);
	var doAsync = false;
	if(cachedDE)
		doAsync = gotParent(cachedDE, null);
	else
	{
		// Find the parent
		var req = a.req = store.get(parentPath);
		if(req.readyState == "done")
		{
			doAsync = gotParent(req.result, null);
		}
		else
		{
			req.thread = currentThread;
			req.onerror = idbTrap;
			req.onsuccess = function(e) { this.onerror = null; this.onsuccess = null; gotParent(this.result, this.thread); }
			doAsync = true;
		}
	}
	if(doAsync)
	{
		currentThread.state = "WAIT_FOR_DB";
		buildContinuations(a.p, false);
		throw "CheerpJContinue";
	}
}

function idbCheckDEntry(mp, path)
{
	// Does it exists already?
	var ret = mp.dEntries[path];
	if(!ret)
		return null;
	// Yep, mark it for LRU
	ret.ts = Date.now();
	return ret.res;
}

function idbAddDEntry(mp, path, res)
{
	if(mp.dEntries.length > 1)
		debugger
	if(idbCheckDEntry(mp, path))
		return;
	mp.dEntries[path] = { res: res, ts: Date.now() };
}

function idbMakeFileData(mp, path, mode, p)
{
	assert(mp.hasReadWrite);
	var fileRef={fileData:null}
	var a={p:p,f:idbMakeFileData,pc:0,fileRef:fileRef,path:path,mp:mp,parentPath:null,mode:mode};
	a.pc=0;idbEnsureDBConnection(mp, a);
	var parentPath = null;
	// We get here after dbConnection is valid
	if(path.length == 0)
	{
		// Getting the root directory, special case this
		parentPath = path;
	}
	else
	{
		assert(path[path.length-1]!='/');
		// Find where the parent directory ends
		var parentEnd = path.lastIndexOf('/');
		assert(parentEnd >= 0);
		parentPath = path.substring(0, parentEnd);
	}
	a.parentPath = parentPath;
	var tx = a.tx = mp.dbConnection.transaction("files", "readwrite");
	tx.thread = currentThread;
	var store = a.store = tx.objectStore("files");
	function gotFile(parentRes, res, async)
	{
		var isFile = res && res.type == "file";
		if(mode == "r" || (mode == "r+" && isFile))
		{
			if(isFile)
			{
				var data = res.contents;
				var chunks = [];
				if(data)
				{
					var cur = 0;
					var len = data.length;
					var chunkSize = 1024*1024;
					while(cur < len)
					{
						var thisChunkSize = (len - cur) < chunkSize ? len - cur : chunkSize;
						var c = new Uint8Array(thisChunkSize);
						c.set(data.subarray(cur, cur+thisChunkSize));
						chunks.push(c);
						cur += thisChunkSize;
					}
					assert(cur == len);
				}
				fileRef.fileData = new CheerpJFileData(mp, path, data?data.length:0, res.inodeId, /*S_IFREG*/0x8000 | /*0666*/0x1b6);
				fileRef.fileData.mount = mp.inodeOps;
				fileRef.fileData.chunks = chunks;
			}
			else if(res && res.type == "dir")
			{
				// It is legal to get an fd to a directory
				fileRef.fileData = new CheerpJFileData(mp, path, 0, res.inodeId, /*S_IFDIR*/0x4000 | /*0777*/0x1ff);
				fileRef.fileData.mount = mp.inodeOps;
			}
			else
				fileRef.fileData = null;
		}
		else if(mode == "w" || (mode == "r+" && !isFile))
		{
			// w is truncate, so we always update the file
			if(!isFile)
			{
				// Add this new object to the parent Path
				var childPath = path.substring(parentPath.length);
				assert(childPath[0]=='/');
				assert(parentRes.contents);
				parentRes.contents.push(childPath);
				store.put(parentRes, parentPath);
			}
			// TODO: Check if the file is actually a dir
			var inodeReq = store.get("");
			assert(inodeReq.readyState != "done");
			inodeReq.onerror = idbTrap;
			inodeReq.onsuccess = function()
			{
				var curInodeId = this.result.nextInode++;
				store.put(this.result, "");
				store.put({ type: "file", contents:null, inodeId: curInodeId }, path);
				fileRef.fileData = new CheerpJFileData(mp, path, 0, curInodeId, /*S_IFREG*/0x8000 | /*0666*/0x1b6);
				fileRef.fileData.dirty = 1;
				fileRef.fileData.mount = mp.inodeOps;
				fileRef.fileData.chunks = [];
				tx.thread.state = "READY";
				cheerpjSchedule();
			}
			return true;
		}
		else if(mode == "s")
		{
			if(isFile)
				fileRef.fileData = null;
			else
			{
				// Add this new object to the parent Path
				var childPath = path.substring(parentPath.length);
				assert(childPath[0]=='/');
				assert(parentRes.contents);
				parentRes.contents.push(childPath);
				store.put(parentRes, parentPath);
				var inodeReq = store.get("");
				assert(inodeReq.readyState != "done");
				inodeReq.onerror = idbTrap;
				inodeReq.onsuccess = function()
				{
					var curInodeId = this.result.nextInode++;
					store.put(this.result, "");
					store.put({ type: "socket", contents:null, inodeId: curInodeId }, path);
					fileRef.fileData = new CheerpJFileData(mp, path, 0, curInodeId, /*S_IFSOCK*/0xc000 | /*0666*/0x1b6);
					fileRef.fileData.dirty = 1;
					fileRef.fileData.mount = mp.inodeOps;
					tx.thread.state = "READY";
					cheerpjSchedule();
				}
				return true;
			}
		}
		else
			debugger
		if(async)
		{
			tx.thread.state = "READY";
			cheerpjSchedule();
		}
		return false;
	}
	function gotParent(res, asyncThread)
	{
		var parentRes = res;
		if(!res || res.type != "dir")
		{
			// Parent directory does not exist or it's not a directory
			fileRef.fileData = null;
			if(asyncThread)
			{
				assert(asyncThread.state == "WAIT_FOR_DB");
				asyncThread.state = "READY";
				cheerpjSchedule();
			}
			return false;
		}
		idbAddDEntry(mp, parentPath, res);
		// The file may already exists
		var filePath = path.substr(parentPath.length);
		var fileIndex = res.contents.indexOf(filePath);
		if(fileIndex < 0)
		{
			return gotFile(parentRes, null, asyncThread !== null);
		}
		else
		{
			var req = store.get(path);
			assert(req.readyState != "done");
			req.thread = currentThread;
			req.onerror = idbTrap;
			req.onsuccess = function(e)
			{
				this.onerror = null;
				this.onsuccess = null;
				var res = this.result;
				gotFile(parentRes, res, true);
			}
			return true;
		}
	}
	var cachedDE = idbCheckDEntry(mp, parentPath);
	var doAsync = false;
	if(cachedDE)
	{
		doAsync = gotParent(cachedDE, null);
	}
	else
	{
		// Find the parent
		var req = a.req = store.get(parentPath);
		assert(req.readyState != "done");
		if(req.readyState == "done")
			doAsync = gotParent(null, null);
		else
		{
			req.thread = currentThread;
			req.onerror = idbTrap;
			req.onsuccess = function(e) { this.onerror = null; this.onsuccess = null; gotParent(this.result, this.thread); }
			doAsync = true;
			assert(req.readyState != "done");
		}
	}
	if(doAsync)
	{
		a["pc"]=2;
		currentThread.state = "WAIT_FOR_DB";
		// Go back to the caller
		buildContinuations(a, false);
		throw "CheerpJContinue";
		a.pc=2;;
	}
	// The returned value may be null if the file can't be created
	return fileRef.fileData;
}

function idbReadAsync(fileData, fileOffset, buf, off, len, flags, p)
{
	var chunkSize = 1024*1024;
	var curChunk = fileOffset / chunkSize | 0;
	if(fileOffset + len > fileData.length)
		len = fileData.length - fileOffset;
	if(len==0)
		return -1;
	var endChunk = (fileOffset + len) / chunkSize | 0;
	var fileRef={cheerpjDownload:null};
	while(len && curChunk <= endChunk){
		assert(fileData.chunks[curChunk]);
		var curChunk = curChunk+1|0;
	}
	// All chunks are now loaded
	var curChunk = fileOffset / chunkSize | 0;
	var curOffset = fileOffset - (curChunk*chunkSize) | 0;
	var i=0;
	while(i<len)
	{
		var c = fileData.chunks[curChunk];
		if((len-i) < (chunkSize-curOffset))
			chunkSize = curOffset+(len-i);
		for(var j=curOffset;j<chunkSize;j++)
		{
			buf[off+i|0]=c[j];
			i++;
		}
		curChunk++;
		curOffset=0;
	}
	assert(i==len);
	return len;
}

function idbWriteAsync(fileData, fileOffset, buf, off, len, p)
{
	var chunkSize = 1024*1024;
	var curChunk = fileOffset / chunkSize | 0;
	var endChunk = (fileOffset + len) / chunkSize | 0;
	// Create all chunks first
	while(curChunk <= endChunk)
	{
		if(fileData.chunks[curChunk])
		{
			var curChunk = curChunk+1|0;
			continue;
		}
		fileData.chunks[curChunk]=new Uint8Array(chunkSize);
		curChunk = curChunk+1|0;
	}
	var curChunk = fileOffset / chunkSize | 0;
	var curOffset = fileOffset - (curChunk*chunkSize) | 0;
	var i=0;
	while(i<len)
	{
		var c = fileData.chunks[curChunk];
		if((len-i) < (chunkSize-curOffset))
			chunkSize = curOffset+(len-i);
		for(var j=curOffset;j<chunkSize;j++)
		{
			c[j]=buf[off+i|0];
			i++;
		}
		curChunk++;
		curOffset=0;
	}
	assert(i==len);
	if((fileOffset+len|0) > fileData.length)
	{
		fileData.length = fileOffset + len | 0;
	}
	return len;
}

function idbCommitFileData(fileData, p)
{
	var mp = fileData.parent;
	assert(mp.hasReadWrite);
	assert(fileData.dirty);
	var a={p:p,f:idbCommitFileData,pc:0,mp:mp};
	a.pc=0;idbEnsureDBConnection(mp, a);
	// We get here after dbConnection is valid
	var tx = a.tx = mp.dbConnection.transaction("files", "readwrite");
	var store = a.store = tx.objectStore("files");
	var contents = new Uint8Array(fileData.length);
	var chunkSize = 1024*1024;
	var curChunk = 0;
	for(var i=0;i<fileData.length;)
	{
		var c = fileData.chunks[curChunk];
		if(fileData.length - i < chunkSize)
			c = c.subarray(0, fileData.length-i)
		contents.set(c, i);
		curChunk++;
		i += c.length;
	}
	fileData.dirty = 0;
	store.put({ type: "file", contents:contents, inodeId: fileData.inodeId }, fileData.path);
	// Eventually this will be synced, do not wait for tx end
}

function idbIoctlAsync()
{
	return -22;
}

function idbEnsureDBConnection(mp, p)
{
	if(mp.dbConnection == null){
		// Async connection to the DB
		var openResult = indexedDB.open("cjFS_"+mp.mountPoint);
		assert(openResult.readyState != "done");
		openResult.thread = currentThread;
		openResult.folder = mp;
		openResult.onerror = idbTrap;
		openResult.onsuccess = function(e)
		{
			this.onerror = null;
			this.onsuccess = null;
			this.onupgradeneeded = null;
			this.thread.state = "READY";
			this.folder.dbConnection = this.result;
			cheerpjSchedule();
		}
		openResult.onupgradeneeded = function(e)
		{
			this.onerror = null;
			this.onsuccess = null;
			this.onupgradeneeded = null;
			var db = this.result;
			db.onerror = idbTrap;
			db.onabort = idbTrap;
			db.onclose = idbTrap;
			db.onversionchange = idbTrap;
			var store=db.createObjectStore("files");
			// Initialize the root dir
			var req = store.add({ type: "dir", contents:[], inodeId: 1, nextInode:2 }, "");
			assert(req.readyState != "done");
			// TODO: What if this fails?
			req.onabort = idbTrap;
			this.transaction.oncomplete = function()
			{
				this.oncomplete = null;
				openResult.thread.state = "READY";
				openResult.folder.dbConnection = this.db;
				cheerpjSchedule();
			}
		}
		currentThread.state = "WAIT_FOR_DB";
		buildContinuations(p, false);
		throw "CheerpJContinue";
	}
}

var IdbOps = { statAsync: idbStatAsync, listAsync: idbListAsync, makeFileData: idbMakeFileData, createDirAsync: idbCreateDirAsync, loadAsync: null };
var IdbInodeOps = { readAsync: idbReadAsync, writeAsync: idbWriteAsync, ioctlAsync: idbIoctlAsync, commitFileData: idbCommitFileData };

function CheerpJStringFolder(mp)
{
	CheerpJFolder.call(this, mp);
	this.mountOps = StrOps;
	this.files = {};
}

CheerpJStringFolder.prototype = Object.create(CheerpJFolder.prototype);

function strStatAsync(mp, path, fileRef, p)
{
	if(mp.files.hasOwnProperty(path))
	{
		fileRef.fileLength = mp.files[path].length;
		fileRef.permType = /*S_IFREG*/0x8000 | /*0444*/0x124;
	}
	else
	{
		fileRef.permType = 0;
	}
}

function strLoadAsync(mp, path, fileRef, p)
{
	assert(mp.files.hasOwnProperty(path));
	var str = mp.files[path];
	var ret = new Uint8Array(str.length);
	for(var i=0;i<str.length;i++)
		ret[i] = str.charCodeAt(i);
	fileRef.cheerpjDownload = ret;
}

var StrOps = { statAsync: strStatAsync, listAsync: null, makeFileData: null, createDirAsync: null, loadAsync: strLoadAsync };

function CheerpJDevFolder(mp, basePath)
{
	CheerpJFolder.call(this, mp);
	this.mountOps = DevOps;
	this.inodeOps = null;
	this.hasReadWrite = true;
	this.devMap = {};
	// Reserve inode 1 for random/urandom
	this.nextInode = 2;
}

CheerpJDevFolder.prototype = Object.create(CheerpJFolder.prototype);

CheerpJDevFolder.prototype.addDevice=function(name, read, write, ioctl)
{
	this.devMap[name] = { readAsync: read, writeAsync: write, ioctlAsync: ioctl, commitFileData: null, inodeId: this.nextInode};
	this.nextInode = this.nextInode + 1 | 0;
}

function devStatAsync(mp, path, fileRef, p)
{
	if(path == "/random" || path == "/urandom")
	{
		fileRef.permType = /*S_IFCHR*/0x2000 | /*0666*/0x1b6;
	}
	else
	{
		fileRef.permType = 0;
	}
}

function devMakeFileData(mp, path, mode, p)
{
	var fileData = null;
	if(path == "/random" || path == "/urandom")
	{
		fileData = new CheerpJFileData(mp, path, 0xffffffff, 1, /*S_IFCHR*/0x2000 | /*0666*/0x1b6);
		fileData.mount = DevRandomInodeOps;
	}
	else if(mp.devMap.hasOwnProperty(path))
	{
		fileData = new CheerpJFileData(mp, path, 0xffffffff, mp.devMap[path].inodeId, /*S_IFCHR*/0x2000 | /*0666*/0x1b6);
		fileData.mount = mp.devMap[path];
	}
	return fileData;
}

function devRandomRead(fileData, fileOffset, buf, off, len, flags, p)
{
	var path = fileData.path;
	// TODO: This is very unsafe! Math.random() is not ok for true randomness
	for(var i=0;i<len;i++)
		buf[off+i|0] = Math.random()*0x100;
	return len;
}

var DevRandomInodeOps = { readAsync: devRandomRead, writeAsync: null, ioctlAsync: null, commitFileData: null };

var DevOps = { statAsync: devStatAsync, listAsync: null, makeFileData: devMakeFileData, createDirAsync: null, loadAsync: null };

function conReadAsync(fileData, fileOffset, buf, off, len, flags, p)
{
	return fileData.inCallback(fileData.param, fileOffset, buf, off, len, p);
}

function conWriteAsync(fileData, fileOffset, buf, off, len, p)
{
	return fileData.outCallback(fileData.param, fileOffset, buf, off, len, p);
}

function conIoctlAsync()
{
	return -22;
}

var ConInodeOps = { readAsync: conReadAsync, writeAsync: conWriteAsync, ioctlAsync: conIoctlAsync, commitFileData: null };

function cheerpjCreateConsole(param, inCallback, outCallback)
{
	var fileData = new CheerpJFileData(null, null, 0, 0, /*S_IFCHR*/0x2000 | /*0666*/0x1b6);
	fileData.mount = ConInodeOps;
	// Add custom fields
	fileData.inCallback = inCallback;
	fileData.outCallback = outCallback;
	fileData.param = param;
	return fileData;
}

function bufReadAsync(fileData, fileOffset, buf, off, len, flags, p)
{
	if(fileData.rqueue.length == 0)
	{
		if(flags & 00004000/*O_NONBLOCK*/)
			return /*EAGAIN*/-11;
		else
		{
			var a={p:p,f:bufReadAsync,pc:0,fileData:fileData,buf:buf,off:off,len:len};
			fileData.waitThread = currentThread;
			a.pc=0;cheerpjPauseThread(a);
		}
	}
	var b = fileData.rqueue.shift();
	if(b == null)
	{
		// EOF, put a null back
		fileData.rqueue.push(null);
		return 0;
	}
	assert(len >= b.length);
	for(var i=0;i<b.length;i++)
		buf[i+off|0] = b[i];
	return b.length;
}

function bufWriteAsync(fileData, fileOffset, buf, off, len, p)
{
	// TODO: Skipping 0 sized chunks should not happen for datagrams
	if(len == 0)
		return len;
	var b = new Uint8Array(buf.subarray(off,off+len));
	fileData.dirty = 1;
	fileData.wbuffer.rqueue.push(b);
	if(fileData.wbuffer.waitThread)
	{
		cheerpjWakeThread(fileData.wbuffer.waitThread);
		fileData.wbuffer.waitThread = null;
	}
	return len;
}

function bufCommitFileData(fileData, p)
{
	// Use to know when all fds to the writing side are closed
	if(fileData.wbuffer == null)
		return;
	// Add a null to the rqueue to signal EOF
	fileData.wbuffer.rqueue.push(null);
}

var BufferOps = { readAsync: bufReadAsync, writeAsync: bufWriteAsync, ioctlAsync: null, commitFileData: bufCommitFileData };

function cheerpjCreateBuffer(rqueue, wbuffer)
{
	var fileData = new CheerpJFileData(null, null, 0, 0, /*S_IFSOCK*/0xc000 | /*0666*/0x1b6);
	fileData.mount = BufferOps;
	// Add custom fields
	fileData.rqueue = rqueue;
	fileData.wbuffer = wbuffer;
	fileData.waitThread = null;
	fileData.externalData = null;
	return fileData;
}

var NullOps = { readAsync: null, writeAsync: null, ioctlAsync: null, commitFileData: null }

// TODO: Remove this
function cheerpOSCreateExternal(externalData)
{
	var fileData = new CheerpJFileData(null, null, 0, 0, /*S_IFSOCK*/0xc000 | /*0666*/0x1b6);
	fileData.mount = NullOps;
	// Add custom fields
	fileData.externalData = externalData;
	return fileData;
}

function cheerpjDefaultConsoleWrite(param, fileOffset, buf, off, len, p)
{
	// Console output, either to debug console or DOM console
	var strBytes = ""
	for(var i=0;i<len;i++)
		strBytes += String.fromCharCode(buf[i+off]&0xff);
	var c = document.getElementById("console");
	if(c)
		c.textContent += strBytes;
	else
		console.log(strBytes);
	return len;
}

function cheerpjAddStringFile(name, str)
{
	var mount = cheerpjGetFSMountForPath(name);
	assert(mount instanceof CheerpJStringFolder);
	mount.files[name.substr(mount.mountPoint.length-1)] = str;
	delete cjFileCache[name];
}

function cheerpjGetFSMountForPath(path)
{
	for(var i=0;i<cheerpjFSMounts.length;i++)
	{
		var mount = cheerpjFSMounts[i];
		if(path.startsWith(mount.mountPoint))
			return mount;
	}
	debugger
	return null;
}

function cheerpjLoadFileAsync(path_, fileRef, p)
{
	var path = cheerpjNormalizePath(path_)
	var mount = cheerpjGetFSMountForPath(path);
	mount.mountOps.loadAsync(mount, path.substr(mount.mountPoint.length-1), fileRef, p);
}

function cheerpjStatFileAsync(path_, fileRef, p)
{
	var path = cheerpjNormalizePath(path_)
	var mount = cheerpjGetFSMountForPath(path);
	fileRef.parent = mount;
	mount.mountOps.statAsync(mount, path.substr(mount.mountPoint.length-1), fileRef, p);
}

function cheerpjListFilesAsync(path_, fileRef, p)
{
	var path = cheerpjNormalizePath(path_)
	var mount = cheerpjGetFSMountForPath(path);
	// Some backends (like Web) do not implement list
	if(!mount.mountOps.listAsync)
		return;
	mount.mountOps.listAsync(mount, path.substr(mount.mountPoint.length-1), fileRef, p);
}

function cheerpjCreateDirAsync(path_, fileRef, p)
{
	var path = cheerpjNormalizePath(path_)
	var mount = cheerpjGetFSMountForPath(path);
	mount.mountOps.createDirAsync(mount, path.substr(mount.mountPoint.length-1), fileRef, p);
}

// Contains CheerpJFileData entries
var cjFileCache = {};
// {fileData:<cacheEntry>, offset: 0, flags: 0}
var cjFDs = [undefined,undefined,undefined];

function cheerpjOpenAsync(path_, mode, p)
{
	var fileData = null;
	// TODO: Support cwd
	if(path_[0] != '/')
		path = "/files/" + path;
	var savedFDs = cjFDs;
	var path = cheerpjNormalizePath(path_)
	if(cjFileCache.hasOwnProperty(path))
		fileData = cjFileCache[path];
	else
	{
		var mount = cheerpjGetFSMountForPath(path);
		var fileRef = {};
		var a={p:p,f:cheerpjOpenAsync,pc:0,fileRef:fileRef,path:path,mount:mount,savedFDs:savedFDs};
		if(mount.hasReadWrite)
		{
			assert(mount.mountOps.makeFileData);
			a.pc=0;var fileData=mount.mountOps.makeFileData(mount, path.substr(mount.mountPoint.length-1), mode, a);
			if(fileData == null)
				return -1;
		}else{
			if(mode != "r" || mount.mountOps.loadAsync===null)
				return -1;
			a.pc=1;mount.mountOps.loadAsync(mount, path.substr(mount.mountPoint.length-1), fileRef, a);
			if(fileRef.cheerpjDownload==null)
				return -1;
			fileData = new CheerpJFileData(mount, path.substr(mount.mountPoint.length-1), fileRef.cheerpjDownload.length|0, fileRef.inodeId|0, /*S_IFREG*/0x8000 | /*0666*/0x1b6);
			fileData.data = fileRef.cheerpjDownload;
		}
		cjFileCache[path] = fileData;
	}
	fileData.refCount=fileData.refCount+1|0;
	var newFD = {fileData: fileData, offset: 0, flags: 0};
	for(var i=0;i<savedFDs.length;i++)
	{
		if(savedFDs[i]===null)
		{
			savedFDs[i] = newFD;
			return i;
		}
	}
	savedFDs.push(newFD);
	return savedFDs.length-1|0;
}

function cheerpjReadAsync(fd, buf, off, len, p)
{
	;var fdObj = cjFDs[fd];
	assert(fdObj);
	if(fdObj.fileData.mount)
	{
		var a={p:p,f:cheerpjReadAsync,pc:0,fdObj:fdObj};
		a.pc=0;var ret=fdObj.fileData.mount.readAsync(fdObj.fileData, fdObj.offset, buf, off, len, fdObj.flags, a);
		if(ret<0)
			return ret;
		fdObj.offset = fdObj.offset + ret|0;
		return ret;
	}else{
		if(len > fdObj.fileData.data.length - fdObj.offset)
			len = fdObj.fileData.data.length - fdObj.offset;
		if(len == 0)
			return -1;
		for(var i=0;i<len;i++)
			buf[off+i|0] = fdObj.fileData.data[fdObj.offset+i|0];
		fdObj.offset = fdObj.offset + len|0;
		return len;
	}
}

function cheerpjWriteAsync(fd, buf, off, len, p)
{
	if(fd < 0)
		return -1;
	var fdObj = cjFDs[fd];
	assert(fdObj);
	assert(fdObj.fileData.mount);
	var a={p:p,f:cheerpjWriteAsync,pc:0,fdObj:fdObj};
	a.pc=0;var ret=fdObj.fileData.mount.writeAsync(fdObj.fileData, fdObj.offset, buf, off, len, a);
	fdObj.offset = fdObj.offset + ret|0;
	return ret;
}

function cheerpOSIoCtlAsync(fd, cmd, argVal, argBuffer, argOffset, p)
{
	if(fd < 0)
		return;
	var fdObj = cjFDs[fd];
	assert(fdObj);
	if(!fdObj.fileData.mount)
		return -22;
	var a={p:p,f:cheerpOSIoCtlAsync,pc:0,fdObj:fdObj};
	a.pc=0;var ret=fdObj.fileData.mount.ioctlAsync(fdObj.fileData, cmd, argVal, argBuffer, argOffset, a);
	return ret;
}

var cjGraceTimeQueue = []

function cjGraceTimeExpire()
{
	// Only get the first item on the queue
	assert(cjGraceTimeQueue.length);
	var fileData = cjGraceTimeQueue.shift();
	if(fileData.refCount > 0)
	{
		// The file has been resurrected
		return;
	}
	// File dead, free the memory
	for(var f in cjFileCache)
	{
		if(fileData == cjFileCache[f])
		{
			delete cjFileCache[f];
			break;
		}
	}
}

function cheerpjCloseAsync(fd, p)
{
	if(fd==-1)
		return;
	var fdObj = cjFDs[fd];
	assert(fdObj);
	var fileData = fdObj.fileData;
	// No fileData may be there for FDs which are not files
	if(fileData)
	{
		fileData.refCount = fileData.refCount-1|0;
		if(fileData.refCount===0)
		{
			// Commit the data immediately to ensure persistence
			if(fileData.dirty)
			{
				var a={p:p,f:cheerpjCloseAsync,pc:0,fd:fd,fileData:fileData}
				a.pc=0;fileData.mount.commitFileData(fileData, a);
			}
			// Put the cached file in the queue, and give it a 10 sec grace time before freeing the memory
			cjGraceTimeQueue.push(fileData);
			setTimeout(cjGraceTimeExpire, 10000);
		}
	}
	cjFDs[fd] = null;
}

function cheerpjGetFileDesc(fd, p)
{
	var fdObj = cjFDs[fd];
	assert(fdObj);
	return fdObj;
}

function cheerpjPauseThread(p)
{
	var thisThread = currentThread;
	buildContinuations(p, false);
	currentThread.state = "BLOCKED_WAIT";
	throw "CheerpJContinue";
}

function cheerpjWakeThread(t)
{
	assert(t.state == "BLOCKED_WAIT");
	t.state = "READY";
}