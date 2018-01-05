(function() {
    var button = document.getElementById("button");

    function onThen() {
        button.classList.remove("disabled");
    }

    function onOCLReadFile(data) {
        var oclString = data.payload[0];

        function onCD4AReadFile(data) {
            var cdString = data.payload[0];

            cheerpjRunMain("ocl.monticoreocl.ocl.OCLCDTool", "/app/OCL/ocl-1.0.0-SNAPSHOT-jar-with-dependencies-noemf.jar", "-ocl", oclString, "-cd", cdString).then(onThen);
        }

        CD4A.readFile(onCD4AReadFile);
    }

    function onClick(event) {
        button.classList.add("disabled");
        OCL.readFile(onOCLReadFile);
    }

    cheerpjInit();
    button.addEventListener("click", onClick);
})();
