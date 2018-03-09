/*define(function(require, exports, module) {
    var caption = "OCL";
    var captionLowerCase = caption.toLowerCase();
    var pluginPath = "plugins/se.rwth.language." + captionLowerCase;

    var baseHandler = require("plugins/c9.ide.language/base_handler");
    var handler = Object.create(baseHandler);
    var emitter = null;


    function init(callback) {
        emitter = handler.getEmitter();

        callback(null);
    }

    function handlesLanguage(language) {
        return language === pluginPath + "/modes/" + captionLowerCase;
    }

    function analyze(docValue, ast, options, callback) {
        function onAnalyzed() {
            var request = window.indexedDB.open("cjFS_/files/", 1);
            var db = null;

            request.onerror = function(event) {
                console.error("Unable to open database!");
            };

            request.onsuccess = function(event) {
                db = this.result;

                var transaction = db.transaction(["files"]);
                var objectStore = transaction.objectStore("files");
                var request = objectStore.get("/errors.log");

                request.onerror = function(event) {
                    console.error("Unable to retrieve data from database!");
                };

                request.onsuccess = function(event) {
                    var buffer = event.target.result.contents;
                    var string = String.fromCharCode.apply(null, buffer);
                    console.log(string);
                    var json = JSON.parse(string);

                    console.log(event);
                    console.log(json);
                };
            };
        }

        emitter.emit("onAnalyze");
        emitter.once("onAnalyzed", onAnalyzed);
        callback(null, []);
    }


    handler.init = init;
    handler.handlesLanguage = handlesLanguage;
    handler.analyze = analyze;

    module.exports = handler;
});*/

define(function(require, exports, module) {
    var Handler = require("plugins/se.rwth.api.language/worker/worker");

    //1.2.2-SNAPSHOT
    module.exports = Handler("OCL", 1 * 10000 + 2 * 1000 + 2 * 100 + 5);
});