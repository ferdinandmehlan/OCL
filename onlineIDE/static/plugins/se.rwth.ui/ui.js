define(function(require, exports, module) {
    main.consumes = ["Plugin", "ui", "layout", "ace.status"];
    main.provides = ["ui.custom"];
    return main;

    function main(options, imports, register) {
        var Plugin = imports.Plugin;
        var UI = imports.ui;
        var Layout = imports.layout;
        var AceStatus = imports["ace.status"];

        var plugin = new Plugin("SE RWTH", main.consumes);
        var pluginInformation = { "ui.custom": plugin };

        var loaded = false;

        var API = {
            message: message,
            done: done
        };

        var messageLabel = null;
        var loaderLabel = null;

        var queues = {};


        function show(editor) {
            if(editor) showEditor(editor);
            else showGlobal();
        }

        function showGlobal() {
            messageLabel.setAttribute("visible", true);
            loaderLabel.setAttribute("visible", true);
        }

        function showEditor(editor) {
            var statusBar = AceStatus.getStatusbar(editor);

            if(statusBar) {
                var messageLabel = statusBar.getElement("lblMessage");
                var loaderLabel = statusBar.getElement("lblLoader");

                messageLabel.setAttribute("visible", true);
                loaderLabel.setAttribute("visible", true);
                //Needed, otherwise bad formatting for some unexplainable reason.
                messageLabel.setAttribute("visible", false);
                loaderLabel.setAttribute("visible", false);
                messageLabel.setAttribute("visible", true);
                loaderLabel.setAttribute("visible", true);
            }
        }

        function hide(editor) {
            if(editor) hideEditor(editor);
            else hideGlobal();
        }

        function hideGlobal() {
            messageLabel.setAttribute("visible", false);
            loaderLabel.setAttribute("visible", false);
        }

        function hideEditor(editor) {
            var statusBar = AceStatus.getStatusbar(editor);

            if(statusBar) {
                var messageLabel = statusBar.getElement("lblMessage");
                var loaderLabel = statusBar.getElement("lblLoader");

                messageLabel.setAttribute("visible", false);
                loaderLabel.setAttribute("visible", false);
            }
        }

        function message(message, editor) {
            var index = pushToQueue(message, editor);

            if(index === 0) {
                nextEntry(editor);
                show(editor);
            }

            return index;
        }

        function setMessage(message, editor) {
            if(editor) setMessageEditor(editor, message);
            else setMessageGlobal(message);
        }

        function setMessageGlobal(message) {
            messageLabel.setAttribute("caption", message);
        }

        function setMessageEditor(editor, message) {
            var statusBar = AceStatus.getStatusbar(editor);

            if(statusBar) {
                var messageLabel = statusBar.getElement("lblMessage");

                messageLabel.setAttribute("caption", message);
            }
        }

        function pushToQueue(message, editor) {
            var queue = getQueue(editor);
            var entries = queue.entries;
            var entry = createEntry(message);

            entries.push(entry);

            return entries.length - 1;
        }

        function createEntry(message) {
            var entry = {};

            entry.message = message;
            entry.done = false;

            return entry;
        }

        function getQueue(editor) {
            var queue = queues[editor || '*'];

            if(queue) return queue;
            else return addQueue(editor);
        }

        function addQueue(editor) {
            var queue = {};

            queue.pointer = -1;
            queue.entries = [];
            queues[editor || '*'] = queue;

            return queue;
        }

        function done(index, editor) {
            var queue = getQueue(editor);
            var pointer = queue.pointer;
            var entries = queue.entries;
            var entry = entries[index];

            entry.done = true;

            if(pointer === index) nextEntry(editor);
        }

        function nextEntry(editor) {
            var queue = getQueue(editor);
            var pointer = ++queue.pointer;
            var entries = queue.entries;
            var entry = entries[pointer];

            if(entry) setEntry(entry, editor);
            else removeQueue(editor);
        }

        function setEntry(entry, editor) {
            var message = entry.message;
            var done = entry.done;

            setMessage(message, editor);

            if(done) nextEntry(editor);
        }

        function removeQueue(editor) {
            delete queues[editor || '*'];
            hide(editor);
        }


        function onLoad() {
            if(loaded) {
                return false;
            } else {
                var parent = Layout.getElement("barExtras");

                var frontDivider = new UI.divider({
                    "class": "c9-divider-double menudivider"
                });

                var backDivider = new UI.divider({
                    "class": "c9-divider-double menudivider"
                });

                messageLabel = new UI.label({
                    "caption": "...",
                    "visible": false
                });

                loaderLabel = new UI.label({
                    "class": "icon-loader",
                    "height": 14,
                    "width": 14,
                    "visible": false
                });

                UI.insertByIndex(parent, messageLabel, 0, plugin);
                UI.insertByIndex(parent, loaderLabel, 1, plugin);
                UI.insertByIndex(parent, frontDivider, 2, plugin);
                UI.insertByIndex(parent, backDivider, 1000, plugin);
            }
        }

        function onUnload() {
            loaded = false;
        }

        plugin.on("load", onLoad);
        plugin.on("unload", onUnload);
        plugin.freezePublicAPI(API);
        register(null, pluginInformation);
    }
});