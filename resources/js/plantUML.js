(function() {
    var buttonTest = document.getElementById("button-plantUMLtest");
    var cdOutput = document.getElementById("cd-output");

    function onThen() {
        // Send translated file to plantuml

    }

    function onCD4AReadFile4Print(error, cdString) {
        if(error)
            console.error("An error occurred while reading the CD4A file for visualizing!");
        else
            cheerpjRunMain("ocl.cli.OCLCDTool", "/app/OCL/ocl-1.2.2-cli.jar", "-printSrc", cdString, "-printTgt", "resources/txt/plantUML.txt").then(onThen);
    }

    function onClick(event) {
            CD4A.readFile(onCD4AReadFile4Print);
    }

    //is already initialized in cheerpj.js
    //cheerpjInit();
    buttonTest.addEventListener("click", onClick);
})();