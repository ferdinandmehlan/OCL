var Settings = (function() {
    var CONSTANTS = {
        KEY: "settings"
    };

    var properties = {
        settings: {}
    };

    var methods = {
        init: function() {
            methods.load();

            delete methods.init;
            return methods;
        },

        load: function() {
            var data = window.localStorage.getItem(CONSTANTS.KEY) || "{}";

            properties.settings = JSON.parse(data);
        },

        save: function() {
            var data = JSON.stringify(properties.settings);

            window.localStorage.setItem(CONSTANTS.KEY, data);
        },

        set: function(key, value) {
            properties.settings[key] = value;

            methods.save();
        },

        get: function(key) {
            return properties.settings[key];
        }
    };

    return methods.init();
})();