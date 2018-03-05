/* caption: EmbeddedMontiArc; extensions: ema */
define(function(require, exports, module) {
    var EmbeddedMontiArcHighlightRules = require("./embeddedmontiarc_highlight_rules").EmbeddedMontiArcHighlightRules;
    var Mode = require("plugins/se.rwth.api.language/modes/language");

    exports.Mode = Mode("EmbeddedMontiArc", EmbeddedMontiArcHighlightRules);
});