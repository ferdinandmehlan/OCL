/**
 * This file defines the Highlighting Rules of the
 * OCL language.
 */
define(function(require, exports, module) {
    var keywords = (
        "void|boolean|byte|short|int|long|char|float|double|extends|super|" +
        "import|public|private|protected|final|abstract|local|derived|readonly|" +
        "static|context|inv|in|pre|post|new|throws|if|then|else|typeif|instanceof|" +
        "forall|exists|any|let|iterate|isin|implies|this|result|isnew|defined|ocl|" +
        "package"
    );

    var buildInConstants = ("null|true|false");

    var langClasses = ("Set|List|Collection");

    var HighlightRules = require("plugins/se.rwth.api.language/modes/language_highlight_rules");

    exports.OCLHighlightRules =
        HighlightRules("OCL", keywords, buildInConstants, langClasses);
});