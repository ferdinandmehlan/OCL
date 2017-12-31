(function() {
    var button = document.getElementById("button");
    var console = document.getElementById("console");

    function onClick(event) {
        if(button.disabled) return;

        button.disabled = true;
        console.value = "";

        var oclString = document.getElementById('ocl').value;
        var cdString = document.getElementById('cd').value;

        cheerpjRunMain("ocl.monticoreocl.ocl.OCLCDTool", "/app/ocl-0.0.9-SNAPSHOT-jar-with-dependencies-noemf.jar", "-ocl", oclString, "-cd", cdString);

        button.disabled = false;
    }

    cheerpjInit();
    button.addEventListener("click", onClick);
})();