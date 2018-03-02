/* caption: OCL; extensions: ocl */
define(function(require, exports, module) {
    var OCLHighlightRules = require("./ocl_highlight_rules").OCLHighlightRules;
    var Mode = require("plugins/se.rwth.api.language/modes/language");

    exports.Mode = Mode("OCL", OCLHighlightRules);
});