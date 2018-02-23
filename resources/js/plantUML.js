(function() {
    var cdOutput = document.getElementById("cd-output");
    var cd = document.getElementById("cd");

    function onCDOutputClick(event) {
        cd.src = "http://www.plantuml.com/plantuml/proxy?src=https://raw.githubusercontent.com/ferdinandmehlan/OCL/gh-pages/resources/txt/plantUML.txt";
    }

    cdOutput.addEventListener("click", onCDOutputClick);
})();