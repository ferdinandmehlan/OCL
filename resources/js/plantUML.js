(function() {
    var cdOutput = document.getElementById("cd-output");
    var plantUMLString = "@startuml\n@enduml";

    function setPng() {
        // set new image
        cdOutput.src = "resources/txt/plantUML.png";
    }

    function getPng() {
        // generate new image
        // cheerpjRunMain("net.sourceforge.plantuml.Run", "/app/OCL/plantuml.jar", "resources/txt/plantUML.txt").then(setPng);
    }

    function onCD4AReadFile4Print(error, cdString) {
        if(error)
            console.error("An error occurred while reading the CD4A file for visualizing!");
        else {
            // translate MC-CD to plantUML-CD
            var plantumlCjString = cjCall("ocl.cli.OCLCDTool", "printCD2PlantUML", cdString);
            var plantumlJsString = cjStringJavaToJs(plantumlCjString);
            // or try and write to file
            cheerpjRunMain("ocl.cli.OCLCDTool", "/app/OCL/ocl-1.2.2-cli.jar", "-printSrc", cdString, "-printTgt", "plantUML.txt").then(getPng);
        }
    }

    function onClick(event) {
        CD4A.readFile(onCD4AReadFile4Print);
    }

    cdOutput.addEventListener("click", onClick);
})();