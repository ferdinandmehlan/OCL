define(function(require, exports, module) {
    main.consumes = ["Plugin"];
    main.provides = ["api.switch"];
    return main;

    function main(options, imports, register) {
        var Plugin = imports.Plugin;

        var plugin = new Plugin("SE RWTH", main.consumes);
        var pluginInformation = { "api.switch": plugin };

        var ports = { "api.switch": window };

        var API = { "Port": require("./port.js") };


        function buildMessage(eventName, source, destination, payload) {
            var data = {};

            data.source = source;
            data.destination = destination;
            data.eventName = eventName;
            data.pid = "[[*]]";
            data.payload = payload;

            return data;
        }

        function buildBroadcastMessage(eventName, source, payload) {
            return buildMessage(eventName, source, '*', payload);
        }

        function sendOnline() {
            var data = buildBroadcastMessage("online", "api.switch");
            var parent = window.parent;

            if(parent) parent.postMessage(data, '*');
        }

        function sendBroadcast(data) {
            for(var id in ports) {
                if(ports.hasOwnProperty(id) && id !== "api.switch") {
                    ports[id].postMessage(data, '*');
                }
            }
        }

        function handleLoad() {
            window.addEventListener("message", onMessage);
            sendOnline();
        }

        function sendConnected(source) {
            var data = buildBroadcastMessage("connected", source);

            sendBroadcast(data);
        }

        function sendConnect(error, data, context) {
            var source = data.source;

            data.destination = source;
            data.source = "api.switch";
            data.payload = error;

            context.postMessage(data, '*');

            if(error === null) {
                ports[source] = context;
                sendConnected(source);
            }
        }

        function handleConnect(event) {
            var data = event.data;
            var source = data.source;
            var context = event.source;

            if(ports.hasOwnProperty(source)) sendConnect("A Port with this name already exists!", data, context);
            else sendConnect(null, data, context);
        }

        function sendDisconnected(source) {
            var data = buildBroadcastMessage("connected", source);

            sendBroadcast(data);
        }

        function sendDisconnect(error, data, context) {
            var source = data.source;

            data.destination = source;
            data.source = "api.switch";
            data.payload = error;

            context.postMessage(data, '*');

            if(error === null) {
                delete ports[source];
                sendDisconnected(source);
            }
        }

        function handleDisconnect(event) {
            var data = event.data;
            var source = data.source;
            var context = event.source;

            if(ports.hasOwnProperty(source)) sendDisconnect(null, data, context);
            else sendDisconnect("A Port with this name does not exist!", data, context);
        }

        function handleMessage(data) {
            var destination = data.destination;
            var context = ports[destination];

            if(context && context !== window) context.postMessage(data, '*');
        }

        function handleUnknown(event) {
            var data = event.data;
            var eventName = data.eventName;
            var context = event.source;
            var error = "Unknown Message Type: " + eventName;

            data.destination = data.source;
            data.source = "api.switch";
            data.payload = error;

            context.postMessage(data, '*');
        }


        function onMessage(event) {
            var data = event.data;
            var source = data.source;
            var eventName = data.eventName;

            if(source === undefined || source === "api.switch") return;

            if(eventName === "connect") handleConnect(event);
            else if(eventName === "disconnect") handleDisconnect(event);
            else if(eventName === "message") handleMessage(data);
            else handleUnknown(event);
        }

        function onLoad(error) {
            if(error) console.error(error);
            else handleLoad();
        }


        plugin.on("load", onLoad);
        plugin.freezePublicAPI(API);
        register(null, pluginInformation);
    }
});