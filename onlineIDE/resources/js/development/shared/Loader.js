var Loader = (function() {
    var properties = {
        $loader: null,
        $message: null
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

        show: function(message) {
            properties.$message.html(message);
            properties.$loader.show();
        },

        hide: function() {
            properties.$loader.hide();
        },

        message: function(message) {
            properties.$message.html(message);
        }
    };

    var events = {
        onDocumentReady: function() {
            properties.$loader = $("#loader-container");
            properties.$message = $("#loader-message");
        }
    };

    return methods.init();
})();