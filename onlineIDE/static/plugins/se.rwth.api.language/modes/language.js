define(function(require, exports, module) {
    return function(caption, LanguageHighlightRules) {
        var oop = require("ace/lib/oop");
        var JavaScriptMode = require("ace/mode/javascript").Mode;

        var Mode = function() {
            JavaScriptMode.call(this);
            this.HighlightRules = LanguageHighlightRules;
        };

        oop.inherits(Mode, JavaScriptMode);

        (function() {
            this.createWorker = function(session) {
                return null;
            };

            this.$id = "ace/mode/" + caption.toLowerCase();
        }).call(Mode.prototype);

        return Mode;
    };
});