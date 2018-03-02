var Checker = (function() {
    var CONSTANTS = {
        INDEXED_DB: {
            NAME: "__browserfs_test__",
            VERSION: 1,
            KEY_PATH: "_",
            VALUE: {
                "_": "_"
            }
        },
        LOCAL_STORAGE: {
            KEY: "__test__",
            VALUE: "_"
        },
        FLAGS: {
            PREREQUISITES: "flags.prerequisites"
        },
        WARNINGS: {
            CHROME: {
                CLONING: "warnings.chrome.cloning"
            },
            EDGE: {
                EXPERIMENTAL: "warnings.edge.experimental"
            }
        }
    };

    var properties = {
        events: {}
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

        on: function(eventName, callback) {
            $(properties.events).on(eventName, callback);
        },

        off: function(eventName, callback) {
            $(properties.events).off(eventName, callback);
        },

        trigger: function(eventName) {
            $(properties.events).trigger(eventName);
        },

        check: function(callback) {
            async.series([
                methods.handleBrowsersPre,
                methods.handlePrerequisites,
                methods.handleBrowsersPost
            ], callback);
        },

        handlePrerequisites: function(callback) {
            try {
                var prerequisites = Settings.get(CONSTANTS.FLAGS.PREREQUISITES);

                if(prerequisites) {
                    callback(null);
                } else {
                    async.series([
                        methods.handleLocalStorage,
                        methods.handleIndexedDB,
                        methods.handleWebAssembly
                    ], callback);
                }
            } catch(error) {
                callback("An error occurred while checking the Prerequisites. Enabling \"Third Party Cookies\" " +
                    "might fix this issue.");
            }
        },

        handleBrowsersPre: function(callback) {
            var client = browser();

            if(client.mobile === true) {
                methods.handleMobilePre(callback);
            } else {
                callback(null);
            }
        },

        handleMobilePre: function(callback) {
            callback("Mobile Devices are currently not supported by the implementation. Please change " +
                "to a desktop variant.", "error");
        },

        getMessage: function(technology) {
            return technology + " is not supported by this web browser. In order to make use of the services " +
                "provided by this website you have to change to a web browser which supports this technology " +
                "(e.g. <a href='https://www.google.de/chrome/browser/desktop/index.html'>Google Chrome</a>)";
        },

        handleIndexedDB: function(callback) {
            window.indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;

            if(window.indexedDB === undefined) {
                var message = methods.getMessage("IndexedDB");
                callback(message);
            } else {
                /*async.waterfall([
                    methods.handleIndexedDBOpen,
                    methods.handleIndexedDBAdd,
                    methods.handleIndexedDBGet,
                    methods.handleIndexedDBDelete
                ], callback);*/
                callback(null);
            }
        },

        handleIndexedDBOpen: function(callback) {
            var request = window.indexedDB.open(CONSTANTS.INDEXED_DB.NAME, CONSTANTS.INDEXED_DB.VERSION);

            function onError(event) {
                console.error(event);
                callback(event.target.result);
            }

            function onSuccess(event) {
                var database = event.target.result;

                callback(null, database)
            }

            function onUpgradeNeeded(event) {
                var database = event.target.result;

                database.createObjectStore(CONSTANTS.INDEXED_DB.NAME, { keyPath: CONSTANTS.INDEXED_DB.KEY_PATH });
            }

            request.onerror = onError;
            request.onsuccess = onSuccess;
            request.onupgradeneeded = onUpgradeNeeded;
        },

        handleIndexedDBTransaction: function(database, callback) {
            var transaction = database.transaction([CONSTANTS.INDEXED_DB.NAME], "readwrite");

            function onError(event) {
                var error = transaction.error;
                var message = error.name + ':' + error.message;

                console.error(event);
                callback(message);
            }

            transaction.onerror = onError;
            transaction.onabort = onError;
            return transaction;
        },

        handleIndexedDBAdd: function(database, callback) {
            var transaction = methods.handleIndexedDBTransaction(database, callback);
            var objectStore = transaction.objectStore(CONSTANTS.INDEXED_DB.NAME);
            var request = objectStore.add(CONSTANTS.INDEXED_DB.VALUE);

            function onError(event) {
                console.error(event);
                callback(event.target.result);
            }

            function onSuccess(event) {
                callback(null, database);
            }

            request.onerror = onError;
            request.onsuccess = onSuccess;
        },

        handleIndexedDBGet: function(database, callback) {
            var transaction = methods.handleIndexedDBTransaction(database, callback);
            var objectStore = transaction.objectStore(CONSTANTS.INDEXED_DB.NAME);
            var request = objectStore.get(CONSTANTS.INDEXED_DB.KEY_PATH);

            function onError(event) {
                console.error(event);
                callback(event.target.result);
            }

            function onSuccess(event) {
                var getValue = event.target.result[CONSTANTS.INDEXED_DB.KEY_PATH];
                var setValue = CONSTANTS.INDEXED_DB.VALUE[CONSTANTS.INDEXED_DB.KEY_PATH];

                if(getValue === setValue) {
                    callback(null, database);
                } else {
                    callback("An error occurred while retrieving the value from IndexedDB.");
                }
            }

            request.onerror = onError;
            request.onsuccess = onSuccess;
        },

        handleIndexedDBDelete: function(database, callback) {
            var transaction = methods.handleIndexedDBTransaction(database, callback);
            var objectStore = transaction.objectStore(CONSTANTS.INDEXED_DB.NAME);
            var request = objectStore.delete(CONSTANTS.INDEXED_DB.KEY_PATH);

            function onError(event) {
                console.error(event);
                callback(event.target.result);
            }

            function onSuccess(event) {
                callback(null);
            }

            request.onerror = onError;
            request.onsuccess = onSuccess;
        },

        handleLocalStorage: function(callback) {
            if(window.localStorage === undefined) {
                var message = methods.getMessage("LocalStorage");
                callback(message);
            } else {
                async.series([
                    methods.handleLocalStorageSet,
                    methods.handleLocalStorageRemove
                ], callback);
            }
        },

        handleLocalStorageSet: function(callback) {
            try {
                window.localStorage.setItem(CONSTANTS.LOCAL_STORAGE.KEY, CONSTANTS.LOCAL_STORAGE.VALUE);
                callback(null);
            } catch(error) {
                callback("An error occurred while removing adding to LocalStorage.");
            }
        },

        handleLocalStorageRemove: function(callback) {
            try {
                window.localStorage.removeItem(CONSTANTS.LOCAL_STORAGE.KEY);
                callback(null);
            } catch(error) {
                callback("An error occurred while removing deleting from LocalStorage.");
            }
        },

        handleWebAssembly: function(callback) {
            var client = browser();

            if(window.WebAssembly === undefined) {
                if(client.name === "edge") {
                    methods.handleWebAssemblyEdge(callback);
                } else {
                    var message = methods.getMessage("WebAssembly");
                    callback(message);
                }
            } else {
                callback(null);
            }
        },

        handleWebAssemblyEdge: function(callback) {
            var edgeWarning = Settings.get(CONSTANTS.WARNINGS.EDGE.EXPERIMENTAL);

            function onAccept() {
                Settings.set(CONSTANTS.WARNINGS.EDGE.EXPERIMENTAL, true);
                callback(null);
            }

            function onCancel() {
                callback(null);
            }

            if(edgeWarning === undefined) {
                Dialog.show("The system has detected that you are using Microsoft Edge as web browser. " +
                    "It is absolutely necessary that you activate WebAssembly in your web browser in order to " +
                    "make use of the services provided by this website. You can do this by entering" +
                    "<span class='highlighted'>about:flags</span> as URL an enabling the corresponding option.",
                    "error", ["OK, never show again", "OK"], [onAccept, onCancel]);
            } else {
                callback(null);
            }
        },

        handleBrowsersPost: function(callback) {
            var client = browser();

            if(client.name === "chrome") {
                methods.handleChrome(callback);
            } else {
                callback(null);
            }
        },

        handleChrome: function(callback) {
            var chromeWarning = Settings.get(CONSTANTS.WARNINGS.CHROME.CLONING);

            function onAccept() {
                Settings.set(CONSTANTS.WARNINGS.CHROME.CLONING, true);
                callback(null);
            }

            function onCancel() {
                callback(null);
            }

            if(chromeWarning === undefined) {
                Dialog.show("The system has detected that you are using Google Chrome as web browser. " +
                    "It is highly recommended that you activate <span class='highlighted'>WebAssembly " +
                    "Structured Cloning Support</span> in order to speed up the preparation process. You can " +
                    "activate it by entering <span class='highlighted'>chrome://flags#enable-webassembly</span> " +
                    "as URL and switching the option to \"Enabled\".", "warning", ["OK, never show again", "OK"],
                    [onAccept, onCancel]);
            } else {
                callback(null);
            }
        }
    };

    var events = {
        onDocumentReady: function(event) {
            function onChecked(error) {
                if(error) {
                    Dialog.show(error, "error");
                } else {
                    Settings.set(CONSTANTS.FLAGS.PREREQUISITES, true);
                    methods.trigger("checked");
                }
            }

            methods.check(onChecked);
        }
    };

    return methods.init();
})();