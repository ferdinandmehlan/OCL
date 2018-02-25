(function() {
    var cdOutput = document.getElementById("cd-output");
    var plantUMLString = "@startuml\n@enduml";

    function getPng() {
        // Send translated file to plantuml
        cdOutput.src = "resources/txt/plantUML.png";
    }

    function onCD4AReadFile4Print(error, cdString) {
        if(error)
            console.error("An error occurred while reading the CD4A file for visualizing!");
        else {
            //var returnVal = cjCall("ocl.cli.OCLCDTool", "printCD2PlantUML", cdString).then(plantUMLString = cjStringJavaToJs(returnVal)).then(getPng);
            cheerpjRunMain("net.sourceforge.plantuml.Run", "/app/OCL/plantuml.jar").then(getPng);
        }
    }

    function onClick(event) {
        CD4A.readFile(onCD4AReadFile4Print);
    }

    //is already initialized in cheerpj.js
    cheerpjInit();
    //cheerpjRunMain("ocl.cli.OCLCDTool", "/app/OCL/ocl-1.2.2-cli.jar");
    cdOutput.addEventListener("click", onClick);
})();