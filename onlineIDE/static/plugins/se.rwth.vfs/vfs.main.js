define(function(require, exports, module) {
    main.consumes = ["Plugin", "fs", "tabManager"];
    main.provides = ["vfs.main"];
    return main;

    function main(options, imports, register) {
        var Plugin = imports.Plugin;
        var fs = imports.fs;
        var tabManager = imports.tabManager;

        var plugin = new Plugin("SE RWTH", main.consumes);
        var pluginInformation = { "vfs.main": plugin };
        var emit = plugin.getEmitter();

        var mainFile = null;

        function onPluginLoad(error) {
            if(error) console.error(error);
            else fs.exists("/.c9/editor/main", onExists);
        }

        function onExists(exists) {
            if(exists) fs.readFile("/.c9/editor/main", onReadFile);
        }

        function onReadFile(error, content) {
            if(error) console.error(error);
            else handleContent(content);
        }

        function handleContent(content) {
            var path = '/' + content.replace(/\./g, '/');
            var index = path.lastIndexOf('/');
            var subPath = path.substr(0, index + 1);

            mainFile = path;

            fs.readdir(subPath, onReadDir);
            emit("onReadFile", content);
        }

        function onReadDir(error, contents) {
            if(error) console.error(error);
            else handleContents(contents);
        }

        function handleContents(contents) {
            var length = contents.length;

            for(var i = 0; i < length; i++) {
                var content = contents[i];
                var path = content.fullPath;

                if(path.indexOf(mainFile) > -1) {
                    tabManager.openFile(path, true, onOpenFile);
                    break;
                }
            }
        }

        function onOpenFile(error) {
            if(error) console.error(error);
            else emit("onOpenFile");
        }

        plugin.on("load", onPluginLoad);
        register(null, pluginInformation);
    }
});