var Dialog = (function() {
    var CONSTANTS = {
        RADIX: "resources/media/images/"
    };

    var properties = {
        $dialog: null,
        $message: null,
        $icon: null,
        $panel: null
    };

    var methods = {
        init: function() {
            methods.addEventListeners();

            delete methods.init;
            return methods;
        },

        addEventListeners: function() {
            $(document).ready(events.onDocumentReady);
        },

        show: function(message, type, buttons, callbacks, error) {
            var icon = methods.getIcon(type);

            buttons = buttons || [];
            callbacks = callbacks || [];

            properties.$panel.children(".shared-span").remove();
            properties.$message.html(message);
            properties.$icon.css("background-image", "url(\"" + icon + "\")");

            methods.addButtons(buttons, callbacks);
            error && console.error(error);

            Loader.hide();
            properties.$dialog.show();
        },

        hide: function() {
            properties.$dialog.hide();
        },

        getIcon: function(type) {
            return CONSTANTS.RADIX + (type === "error" ? "Error.svg" : "Warning.svg");
        },

        extendCallback: function(callback) {
            callback = callback || function() {};

            return function(event) {
                methods.hide();
                callback(event);
            }
        },

        addButtons: function(buttons, callbacks) {
            var length = buttons.length;

            for(var i = 0; i < length; i++) {
                var button = buttons[i];
                var callback = callbacks[i];

                methods.addButton(button, callback);
            }
        },

        addButton: function(button, callback) {
            var $button = $("<span/>", { "class": "shared-span", text: button });

            callback = methods.extendCallback(callback);

            $button.one("click", callback);
            properties.$panel.append($button);
        }
    };

    var events = {
        onDocumentReady: function() {
            properties.$dialog = $("#dialog-container");
            properties.$message = $("#dialog-message");
            properties.$icon = $("#dialog-icon");
            properties.$panel = $("#dialog-panel");
        }
    };

    return methods.init();
})();