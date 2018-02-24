(function() {
    var cdOutput = document.getElementById("cd-output");

    function onThen() {
        // Send translated file to plantuml
        // cdOutput.src = "";
    }

    function onCD4AReadFile4Print(error, cdString) {
        if(error)
            console.error("An error occurred while reading the CD4A file for visualizing!");
        else {
            var returnVal = cjCall("ocl.cli.OCLCDTool", "printCD2PlantUML", cdString);
            var plantUMLString = cjStringJavatoJS(returnVal);
        }
    }

    function onClick(event) {
        CD4A.readFile(onCD4AReadFile4Print);
    }

    //is already initialized in cheerpj.js
    cheerpjInit();
    cheerpjRunMain("ocl.cli.OCLCDTool", "/app/OCL/ocl-1.2.2-cli.jar").then(function();
    cdOutput.addEventListener("click", onClick);
})();