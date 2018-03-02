var GitHubContainer = (function() {
    var properties = {
        $container: null
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

        show: function() {
            properties.$container.show();
        },

        hide: function() {
            properties.$container.hide();
            Menu.hide();
        }
    };

    var events = {
        onDocumentReady: function() {
            properties.$container = $("#github-container");
        }
    };

    return methods.init();
})();