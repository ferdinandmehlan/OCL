/* caption: EmbeddedMontiArcMath; extensions: emam */
define(function(require, exports, module) {
    var EmbeddedMontiArcMathHighlightRules = require("./embeddedmontiarcmath_highlight_rules").EmbeddedMontiArcMathHighlightRules;
    var Mode = require("plugins/se.rwth.api.language/modes/language");

    exports.Mode = Mode("EmbeddedMontiArcMath", EmbeddedMontiArcMathHighlightRules);
});