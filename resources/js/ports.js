var CommonPort = function(portname, iframeId) {
    var eventEmitter = $({});
    var port = undefined;
    var iframe = undefined;

    function executeCallback(reference, callback, index) {
        var data = { reference: reference, method: "{{raw}}", arguments: [] };

        function onResponse(data) {
            var args = [];
            var value = data.payload[0];

            for(var i = 0; i < index; i++) {
                args.push(null);
            }

            args.push(value);
            callback.apply(null, args);
        }

        port.sendTo("api.ide", data, onResponse);
    }

    function readFile(path, callback) {
        var data = { plugin: "fs", method: "readFile", arguments: [path] };

        function onResponse(data) {
            var errorReference = data.payload[0];
            var contentReference = data.payload[1];

            if(errorReference) console.error("An error occurred while reading a file!");
            else executeCallback(contentReference, callback, 1);
        }

        port.sendTo("api.ide", data, onResponse);
    }

    function writeFile(path, value, callback) {
        var data = { plugin: "fs", method: "writeFile", arguments: [path, value] };

        function onResponse(data) {
            /*var errorReference = data.payload[0];

            if(errorReference) console.error("An error occurred while writing to a file!");
            else */callback(null);
        }

        port.sendTo("api.ide", data, onResponse);
    }

    function openFile(path, callback) {
        var data = { plugin: "tabManager", method: "openFile", arguments: [path, true] };

        function onResponse(data) {
            callback(null);
        }

        port.sendTo("api.ide", data, onResponse);
    }

    function existsFile(path, callback) {
        var data = { plugin: "fs", method: "exists", arguments: [path] };

        function onResponse(data) {
            var existsReference = data.payload[0];

            if(existsReference) executeCallback(existsReference, callback, 0);
        }

        port.sendTo("api.ide", data, onResponse);
    }

    function doReloadTab(reference) {
        var data = { plugin: "tabManager", method: "reload", arguments: [reference] };

        function onResponse(data) {}

        port.sendTo("api.ide", data, onResponse);
    }

    function reloadTab() {
        var data = { plugin: "tabManager", method: "{{get}}", arguments: ["focussedTab"] };

        function onResponse(data) {
            var tabReference = data.payload[0];

            if(tabReference) doReloadTab(tabReference);
        }

        port.sendTo("api.ide", data, onResponse);
    }

    function on(eventName, callback) {
        eventEmitter.on(eventName, callback);
    }

    function off(eventName, callback) {
        eventEmitter.off(eventName, callback);
    }

    function once(eventName, callback) {
        eventEmitter.once(eventName, callback);
    }


    function onConnected(data) {
        if(data.source === "api.ide") eventEmitter.trigger("connected");
    }

    function onConnect(data) {
        var error = data.payload;

        if(error) console.error(error);
        else port.on("connected", onConnected);
    }

    function onOnline() {
        port.connectTo(iframe.contentWindow, onConnect);
    }

    function onDocumentReady() {
        port = Port(portname);
        iframe = $(iframeId)[0];

        port.on("online", onOnline);
    }

    $(document).ready(onDocumentReady);


    return {
        on: on,
        off: off,
        once: once,
        readFile: readFile,
        writeFile: writeFile,
        reloadTab: reloadTab,
        existsFile: existsFile,
        openFile: openFile
    };
};

var CD4APort = (function() {
    return CommonPort("CD4A", "#ide-cd");
})();

var OCLPort = (function() {
    return CommonPort("OCL", "#ide-ocl");
})();