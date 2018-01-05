(function() {
    var buttonExecute = document.getElementById("button-execute");

    function onThen() {
        buttonExecute.classList.remove("disabled");
    }

    function onOCLReadFile(error, oclString) {
        function onCD4AReadFile(error, cdString) {
            if(error) console.error("An error occurred while reading the CD4A file!");
            else cheerpjRunMain("ocl.monticoreocl.ocl.OCLCDTool", "/app/OCL/ocl-1.0.0-SNAPSHOT-jar-with-dependencies-noemf.jar", "-ocl", oclString, "-cd", cdString).then(onThen);
        }

        if(error) console.error("An error occurred while reading the OCL file!");
        else CD.readFile(onCD4AReadFile);
    }

    function onClick(event) {
        if(!buttonExecute.classList.contains("disabled")) {
            buttonExecute.classList.add("disabled");
            OCL.readFile(onOCLReadFile);
        }
    }

    cheerpjInit();
    buttonExecute.addEventListener("click", onClick);
})();