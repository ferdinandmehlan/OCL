var Trashbin = (function() {
    var CONSTANTS = {
        KEY: "trashbin"
    };

    var properties = {
        contents: []
    };

    var methods = {
        init: function() {
            methods.load();
            methods.empty();

            delete methods.init;
            return methods;
        },

        load: function() {
            var data = window.localStorage.getItem(CONSTANTS.KEY) || "[]";

            properties.contents = JSON.parse(data);
        },

        save: function() {
            var data = JSON.stringify(properties.contents);

            window.localStorage.setItem(CONSTANTS.KEY, data);
        },

        has: function(mountPoint) {
            var contents = properties.contents;

            return contents.indexOf(mountPoint) > -1;
        },

        add: function(mountPoint) {
            properties.contents.push(mountPoint);
            methods.save();
        },

        remove: function(mountPoint) {
            var contents = properties.contents;
            var index = contents.indexOf(mountPoint);

            if(index > -1) {
                contents.splice(index, 1);
                methods.save();
            }
        },

        empty: function() {
            var contents = properties.contents;

            onSuccess(null);

            function onSuccess(event) {
                var content = contents.shift();

                if(content) methods.handleEmpty(content, onSuccess);
                else methods.save();
            }
        },

        handleEmpty: function(content, onSuccess) {
            var request = window.indexedDB.deleteDatabase(content);

            function onError(event) {
                console.error(event.result.target);
                methods.save();
            }

            request.onsuccess = onSuccess;
            request.onerror = onError;
        }
    };

    return methods.init();
})();