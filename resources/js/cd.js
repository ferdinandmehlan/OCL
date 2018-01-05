var CD = (function() {
    var PATH = "/cd/Demo.cd";

    var port = Port("CD");
    var iframe = document.getElementById("ide-cd");
    var textarea = document.getElementById("cd");
    var button = document.getElementById("button-reset-cd");

    return Common(PATH, port, iframe, textarea, button);
})();