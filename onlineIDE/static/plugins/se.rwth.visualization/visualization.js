define(function(require, exports, module) {
    main.consumes = ["Plugin", "fs", "tabManager", "vfs.main"];
    main.provides = ["svg"];
    return main;

    function main(options, imports, register) {
        var Plugin = imports.Plugin;
        var fs = imports.fs;
        var tabManager = imports.tabManager;
        var vfsMain = imports["vfs.main"];

        var plugin = new Plugin("SE RWTH", main.consumes);
        var pluginInformation = { "svg": plugin };

        var mainFile = null;


        function onPluginLoad(error) {
            if(error) console.error(error);
            else handleLoad();
        }

        function handleLoad() {
            vfsMain.on("onReadFile", onReadFile, plugin);
            vfsMain.on("onOpenFile", onOpenFile, plugin);
        }

        function onReadFile(main) {
            var index = main.lastIndexOf('.');
            var prefix = main.substr(0, index + 1);
            var infix = main.substr(index + 1, 1);
            var suffix = main.substr(index + 2, main.length - 1);

            infix = infix.toLowerCase();
            mainFile = "/.c9/svg/" + prefix + infix + suffix + ".html";
        }

        function onOpenFile() {
            fs.exists(mainFile, onExists);
        }

        function onExists(exists) {
            if(exists) handleExists();
        }

        function handleExists() {
            var panes = tabManager.getPanes();
            var pane = panes[0];
            var mountPoint = getMountPoint();
            var options = {};

            options.pane = pane.vsplit(true);
            options.value = getURL(mountPoint, mainFile);
            options.editorType = "urlview";
            options.active = false;

            tabManager.open(options, onTabOpen);
        }

        function getMountPoint() {
            var username = localStorage.getItem("username");
            var reponame = localStorage.getItem("reponame");
            var branchname = localStorage.getItem("branchname");

            return username + '/' + reponame + '/' + branchname;
        }

        function getURL(mountPoint, path) {
            var queryString = "method=rawurlrewrite&mountPoint=" + mountPoint + "&path=" + path + "&radix=/.c9/svg/";

            return "api/static.html?" + queryString;
        }

        function onTabOpen(error, tab, done) {
            if(error) console.error(error);
            else handleTabOpen(tab);
        }

        function handleTabOpen(tab) {
            var document = tab.document;
            var session = document.getSession();
            var iframe = session.iframe;

            tab.title = "Visualization";
            iframe.style.backgroundColor = "#FFFFFF";
            iframe.style.marginTop = "1px";
            iframe.style.height = "calc(100% - 1px)"
        }


        plugin.on("load", onPluginLoad);
        register(null, pluginInformation);
    }
});