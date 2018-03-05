define(function(require, exports, module) {
    return function(caption, keywords, buildInConstants, langClasses) {
        var oop = require("ace/lib/oop");
        var DocCommentHighlightRules = require("ace/mode/doc_comment_highlight_rules").DocCommentHighlightRules;
        var TextHighlightRules = require("ace/mode/text_highlight_rules").TextHighlightRules;

        var HighlightRules = function() {
            var keywordMapper = this.createKeywordMapper({
                "keyword": keywords,
                "constant.language": buildInConstants,
                "support.function": langClasses
            }, "identifier");

            // regexp must not have capturing parentheses. Use (?:) instead.
            // regexps are ordered -> the first match is used

            this.$rules = {
                "start" : [
                    {
                        token : "comment",
                        regex : "\\/\\/.*$"
                    },
                    DocCommentHighlightRules.getStartRule("doc-start"),
                    {
                        token : "comment", // multi line comment
                        regex : "\\/\\*",
                        next : "comment"
                    }, {
                        token : "string", // single line
                        regex : '["](?:(?:\\\\.)|(?:[^"\\\\]))*?["]'
                    }, {
                        token : "string", // single line
                        regex : "['](?:(?:\\\\.)|(?:[^'\\\\]))*?[']"
                    }, {
                        token : "constant.numeric", // hex
                        regex : /0(?:[xX][0-9a-fA-F][0-9a-fA-F_]*|[bB][01][01_]*)[LlSsDdFfYy]?\b/
                    }, {
                        token : "constant.numeric", // float
                        regex : /[+-]?\d[\d_]*(?:(?:\.[\d_]*)?(?:[eE][+-]?[\d_]+)?)?[LlSsDdFfYy]?\b/
                    }, {
                        token : "constant.language.boolean",
                        regex : "(?:true|false)\\b"
                    }, {
                        token : keywordMapper,
                        // TODO: Unicode escape sequences
                        // TODO: Unicode identifiers
                        regex : "[a-zA-Z_$][a-zA-Z0-9_$]*\\b"
                    }, {
                        token : "keyword.operator",
                        regex : "!|\\$|%|&|\\*|\\-\\-|\\-|\\+\\+|\\+|~|===|==|=|!=|!==|<=|>=|<<=|>>=|>>>=|<>|<|>|!|&&|\\|\\||\\?\\:|\\*=|%=|\\+=|\\-=|&=|\\^=|\\b(?:in|instanceof|new|delete|typeof|void)"
                    }, {
                        token : "lparen",
                        regex : "[[({]"
                    }, {
                        token : "rparen",
                        regex : "[\\])}]"
                    }, {
                        token : "text",
                        regex : "\\s+"
                    }
                ],
                "comment" : [
                    {
                        token : "comment", // closing comment
                        regex : ".*?\\*\\/",
                        next : "start"
                    }, {
                        token : "comment", // comment spanning whole line
                        regex : ".+"
                    }
                ]
            };

            this.embedRules(DocCommentHighlightRules, "doc-",
                [ DocCommentHighlightRules.getEndRule("start") ]);
        };

        oop.inherits(HighlightRules, TextHighlightRules);

        return HighlightRules;
    };
});