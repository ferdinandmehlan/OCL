var GitHubVFS = function(ownername, reponame, branchname, username, password) {
    var CONSTANTS = {
        URL: "http://www.se-rwth.de/~vonwenckstern/fetch.php",
        RADIX: reponame + '-' + branchname
    };

    var properties = {
        vfs: null
    };

    var methods = {
        init: function(callback) {
            var mountPoint = ownername + '/' + reponame + '/' + branchname;
            var inTrashbin = Trashbin.has(mountPoint);

            properties.vfs = VFS(mountPoint);

            if(inTrashbin) {
                Trashbin.remove(mountPoint);
                return callback(null);
            }

            function onInit(error) {
                if(error) callback(error);
                else methods.load(callback);
            }

            properties.vfs.init(onInit);
        },

        load: function(callback) {
            var username = username || "";
            var password = password || "";
            var data = { owner: ownername, repo: reponame, ref: branchname, username: username, password: password };
            var body = JSON.stringify(data);
            var parameters = { method: "post", body: body };

            function onArrayBuffer(buffer) {
                methods.handleBuffer(buffer, callback);
            }

            function onResponse(response) {
                response.arrayBuffer().then(onArrayBuffer).catch(callback);
            }

            Loader.show("Downloading...");
            fetch(CONSTANTS.URL, parameters).then(onResponse).catch(callback);
        },

        handleBuffer: function(buffer, callback) {
            function onLoad(contents) {
                Loader.message("Preparing Virtual File System...");
                methods.handleContents(contents.files, callback);
            }

            Loader.message("Unzipping...");
            JSZip.loadAsync(buffer, { createFolders: true }).then(onLoad).catch(callback);
        },

        handleContents: function(contents, callback) {
            var paths = Object.getOwnPropertyNames(contents);
            var length = paths.length;
            var partitions = [];

            for(var i = 0; i < length; i++) {
                var path = paths[i];
                var content = contents[path];
                var occurrences = Utilities.occurrences(path, '/');
                var level = Math.max(0, occurrences - 1);
                var partition = partitions[level] || (partitions[level] = []);

                partition.push(content);
            }

            methods.handlePartitions(partitions, callback);
        },

        handlePartitions: function(partitions, callback) {
            var partition = partitions.shift();

            function onHandle(error) {
                var partition = partitions.shift();

                if(error) callback(error);
                else if(partition === undefined) callback(null);
                else methods.handlePartition(partition, onHandle);
            }

            methods.handlePartition(partition, onHandle);
        },

        handlePartition: function(partition, callback) {
            var files = partition.filter(filterFiles);
            var directories = partition.filter(filterDirectories);

            function onHandle(error) {
                if(error) callback(error);
                else methods.handleFiles(files, callback);
            }

            function filterDirectories(content) {
                return content.dir === true;
            }

            function filterFiles(content) {
                return content.dir === false;
            }

            methods.handleDirectories(directories, onHandle);
        },

        handleFiles: function(files, callback) {
            var length = files.length;
            var loaded = 0;

            if(length === 0) callback(null);

            function onHandle(error) {
                if(error) callback(error);
                else if(++loaded === length) callback(null);
                else methods.updateMessage("Creating Files", length, loaded);
            }

            for(var i = 0; i < length; i++) {
                var file = files[i];

                methods.handleFile(file, onHandle);
            }

            methods.updateMessage("Creating Files");
        },

        handleDirectories: function(directories, callback) {
            var length = directories.length;
            var loaded = 0;

            function onHandle(error) {
                if(error) callback(error);
                else if(++loaded === length) callback(null);
                else methods.updateMessage("Creating Directories", length, loaded);
            }

            for(var i = 0; i < length; i++) {
                var directory = directories[i];

                methods.handleDirectory(directory, onHandle);
            }

            methods.updateMessage("Creating Directories");
        },

        handleFile: function(file, callback) {
            var path = file.name.replace(CONSTANTS.RADIX, '');

            function onWriteFile(error) {
                if(error && error.code !== "EEXIST") callback(error);
                else callback(null);
            }

            function onAsync(content) {
                properties.vfs.writeFile(path, content, onWriteFile, true);
            }

            file.async("string").then(onAsync).catch(callback);
        },

        handleDirectory: function(directory, callback) {
            var path = directory.name.replace(CONSTANTS.RADIX, '');

            function onMkdir(error) {
                if(error && error.code !== "EEXIST") callback(error);
                else callback(null);
            }

            properties.vfs.mkdir(path, onMkdir);
        },

        updateMessage: function(task, length, loaded) {
            var message = "Preparing Virtual File System:<br/>" + task + "...";

            if(length) {
                var percentage = (loaded / length) * 100;
                var roundedPercentage = percentage >> 0;

                message += ' ' +  roundedPercentage + " %";
            }

            Loader.message(message);
        }
    };

    return methods;
};