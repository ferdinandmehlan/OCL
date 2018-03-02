define(function(require, exports, module) {
    return function(caption, extension) {
        var captionLowerCase = caption.toLowerCase();
        var pluginName = "language." + captionLowerCase;
        var pluginPath = "plugins/se.rwth.language." + captionLowerCase;

        main.consumes = ["Plugin", "ace", "language", "ui.custom", "tabManager"];
        main.provides = [pluginName];
        return main;

        function main(options, imports, register) {
            var Plugin = imports.Plugin;
            var Ace = imports.ace;
            var Language = imports.language;
            var UICustom = imports["ui.custom"];
            var TabManager = imports.tabManager;

            var plugin = new Plugin("SE RWTH", main.consumes);
            var pluginInformation = {};

            var messageIndex = -1;
            var editor = null;
            var loaded = false;


            function onParse() {
                var tab = TabManager.focussedTab;

                if(tab) {
                    editor = tab.editor;
                    messageIndex = UICustom.message("Analyzing File...", editor);
                }
            }

            function onParsed() {
                UICustom.done(messageIndex, editor);
            }

            function onRuntimeInitialized() {
                UICustom.done(messageIndex, editor);
                Language.refreshAllMarkers();
            }

            function onHandlerRegistered(error, worker) {
                var tab = TabManager.focussedTab;

                if(error) return console.error(error);

                function onToAbsolutePath(relativePath) {
                    var absolutePath = window.location.protocol + "//" + window.location.host
                        + window.location.base + relativePath;
                    var eventName = "toAbsolutePath:" + relativePath;

                    worker.emit(eventName, absolutePath);
                }

                if(tab) {
                    editor = tab.editor;
                    messageIndex = UICustom.message("Loading WebAssembly...", editor);
                }

                worker.on("onParse", onParse);
                worker.on("onParsed", onParsed);
                worker.on("toAbsolutePath", onToAbsolutePath);
                worker.on("onRuntimeInitialized", onRuntimeInitialized);
            }

            function onBeforeOpen(event) {
                var tab = event.tab;

                if(loaded) return;
                if(!tab.path || !tab.path.endsWith(extension)) return;

                loaded = true;

                Ace.defineSyntax({
                    caption: caption,
                    name: pluginPath + "/modes/" + captionLowerCase,
                    extensions: extension
                });

                Language.registerLanguageHandler(pluginPath + "/worker/worker", onHandlerRegistered, plugin);
            }

            function onPluginLoad(error) {
                if(error) console.error(error);
                else TabManager.on("beforeOpen", onBeforeOpen);
            }


            pluginInformation[pluginName] = plugin;

            plugin.on("load", onPluginLoad);
            register(null, pluginInformation);
        }
    };
});