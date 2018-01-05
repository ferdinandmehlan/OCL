var OCL = (function() {
    var PATH = "/ocl/Demo.ocl";

    var port = Port("OCL");
    var iframe = document.getElementById("ide-ocl");
    var textarea = document.getElementById("ocl");
    var button = document.getElementById("button-reset-ocl");

    return Common(PATH, port, iframe, textarea, button);
})();