var Credentials = (function() {
    var properties = {
        $container: null,
        $username: null,
        $password: null,
        $submit: null,
        $cancel: null
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

        addEventHandlers: function() {
            properties.$submit.on("click", events.onSubmitClick);
            properties.$cancel.on("click", events.onCancelClick);
        },

        show: function() {
            properties.$container.show();
        },

        hide: function() {
            properties.$container.hide();
        },

        isset: function() {
            var username = methods.getUsername();
            var password = methods.getPassword();

            return username.length > 0 && password.length > 0;
        },

        getUsername: function() {
            return properties.$username.val();
        },

        getPassword: function() {
            return properties.$password.val();
        }
    };

    var events = {
        onDocumentReady: function(event) {
            properties.$container = $("#credentials-container");
            properties.$username = $("#credentials-username");
            properties.$password = $("#credentials-password");
            properties.$submit = $("#credentials-submit");
            properties.$cancel = $("#credentials-cancel");

            methods.addEventHandlers();
        },

        onSubmitClick: function(event) {
            var username = methods.getUsername();
            var password = methods.getPassword();
            var isset = methods.isset();

            if(isset) Branches.handleClone(username, password);
            else Dialog.show("Providing credentials is mandatory as you have chosen to clone a private repository.", "warning", ["OK"]);
        },

        onCancelClick: function(event) {
            methods.hide();
        }
    };

    return methods.init();
})();