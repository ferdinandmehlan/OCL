/*define(function(require, exports, module) {
    var caption = "OCL";
    var extension = "ocl";
    var captionLowerCase = "OCL".toLowerCase();
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


        function onHandlerRegistered(error, worker) {
            if(error) return console.error(error);

            function onAnalyzed() {
                UICustom.done(messageIndex, editor);
                worker.emit("onAnalyzed");
            }

            function onAnalyze() {
                var tab = TabManager.focussedTab;

                if(tab) {
                    var document = tab.document;

                    editor = tab.editor;
                    if(messageIndex > -1) UICustom.done(messageIndex, editor);
                    messageIndex = UICustom.message("Analyzing File...", editor);
                    parent.cheerpjRunMain("ocl.cli.OCLCDTool",
                        "/app/ocl-1.2.2-cli.jar", "-ocl", document.value,
                        "-logErrTo", "errors.log", "-parseOnly").then(onAnalyzed);
                }
            }

            worker.on("onAnalyze", onAnalyze);
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
});*/

define(function(require, exports, module) {
    var Language = require("plugins/se.rwth.api.language/language");

    return Language("OCL", "ocl");
});