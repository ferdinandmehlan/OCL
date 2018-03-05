define(function(require, exports, module) {
    main.consumes = ["Plugin", "api.switch", "fs", "tabManager"];
    main.provides = ["api.ide"];
    return main;

    function main(options, imports, register) {
        var Plugin = imports.Plugin;
        var Switch = imports["api.switch"];
        var fs = imports.fs;
        var tabManager = imports.tabManager;
        var Cache = require("./cache.js");

        var plugin = new Plugin("SE RWTH", main.consumes);
        var pluginInformation = { "api.ide": plugin };
        var port = Switch.Port("api.ide");

        var API = {
            "fs": fs,
            "tabManager": tabManager
        };


        function getReference(string) {
            var matches = string.match(/{{-?\d+}}/);

            return matches ? matches[0] : null;
        }

        function handleArrayReplace(array) {
            var length = array.length;

            for(var i = 0; i < length; i++) {
                handleReplace(array[i], array, i);
            }
        }

        function handleObjectReplace(object) {
            for(var key in object) {
                if(object.hasOwnProperty(key)) {
                    handleReplace(object[key], object, key);
                }
            }
        }

        function handleStringReplace(entries, key) {
            var value = entries[key];
            var reference = getReference(value);

            if(reference && Cache.has(reference)) entries[key] = Cache.get(reference);
        }

        function handleReplace(entry, entries, key) {
            if(Array.isArray(entry)) handleArrayReplace(entry);
            else if(typeof entry === "object") handleObjectReplace(entry);
            else if(typeof entry === "string") handleStringReplace(entries, key);
        }

        function replaceReferences(data) {
            handleObjectReplace(data);
        }

        function handleSet(object, data) {
            var payload = data.payload;
            var args = payload.arguments;
            var property = args[0];

            object[property] = args[1];
            port.answerTo(data, [null]);
        }

        function handleGet(object, data) {
            var originalPayload = data.payload;
            var args = originalPayload.arguments;
            var ttl = originalPayload.ttl;
            var property = args[0];
            var value = object[property];
            var result = Cache.add(value, ttl);

            port.answerTo(data, [result]);
        }

        function handleRaw(data) {
            var originalPayload = data.payload;
            var result = originalPayload.reference;

            port.answerTo(data, [result]);
        }

        function handleSyncMethod(value, data) {
            var originalPayload = data.payload;
            var ttl = originalPayload.ttl;
            var result = Cache.add(value, ttl);
            var payload = [result];

            port.answerTo(data, payload);
        }

        function handleAsyncMethod(args, data) {
            var originalPayload = data.payload;
            var ttl = originalPayload.ttl;
            var length = args.length;
            var payload = [];

            for(var i = 0; i < length; i++) {
                var arg = args[i];
                var result = arg;

                if(arg || arg === false) result = Cache.add(arg, ttl);
                payload.push(result);
            }

            port.answerTo(data, payload);
        }

        function handleMethod(object, data) {
            var payload = data.payload;
            var method = payload.method;
            var args = payload.arguments;
            var timer = window.setTimeout(port.answerTo, 60000, data, [null]);

            function callback(/* ... */) {
                window.clearTimeout(timer);
                handleAsyncMethod(arguments, data);
            }

            args.push(callback);
            var value = object[method].apply(null, args);

            if(value) {
                window.clearTimeout(timer);
                handleSyncMethod(value, data);
            }
        }

        function handlePlugin(data) {
            var payload = data.payload;
            var method = payload.method;
            var plugin = API[payload.plugin];

            if(method === "{{set}}") handleSet(plugin, data);
            else if(method === "{{get}}") handleGet(plugin, data);
            else handleMethod(plugin, data);
        }

        function handleReference(data) {
            var payload = data.payload;
            var method = payload.method;
            var reference = payload.reference;

            if(method === "{{set}}") handleSet(reference, data);
            else if(method === "{{get}}") handleGet(reference, data);
            else if(method === "{{raw}}") handleRaw(data);
            else handleMethod(reference, data);
        }


        function onMessage(data) {
            var payload = data.payload;
            var plugin = payload.plugin;
            var reference = payload.reference;

            replaceReferences(payload);

            if(plugin) handlePlugin(data);
            else if(reference) handleReference(data);
        }

        function onConnect(data) {
            var error = data.payload;

            if(error) console.error(error);
            else port.on("message", onMessage);
        }

        function onDisconnect(data) {
            var error = data.payload;

            if(error) console.error(error);
        }

        function onLoad(error) {
            if(error) console.error(error);
            else port.connectTo(window, onConnect);
        }

        function onUnload(error) {
            if(error) console.error(error);
            else port.disconnect(onDisconnect);
        }


        plugin.on("load", onLoad);
        plugin.on("unload", onUnload);
        register(null, pluginInformation);
    }
});