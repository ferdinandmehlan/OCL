(function() {
    var buttonExecute = document.getElementById("button-execute");

    function onThen() {
        buttonExecute.classList.remove("disabled");
    }

    function onOCLReadFile(data) {
        var oclString = data.payload[0];

        function onCD4AReadFile(data) {
            var cdString = data.payload[0];

            cheerpjRunMain("ocl.monticoreocl.ocl.OCLCDTool", "/app/ocl-1.0.0-SNAPSHOT-jar-with-dependencies-noemf.jar", "-ocl", oclString, "-cd", cdString).then(onThen);
        }

        CD.readFile(onCD4AReadFile);
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