var BaseModule = {
    preRun: [],
    postRun: [],
    print: function(text) {
        console.log(text);
    },
    printErr: function(text) {
        if(text.length > 0) {
            console.error(text);
        }
    },
    noInitialRun: true,
    noExitRuntime: true
};