$(document).ready(function() {
    var CD_PATH = "/example/cd/AuctionCD.cd";
    var OCL_PATH = "/example/ocl/Demo.ocl";

    function createGistData(cdString, oclString) {
        return {
            "public": false,
            "files": {
                "cd4A.txt": {
                    "content": cdString
                },
                "ocl.txt": {
                    "content": oclString
                }
            }
        };
    }

    function createGist(cdString, oclString) {
        var data = createGistData(cdString, oclString);
        var jsonString = JSON.stringify(data);
        //var strData = '{"public": false,"files": {"cd4A.txt": {"content": "{0}"}}}'
        //    .format(cdString);
        //Create an anounymous Gist
        $.ajax({
            url: 'https://api.github.com/gists',
            type: 'POST',
            data: jsonString
        }).done(onResponse);
    }


    function onResponse(response) {
        var id = response.id;
        var url = new URL(window.location.href);
        //var params = new URLSearchParams("");
        //params.append('gist', id);
        //url.searchParams = params;
        var sUrl = url.origin + url.pathname + "?gist=" + id;

        if(window.history && window.history.replaceState) {
            //prevents browser from storing history with each change:
            window.history.replaceState("gist=" + id, "OCLFiddle", sUrl);
        }
    }

    function onCD4AReadFile(error, cdString) {
        function onOCLReadFile(error, oclString) {
            if(error) console.error("An error occurred while reading the OCL file!");
            else createGist(cdString, oclString);
        }

        if(error) console.error("An error occurred while reading the CD4A file!");
        else OCLPort.readFile(OCL_PATH, onOCLReadFile);
    }

    function onClick(event) {
        CD4APort.readFile(CD_PATH, onCD4AReadFile);
    }

    $("#button-save").on("click", onClick);
});