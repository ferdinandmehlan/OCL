define(function(require, exports, module) {
    main.consumes = ["Plugin", "tabManager", "panels", "menus"];
    main.provides = ["api.url"];
    return main;

    function main(options, imports, register) {
        var Plugin = imports.Plugin;
        var tabManager = imports.tabManager;
        var panels = imports.panels;
        var menus = imports.menus;


        var plugin = new Plugin("SE RWTH", main.consumes);
        var pluginInformation = { "api.url": plugin };

        var API = {
            openFile: openFile,
            hideControls: hideControls
        };


        /*
         * openFile
         */
        function handleTabOpen(tab, line, column, next) {
            tab.editor.scrollTo(line, column);
            next();
        }

        function getOnTabOpen(line, column, next) {
            return function(error, tab) {
                if(error) console.error(error);
                else handleTabOpen(tab, line, column, next);
            }
        }

        function openFile(path) {
            var paths = path.split(',');

            function next() {
                if(paths.length > 0) {
                    var parts = paths.shift().trim().split(':');
                    var path = parts[0];
                    var line = parts[1] - 1 || 0;
                    var column = parts[2] - 1 || 0;
                    var callback = getOnTabOpen(line, column, next);

                    tabManager.openFile(path, true, callback);
                }
            }

            next();
        }

        /*
         * hideControls
         */
        function hideControls(toggles) {
            var bits = toggles.split(',');
            var bodies = document.getElementsByTagName("body");

            if(+bits[0] >= 1) menus.minimize();
            if(+bits[0] >= 2) bodies[0].style = "margin-top:-41px";
            if(+bits[1]) panels.disablePanel("outline");
            if(+bits[2]) {
                panels.disablePanel("commands.panel");
                panels.disablePanel("tree");
            }
        }

        /*
         * General
         */
        function executeQuery(query) {
            for(var method in query) {
                if(query.hasOwnProperty(method)) {
                    if(API.hasOwnProperty(method) === false) console.error("The requested method is not implemented!");
                    else API[method].call(null, query[method]);
                }
            }
        }

        function getQuery(queryString) {
            var pairs = queryString.split('&');
            var result = {};
            var length = pairs.length;

            for(var i = 0; i < length; i++) {
                var pair = pairs[i];
                var parts = pair.split('=');
                var key = parts[0];

                result[key] = parts[1];
            }

            return result;
        }

        function handleQueryString(queryString) {
            var query = getQuery(queryString);

            executeQuery(query);
        }

        function handleReady() {
            var href = window.location.href;
            var index = href.indexOf('?');
            var queryString = href.substr(index + 1, href.length - 1);

            if(index > -1) handleQueryString(queryString);
        }

        function onReady(error) {
            if(error) console.error(error);
            else handleReady();
        }

        function onPluginLoad(error) {
            if(error) console.error(error);
            else tabManager.on("ready", onReady);
        }


        plugin.on("load", onPluginLoad);
        register(null, pluginInformation);
    }
});