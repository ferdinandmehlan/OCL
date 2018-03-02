/* caption: CD; extensions: cd */
define(function(require, exports, module) {
    var CDHighlightRules = require("./cd_highlight_rules").CDHighlightRules;
    var Mode = require("plugins/se.rwth.api.language/modes/language");

    exports.Mode = Mode("CD", CDHighlightRules);
});