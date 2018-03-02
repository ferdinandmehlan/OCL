/**
 * This file defines the Highlighting Rules of the
 * CD language.
 */
define(function(require, exports, module) {
    var keywords = (
        "void|boolean|byte|short|int|long|char|float|double|extends|super|" +
        "import|package|classdiagram|class|implements|interface|enum|throws|" +
        "association|composition|abstract|final|static|private|protected|" +
        "public|derived"
    );

    var buildInConstants = ("null|true|false");

    var langClasses = ("");

    var HighlightRules = require("plugins/se.rwth.api.language/modes/language_highlight_rules");

    exports.CDHighlightRules =
        HighlightRules("CD", keywords, buildInConstants, langClasses);
});