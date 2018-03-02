/**
 * This file defines the Highlighting Rules of the
 * EmbeddedMontiArcMath language.
 */
define(function(require, exports, module) {
    var keywords = (
        "abstract|continue|new|switch|" +
        "assert|default|goto|package|synchronized|" +
        "boolean|do|private|this|" +
        "break|double|implements|protected|throw|" +
        "byte|import|public|throws|" +
        "case|enum|instanceof|return|transient|" +
        "catch|extends|int|short|try|" +
        "char|final|interface|static|void|" +
        "class|finally|long|strictfp|volatile|" +
        "const|float|native|super|while|component|" +
        "instance|implementation"
    );

    var buildInConstants = ("null|Infinity|NaN|undefined");

    var langClasses = (
        "AbstractMethodError|AssertionError|ClassCircularityError|"+
        "ClassFormatError|Deprecated|EnumConstantNotPresentException|"+
        "ExceptionInInitializerError|IllegalAccessError|"+
        "IllegalThreadStateException|InstantiationError|InternalError|"+
        "NegativeArraySizeException|NoSuchFieldError|Override|Process|"+
        "ProcessBuilder|SecurityManager|StringIndexOutOfBoundsException|"+
        "SuppressWarnings|TypeNotPresentException|UnknownError|"+
        "UnsatisfiedLinkError|UnsupportedClassVersionError|VerifyError|"+
        "InstantiationException|IndexOutOfBoundsException|"+
        "ArrayIndexOutOfBoundsException|CloneNotSupportedException|"+
        "NoSuchFieldException|IllegalArgumentException|NumberFormatException|"+
        "SecurityException|Void|InheritableThreadLocal|IllegalStateException|"+
        "InterruptedException|NoSuchMethodException|IllegalAccessException|"+
        "UnsupportedOperationException|Enum|StrictMath|Package|Compiler|"+
        "Readable|Runtime|StringBuilder|Math|IncompatibleClassChangeError|"+
        "NoSuchMethodError|ThreadLocal|RuntimePermission|ArithmeticException|"+
        "NullPointerException|Long|Integer|Short|Byte|Double|Number|Float|"+
        "Character|Boolean|StackTraceElement|Appendable|StringBuffer|"+
        "Iterable|ThreadGroup|Runnable|Thread|IllegalMonitorStateException|"+
        "StackOverflowError|OutOfMemoryError|VirtualMachineError|"+
        "ArrayStoreException|ClassCastException|LinkageError|"+
        "NoClassDefFoundError|ClassNotFoundException|RuntimeException|"+
        "Exception|ThreadDeath|Error|Throwable|System|ClassLoader|"+
        "Cloneable|Class|CharSequence|Comparable|String|Object|ports|connect|in|out|"+
        "for|end|elseif|else|if"
    );

    var HighlightRules = require("plugins/se.rwth.api.language/modes/language_highlight_rules");

    exports.EmbeddedMontiArcMathHighlightRules =
        HighlightRules("EmbeddedMontiArcMath", keywords, buildInConstants, langClasses);
});