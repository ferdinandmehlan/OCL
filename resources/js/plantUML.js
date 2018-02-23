(function() {
    var cdOutput = document.getElementById("cd-output");
    var cd = document.getElementById("cd");

    function onCDOutputClick(event) {
        cd.src = "http://www.plantuml.com/plantuml/proxy?src=https://ferdinandmehlan.github.io/OCL/resources/txt/plantUML.txt";
    }

    cdOutput.addEventListener("click", onCDOutputClick);
})();