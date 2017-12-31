var CD4A = (function() {
    var PATH = "/cd/Demo.cd";

    var port = Port("CD4A");
    var iframe = document.getElementById("ide-cd");
    var textarea = document.getElementById("cd");


    function readFile(callback) {
        port.sendTo("api.ide", {
            plugin: "fs",
            method: "readFile",
            arguments: [PATH]
        }, function(data) {
            if(data.payload[0]) {
                console.error("An error occurred while reading the CD4A file!");
            } else {
                port.sendTo("api.ide", {
                    reference: data.payload[1],
                    method: "{{raw}}",
                    arguments: []
                }, callback);
            }
        });
    }

    function writeFile() {
        port.sendTo("api.ide", {
            plugin: "fs",
            method: "writeFile",
            arguments: [PATH, textarea.value]
        }, onWriteFile);
    }

    function openFile() {
        port.sendTo("api.ide", {
            plugin: "tabManager",
            method: "openFile",
            arguments: [PATH, true]
        }, onOpenFile);
    }

    function existsFile() {
        port.sendTo("api.ide", {
            plugin: "fs",
            method: "exists",
            arguments: [PATH]
        }, onExists);
    }


    function onWriteFile(data) {
        var error = data.payload[0];

        if(error) console.error(error);
        else openFile();
    }

    function onOpenFile(data) {}

    function onExistsRaw(data) {
        var exists = data.payload[0];

        if(exists) openFile();
        else writeFile();
    }

    function onExists(data) {
        port.sendTo("api.ide", {
            reference: data.payload[0],
            method: "{{raw}}",
            arguments: []
        }, onExistsRaw);
    }

    function onConnected(data) {
        if(data.source === "api.ide") existsFile();
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

    return { readFile: readFile };
})();