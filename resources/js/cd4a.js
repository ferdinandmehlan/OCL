var CD4A = (function() {
    var textarea = document.getElementById("cd");

    var url1 = new URL(window.location.href);
    var cd1 = url1.searchParams.get("cd");
    var gist1 = url1.searchParams.get("gist");
        

    var PATH = "/example/cd/AuctionCD.cd";
    
    var port = Port("CD");
    var iframe = document.getElementById("ide-cd");
    
    if(gist1) {
        var sUrl = 'https://api.github.com/gists/' + gist1;
        $.get(sUrl, function( data ) {
            var cd4ATxt = data.files["cd4A.txt"];
            textarea.value = cd4ATxt.content;
            $("#button-reset-cd").click();
        });
    }


    if(cd1) {
        textarea.value = cd1;
    }

    var button = document.getElementById("button-reset-cd");

    return Common(PATH, port, iframe, textarea, button);
})();