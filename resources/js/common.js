var Common = function(PATH, port, iframe, textarea, button) {
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

    function readFile(callback) {
        var data = { plugin: "fs", method: "readFile", arguments: [PATH] };

        function onResponse(data) {
            var errorReference = data.payload[0];
            var contentReference = data.payload[1];

            if(errorReference) console.error("An error occurred while reading the CD4A file!");
            else executeCallback(contentReference, callback, 1);
        }

        port.sendTo("api.ide", data, onResponse);
    }

    function writeFile(callback) {
        var data = { plugin: "fs", method: "writeFile", arguments: [PATH, textarea.value] };

        function onResponse(data) {
            var errorReference = data.payload[0];

            if(errorReference) console.error("An error occurred while writing to the CD4A file!");
            else callback(null);
        }

        port.sendTo("api.ide", data, onResponse);
    }

    function openFile() {
        var data = { plugin: "tabManager", method: "openFile", arguments: [PATH, true] };

        function onResponse(data) {}

        port.sendTo("api.ide", data, onResponse);
    }

    function existsFile(callback) {
        var data = { plugin: "fs", method: "exists", arguments: [PATH] };

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


    function onClick(event) {
        function onWriteFile(error) {
            if(error) console.error("An error occurred while writing to the file!");
            else reloadTab();
        }

        writeFile(onWriteFile);
    }

    function onWriteFile(error) {
        if(error) console.error("An error occurred while writing to the file!");
        else openFile();
    }

    function onExistsFile(exists) {
        if(exists) openFile();
        else writeFile(onWriteFile);
    }

    function onConnected(data) {
        if(data.source === "api.ide") existsFile(onExistsFile);
    }

    function onConnect(data) {
        var error = data.payload;

        if(error) console.error(error);
        else port.on("connected", onConnected);
    }

    function onOnline() {
        port.connectTo(iframe.contentWindow, onConnect);
    }


    port.on("online", onOnline);
    button.addEventListener("click", onClick);


    return {
        readFile: readFile,
        writeFile: writeFile
    };
};