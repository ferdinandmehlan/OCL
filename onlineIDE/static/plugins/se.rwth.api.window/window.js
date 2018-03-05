define(function(require, exports, module) {
    main.consumes = ["Plugin", "fs", "tabManager"];
    main.provides = ["api.window"];
    return main;

    function main(options, imports, register) {
        var Plugin = imports.Plugin;
        var fs = imports.fs;
        var tabManager = imports.tabManager;

        var plugin = new Plugin("SE RWTH", main.consumes);
        var pluginInformation = { "api.window": plugin };

        window.api = window.api || {
            "fs": fs,
            "tabManager": tabManager
        };

        register(null, pluginInformation);
    }
});