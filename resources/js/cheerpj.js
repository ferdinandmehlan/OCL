(function() {
    var buttonExecute = document.getElementById("button-execute");

    function onThen() {
        buttonExecute.classList.remove("disabled");
    }

    function onOCLReadFile(error, oclString) {
        function onCD4AReadFile(error, cdString) {
            if(error) console.error("An error occurred while reading the CD4A file!");
            else cheerpjRunMain("ocl.cli.OCLCDTool", "/app/OCL/ocl-1.2.2-cli.jar", "-ocl", oclString, "-cd", cdString).then(onThen);
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
    cheerpjRunMain("ocl.cli.OCLCDTool", "/app/OCL/ocl-1.2.2-cli.jar", "-init");;
    buttonExecute.addEventListener("click", onClick);
})();
