define(function(require, exports, module) {
    return function(caption, version) {
        var captionLowerCase = caption.toLowerCase();
        var pluginPath = "plugins/se.rwth.language." + captionLowerCase;
        var staticPath = "/static/" + pluginPath;

        var baseHandler = require("plugins/c9.ide.language/base_handler");
        var handler = Object.create(baseHandler);
        var emitter = null;

        var Module = {};

        var callbacks = [];

        function toAbsolutePath(relativePath, callback) {
            var eventName = "toAbsolutePath:" + relativePath;

            emitter.once(eventName, callback);
            emitter.emit("toAbsolutePath", relativePath);
        }

        function importScriptsEx(relativePath, callback) {
            function onAbsolutePath(absolutePath) {
                callback = callback || function() {};
                importScripts(absolutePath);
                callback();
            }

            toAbsolutePath(relativePath, onAbsolutePath);
        }

        function instantiateWasm(imports, callback) {
            function onInstantiate(instance) {
                callback(instance);
            }

            function onError(error) {
                console.error("An error occurred while instantiating the WebAssembly module:");
                console.error(error);
            }

            function onAbsolutePath(absolutePath) {
                instantiateCachedURL(version, absolutePath, imports).then(onInstantiate).catch(onError);
            }

            toAbsolutePath(staticPath + "/gen/" + captionLowerCase + ".wasm", onAbsolutePath);
            return {};
        }

        function executeCallbacks(docValue) {
            var length = callbacks.length;

            for(var i = 0; i < length; i++) {
                handleParse(docValue, callbacks[i]);
            }
        }


        function onModuleLoaded() {
            Module = self[caption](BaseModule);
        }

        function onBaseModuleLoaded() {
            BaseModule.onRuntimeInitialized = onRuntimeInitialized;
            BaseModule.instantiateWasm = instantiateWasm;
        }

        function onRuntimeInitialized() {
            var doc = handler.doc;
            var docValue = doc.getValue();

            emitter.emit("onRuntimeInitialized");
            executeCallbacks(docValue);
        }


        function init(callback) {
            emitter = handler.getEmitter();

            callback(null);
            importScriptsEx("/static/plugins/se.rwth.api.webassembly/lib/wasm-utils.js");
            importScriptsEx("/static/plugins/se.rwth.api.webassembly/module.js", onBaseModuleLoaded);
            importScriptsEx(staticPath + "/gen/" + captionLowerCase + ".js", onModuleLoaded);
        }

        function handlesLanguage(language) {
            return language === pluginPath + "/modes/" + captionLowerCase;
        }

        function parse(docValue, options, callback) {
            if(Module.parse) handleParse(docValue, callback);
            else callbacks.push(callback);
        }

        function handleParse(docValue, callback) {
            emitter.emit("onParse");

            console.debug("Parse");
            console.time("Parse");
            Module.parse(docValue);
            console.timeEnd("Parse");

            emitter.emit("onParsed");
            callback();
        }

        function analyze(docValue, ast, options, callback) {
            handleAnalyze(callback);
        }

        function handleAnalyze(callback) {
            var analyzes = Module.analyze();

            console.debug("Analyze:");
            console.debug(analyzes);

            callback(null, analyzes);
        }

        function outline(doc, ast, callback) {
            handleOutline(callback);
        }

        function handleOutline(callback) {
            var outline = { items: Module.outline() };

            console.debug("Outline:");
            console.debug(outline);

            callback(null, outline);
        }

        handler.init = init;
        handler.handlesLanguage = handlesLanguage;
        handler.parse = parse;
        handler.analyze = analyze;
        handler.outline = outline;

        return handler;
    };
});