## Virtual File System
A Virtual File System (VFS), in the context of this Online IDE, denotes a file system which is
located in the web browser. To this end, read and write operations are mapped onto operations
which interact with the Storage API of the browser in order to simulate common operations on
files and directories. The Storage API used in this case is the IndexedDB API.

IndexedDB has the advantage that Storage API restrictions like quota or value length are less
strict than in the case of, for example, the LocalStorage API. Furthermore, each path can be
mapped to exactly one entry in a database's table. An IndexedDB database is uniquely
identified by its name. In the following, this name is referred to as `MountPoint` and is of
the structure `username/reponame/branchname` where `username` is the owner of the repository with
the name `reponame` which has a branch with name `branchname`. The only exceptions to this
nomination are Demos which are of the structure `EmbeddedMontiArc/Demos/demoname` where
`demoname` is the name of the ZIP archive without extension of a demo in the
[`Demos`](https://github.com/EmbeddedMontiArc/Demos) repository.

### Application Programming Interface (API)

#### VFS Module:
The most straightforward way to interact with the VFS is via `VFS.js`, a JavaScript file which
uses a variant of the Module Pattern to declare a `VFS` Module. The `VFS` Module builds upon
[BrowserFS](https://github.com/jvilk/BrowserFS) and remaps its function signatures to be
more or less compatible with the ones expected by Cloud9 plugins which make use of the
[fs](https://apidoc.c9.io/c9v3/#!/api/fs) plugin. Furthermore, it implements missing functions
and relaxes some of the restrictions imposed by some of the functions. The `VFS` Module can
also be used in scripts which are executed inside an iframe, as long as the iframe's source
shares the same origin as the website on which the VFS has been instantiated.

A VFS mounted on `mountPoint` can be retrieved by executing `VFS(mountPoint)` and has to be
readied using the `init` method which expects a callback to be passed as argument. Once the
callback of `init` has been executed, the preparations are completed and the VFS is ready for
operations.

As an example, one could imagine the following situation. A website with domain name
`peterapis.com` has instantiated a VFS with `mountPoint` `Peter/API/master` and has created
a file with path `/messages/demo.txt` and content `Hello World!`. The same website opens an
iframe with the following content:

```
...
<script src="/resources/js/production/browserfs.min.js"></script>
<script src="/resources/js/development/shared/VFS.js"></script>
<script>
    var vfs = VFS("Peter/API/master");
    
    function onReadFile(error, content) {
        if(error) console.error(error);
        else alert(content);
    }
    
    function onInit(error) {
        if(error) console.error(error);
        else vfs.readFile("/messages/demo.txt", onReadFile);
    }
    
    vfs.init(onInit);
</script>
...
```

where `browserfs.min.js` and `VFS.js` are located in their respective folders. The execution
of the above snippet results in the display of an alert with message `Hello World!`.

#### static.html:
As previously established, the files and directories of the VFS are living in the storage of
the web browser. As a consequence, a file's content cannot be accessed via a URL like it could
be in the case of the file being statically provided by a server. However, in some cases
(iframe, object, ...), it is necessary to have such an access. For this reason,
[vonwenckstern](https://github.com/vonwenckstern) had an idea which enables this access via a
URL.

This idea has been implemented under the form of `api/static.html` or for short `static.html`.
Much like in the case of a PHP script, a query string can be passed to `static.html` in order
to control its behavior. In this case, the query string is of the form:

```
?method=method&argument1=value1&...&argumentN=valueN
```

Currently supported methods are:

##### raw:
`raw` is a method which makes the content of a file available via a URL without alterations. In
order to specify which file's content should be loaded, a developer has to supply two
arguments. First, she has to supply a `mountPoint` according to the previously described
scheme. Second, she has to supply a `path` to the file in question.

As an example, one could consider the following situation. A developer wants to load the
content of a file `/src/html/index.html` from a Mount Point `Peter/API/master` into an
iframe. In order to accomplish this task, her code would look like this:

```
...
<iframe src="/static.html?method=raw&mountPoint=Peter/API/master&path=/src/html/index.html">
...
</iframe>
... 
```

##### rawurlrewrite:
`rawurlrewrite`, as the name suggests, performs the same task as raw with the addition that
URLs which may point to a resource in the VFS are rewritten in the previously described
manner. The use of the word "may" is intended, as there is no reliable way to distinguish
between resources located and statically provided on and by the server and resources located
in the VFS. Furthermore, in order to distinguish between HTML attributes and URLs, a list
for file extensions has been introduced. `rawurlrewrite` accepts three arguments. The first
two are the same as in the case of `raw` namely `mountPoint` and `path`. The third one is an
optional argument `radix` which can be used to prepend a radix to the `path` of the rewritten
URLs.

As an example, one could consider the following situation. In the VFS with `mountPoint`
`Peter/API/master`, there is a file `/src/html/index.html` which looks as follows:

```
...
<a href="secret.html">Do NOT click!</a>
...
```

The `secret.html` to which the anchor points has `/src/html/secret.html` as `path` in the VFS.
Loading `index.html` into an iframe as follows:

```
...
<iframe src="/static.html?method=rawurlrewrite&mountPoint=Peter/API/master&path=/src/html/index.html&radix=/src/html/">
...
</iframe>
...
```

will cause `secret.html` in the anchor to be replaced by:

```
/static.html?method=rawurlrewrite&mountPoint=Peter/API/master&path=/src/html/secret.html&radix=/src/main/html
```

Due to the way `static.html` works, it is highly discouraged to use this part of the API
unless it is really necessary!

Currently on the list of file extensions are:

.html, .svg

#### load.html:
`api/load.html` or for short `load.html` is an API which can be seen as interface between the
Online IDE and the VFS. First, it fills a VFS from a URL pointing to a ZIP archive holding
the files of the workspace. Then, it redirects to and opens an optionally provided path in the
Online IDE. `load.html` accepts three parameters which, much like in the case of
`static.html`, have to be passed as query string. First, a developer has to provide a
**__unique__** `mountPoint` on which the VFS will be mounted. Second, a `url` to the ZIP
archive may also be passed. Lastly, a developer may also pass further arguments which will
be handed over to `ide.html` once a user will be redirected.

As an example, one could consider the following scenario. A ZIP archive is provided on a URL
`peterapis.com/demo.zip` and holds a file with path `/demo/HelloWorld.txt`. A developer now
wants to provide a clickable link to load the content of this archive into a VFS mounted on
`Peter/API/demo` and open the previously mentioned file in the Online IDE. To this end, she
would have to provide something along these lines:

```
...
<a href="/api/load.html?mountPoint=Peter/API/demo&url=peterapis.com/demo.zip&openFile=/demo/HelloWorld.txt">Open in Online IDE</a>
...
```

In a new update to this API, the specification of a URL is no longer mandatory. Leaving this
parameter empty will lead to an empty workspace in the Online IDE if the `mountPoint` does
not exist.