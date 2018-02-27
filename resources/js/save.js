(function() {

    // First, checks if it isn't implemented yet.
    if (!String.prototype.format) {
      String.prototype.format = function() {
        var args = arguments;
        return this.replace(/{(\d+)}/g, function(match, number) { 
          return typeof args[number] != 'undefined'
            ? args[number]
            : match
          ;
        });
      };
    }

    var buttonSave = document.getElementById("button-save");

   function onClick(event) {

       function onCD4AReadFile(error, cdString) {
           function onOCLReadFile(error, oclString) {
               if(error) console.error("An error occurred while reading the OCL file!");
               else {
                   var data = {"public": false,"files": 
                        {"cd4A.txt": {"content": cdString }, 
                         "ocl.txt":  {"content": oclString}}};
                    var jsonString= JSON.stringify(data);
                    //var strData = '{"public": false,"files": {"cd4A.txt": {"content": "{0}"}}}'
                    //    .format(cdString);
                    //Create an anounymous Gist
                    $.ajax({ 
                        url: 'https://api.github.com/gists',
                        type: 'POST',
                        data: jsonString
                    }).done(function(response) {
                        var id = response.id;
                        var url = new URL(window.location.href);
                        //var params = new URLSearchParams("");
                        //params.append('gist', id);
                        //url.searchParams = params;
                        var sUrl = url.origin + url.pathname + '?gist='+id;
                        if (window.history.replaceState) {
                           //prevents browser from storing history with each change:
                           window.history.replaceState('gist='+id, 'OCLFiddle', sUrl);
                        }
                    });
               }
           }
           if(error) console.error("An error occurred while reading the CD4A file!");
           else {
                OCL.readFile(onOCLReadFile);
           }
      }

      CD4A.readFile(onCD4AReadFile);
  }


    buttonSave.addEventListener("click", onClick);
})();