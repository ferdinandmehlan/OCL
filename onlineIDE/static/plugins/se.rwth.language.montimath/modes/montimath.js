/* caption: Math; extensions: m */
define(function(require, exports, module) {
    var MathHighlightRules = require("./math_highlight_rules").MathHighlightRules;
    var Mode = require("plugins/se.rwth.api.language/modes/language");

    exports.Mode = Mode("MontiMath", MathHighlightRules);
});