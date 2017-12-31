(function() {
    var PATH = "/ocl/Demo.ocl";

    var port = Port("OCL");
    var iframe = document.getElementById("ide-ocl");
    var textarea = document.getElementById("ocl");


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
})();