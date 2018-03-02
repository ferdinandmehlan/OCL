$(document).ready(function() {
    var $textarea = $("#ocl");
    var PATH = "/example/ocl/Demo.ocl";

    function handleText(oclText) {
        $textarea.val(oclText);
        OCLPort.writeFile(PATH, oclText, onWriteFile);
    }

    function handleGist(gistId) {
        var sUrl = 'https://api.github.com/gists/' + gistId;

        $.get(sUrl, onGetGist);
    }


    function onOpenFile(error) {
        if(error) console.log("An error occurred while opening the CD4A file!");
        else OCLPort.reloadTab();
    }

    function onWriteFile(error) {
        if(error) console.log("An error occurred while writing to the CD4A file!");
        else OCLPort.openFile(PATH, onOpenFile);
    }

    function onExistsFile(exists) {
        var value = $textarea.val();

        if(exists) OCLPort.openFile(PATH, onOpenFile);
        else OCLPort.writeFile(PATH, value, onWriteFile);
    }

    function onClick() {
        var value = $textarea.val();

        OCLPort.writeFile(PATH, value, onWriteFile);
    }

    function onGetGist(data) {
        var oclText = data.files["ocl.txt"];

        $textarea.val(oclText.content);
        OCLPort.writeFile(PATH, oclText.content, onWriteFile);
    }

    function onConnected() {
        var url = new URL(window.location.href);
        var oclText = url.searchParams.get("cd");
        var gistId = url.searchParams.get("gist");

        if(oclText) handleText(oclText);
        else if(gistId) handleGist(gistId);
        else OCLPort.existsFile(PATH, onExistsFile);

        $("#button-reset-ocl").on("click", onClick);
    }


    OCLPort.on("connected", onConnected);
});