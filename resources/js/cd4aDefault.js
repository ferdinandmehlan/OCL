var CD4ADefault = (function() {
	var url_string = window.location.href;
    var url = new URL(url_string);
    var cd = url.searchParams.get("cd");


    var PATH = "/example/cd/DefaultTypes.cd";

    var port = Port("CD4Default");
    var iframe = document.getElementById("ide-cd");
    var textarea = document.getElementById("cd-default");
    var button = document.getElementById("button-reset-cd");

    return Common(PATH, port, iframe, textarea, button);
})();
