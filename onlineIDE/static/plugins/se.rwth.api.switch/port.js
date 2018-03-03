var Port = function(id) {
    var properties = {
        pid: 0,
        context: null,
        callbacks: { online: {}, connect: {}, disconnect: {}, message: {}, connected: {}, disconnected: {} }
    };

    var methods = {
        init: function() {
            methods.addEventHandlers();

            delete methods.init;
            return methods;
        },

        addEventHandlers: function() {
            window.addEventListener("message", events.onMessage);
        },

        buildMessage: function(eventName, destination, payload) {
            var data = {};

            data.source = id;
            data.destination = destination;
            data.eventName = eventName;
            data.pid = methods.getNextPID();
            data.payload = payload;

            return data;
        },

        getNextPID: function() {
            return "[[" + properties.pid++ + "]]";
        },

        send: function(data) {
            var context = properties.context;

            if(context) context.postMessage(data, '*');
        },

        setContext: function(context, data, callback) {
            properties.context = context;
            callback(data);
        },

        on: function(eventName, callback, pid) {
            pid = pid || "[[*]]";
            callback = callback || function() {};

            function extendedCallback(data) {
                if(pid === "[[*]]" || pid === data.pid) callback.call(null, data);
            }

            properties.callbacks[eventName][pid] = extendedCallback;
        },

        off: function(eventName, callback) {
            var callbacks = properties.callbacks[eventName];

            for(var pid in callbacks) {
                if(callbacks.hasOwnProperty(pid)) {
                    var cb = callbacks[pid];

                    if(cb === callback) {
                        delete callbacks[pid];
                        break;
                    }
                }
            }
        },

        one: function(eventName, callback, pid) {
            pid = pid || "[[*]]";
            callback = callback || function() {};

            function extendedCallback(data) {
                callback.call(null, data);
                methods.off(eventName, callback);
            }

            methods.on(eventName, extendedCallback, pid);
        },

        trigger: function(eventName, data) {
            var callbacks = properties.callbacks[eventName];

            for(var pid in callbacks) {
                if(callbacks.hasOwnProperty(pid)) {
                    callbacks[pid].call(null, data);
                }
            }
        },

        connectTo: function(context, callback) {
            var data = methods.buildMessage("connect", "api.switch");

            function onConnect(data) {
                var error = data.payload;

                if(error) callback(data);
                else methods.setContext(context, data, callback);
            }

            methods.one("connect", onConnect, data.pid);
            context.postMessage(data, '*');
        },

        disconnect: function(callback) {
            var data = methods.buildMessage("disconnect", "api.switch");

            function onDisconnect(data) {
                var error = data.payload;

                if(error) callback(data);
                else methods.setContext(null, data, callback);
            }

            methods.one("disconnect", onDisconnect, data.pid);
            methods.send(data);
        },

        sendTo: function(destination, payload, callback) {
            var data = methods.buildMessage("message", destination, payload);

            methods.one("message", callback, data.pid);
            methods.send(data);
        },

        answerTo: function(data, payload) {
            data.destination = data.source;
            data.source = id;
            data.payload = payload;

            methods.send(data);
        }
    };

    var events = {
        onMessage: function(event) {
            var data = event.data;
            var source = data.source;
            var destination = data.destination;
            var eventName = data.eventName;

            if(source === id) return;
            if(destination === id || destination === '*') methods.trigger(eventName, data);
        }
    };

    return methods.init();
};

if(typeof define === "function") define(function(require, exports, module) { return Port; });