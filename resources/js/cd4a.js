$(document).ready(function() {
    var $textarea = $("#cd");
    var PATH = "/example/cd/AuctionCD.cd";

    function handleText(cdText) {
        $textarea.text(cdText);
        CD4APort.writeFile(PATH, cdText, onWriteFile);
    }

    function handleGist(gistId) {
        var sUrl = 'https://api.github.com/gists/' + gistId;

        $.get(sUrl, onGetGist);
    }


    function onOpenFile(error) {
        if(error) console.log("An error occurred while opening the CD4A file!");
    }

    function onWriteFile(error) {
        if(error) console.log("An error occurred while writing to the CD4A file!");
        else CD4APort.openFile(PATH, onOpenFile);
    }

    function onExistsFile(exists) {
        var value = $textarea.val();

        if(exists) CD4APort.openFile(PATH, onOpenFile);
        else CD4APort.writeFile(PATH, value, onWriteFile);
    }

    function onResetFile(error) {
        if(error) console.log("An error occurred while writing to the CD4A file!");
        else CD4APort.reloadTab();
    }

    function onClick() {
        var value = $textarea.val();

        CD4APort.writeFile(PATH, value, onResetFile);
    }

    function onGetGist(data) {
        var cd4aText = data.files["cd4A.txt"];

        $textarea.val(cd4aText.content);
        CD4APort.writeFile(PATH, cd4aText.content, onWriteFile);
    }

    function onConnected() {
        var url = new URL(window.location.href);
        var cd4aText = url.searchParams.get("cd");
        var gistId = url.searchParams.get("gist");

        if(cd4aText) handleText(cd4aText);
        else if(gistId) handleGist(gistId);
        else CD4APort.existsFile(PATH, onExistsFile);

        $("#button-reset-cd").on("click", onClick);
    }


    CD4APort.on("connected", onConnected);
});