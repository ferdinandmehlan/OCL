$(document).ready(function() {
    var $textarea = $("#cd-default");
    var PATH = "/example/cd/DefaultTypes.cd";


    function onOpenFile(error) {
        if(error) console.log("An error occurred while opening the CD4ADefault file!");
    }

    function onWriteFile(error) {
        if(error) console.log("An error occurred while writing to the CD4ADefault file!");
        else CD4APort.openFile(PATH, onOpenFile);
    }

    function onExistsFile(exists) {
        var value = $textarea.val();

        if(!exists) CD4APort.writeFile(PATH, value, onWriteFile);
    }

    function onResetFile(error) {
        if(error) console.log("An error occurred while writing to the CD4ADefault file!");
        else CD4APort.reloadTab();
    }

    function onClick() {
        var value = $textarea.val();

        CD4APort.writeFile(PATH, value, onResetFile);
    }

    function onConnected() {
        CD4APort.existsFile(PATH, onExistsFile);
        $("#button-reset-cd").on("click", onClick);
    }


    CD4APort.on("connected", onConnected);
});
