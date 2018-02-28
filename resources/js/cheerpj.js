(function() {
    var buttonExecute = document.getElementById("button-execute");

  function rawStringToBuffer( str ) {
    var idx, len = str.length, arr = new Array( len );
    for ( idx = 0 ; idx < len ; ++idx ) {
        arr[ idx ] = str.charCodeAt(idx) & 0xFF;
    }
    // You may create an ArrayBuffer from a standard array (of values) as follows:
    return new Uint8Array( arr ).buffer;
   }

    function onThen() {
        buttonExecute.classList.remove("disabled");
        $("#console").scrollTop(10000000000);
    }

    function onOCLReadFile(error, oclString) {
        function onCD4AReadFile(error, cdString) {
            if(error) console.error("An error occurred while reading the CD4A file!");
            else {
                // var write = function(fileName, type, content, inodeIdX) {
                /*write("","dir", ["/demo","/example","/DefaultTypes.cd"],1);
                write("/demo","dir", ["/demo.ocl"],2);
                write('/demo/demo.ocl', "file", new Uint8Array(rawStringToBuffer(oclString)), 3);
                write("/example","dir", ["/cd"],2);
                write("/cd","dir", ["/AuctionCD.cd"],3);
                write('/example/cd/AuctionCD.cd', "file", new Uint8Array(rawStringToBuffer(cdString)),4);
                write('/DefaultTypes.cd', "file", new Uint8Array(rawStringToBuffer(
                document.getElementById("cd-default").value)),2); */
                var cdDef = document.getElementById("cd-default").value;
                var lIndex  = cdString.lastIndexOf("}");
                var left = cdDef.indexOf("{");
                var right = cdDef.lastIndexOf("}");
                var str = cdString.substring(0, lIndex) + "\n" + cdDef.substr(left + 1);
                //cheerpjRunMain("ocl.cli.OCLCDTool", "/app/OCL/ocl-1.2.2-cli.jar", "-path", "", "-ocl", "demo.demo").then(onThen);
                cheerpjRunMain("ocl.cli.OCLCDTool", "/app/OCL/ocl-1.2.2-cli.jar", "-ocl", oclString, "-cd", str).then(onThen);
            }
        }

        if(error) console.error("An error occurred while reading the OCL file!");
        else CD4A.readFile(onCD4AReadFile);
    }

    function onClick(event) {
        if(!buttonExecute.classList.contains("disabled")) {
            buttonExecute.classList.add("disabled");
            OCL.readFile(onOCLReadFile);
        }
    }

    // init cheerpj
    cheerpjInit();
    // run once to let cj get the static functions
    //cheerpjRunMain("ocl.cli.OCLCDTool", "/app/OCL/ocl-1.2.2-cli.jar", "-init").then(document.getElementById("console").textContent = '');
    buttonExecute.addEventListener("click", onClick);
})();
