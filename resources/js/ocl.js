var OCL = (function() {
    var url1 = new URL(window.location.href);
    var ocl1 = url1.searchParams.get("ocl");
    var gist1 = url1.searchParams.get("gist");

    var PATH = "/example/ocl/Demo.ocl";

    var port = Port("OCL");
    var iframe = document.getElementById("ide-ocl");
    var textarea = document.getElementById("ocl");

    if(gist1) {
        var sUrl = 'https://api.github.com/gists/' + gist1;
        $.get(sUrl, function( data ) {
            var oclTxt = data.files["ocl.txt"];
            textarea.value = oclTxt.content;
            $("#button-reset-ocl").click();
        });
    }


    if (ocl1) {
        textarea.value = ocl1;
    }
    var button = document.getElementById("button-reset-ocl");

    return Common(PATH, port, iframe, textarea, button);
})();