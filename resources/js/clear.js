$(document).ready(function() {
    var $buttonClear = $("#button-clear");
    var textareaOutput = document.getElementById("console");

    function onClick(event) {
        textareaOutput.textContent = '';
    }

    $buttonClear.on("click", onClick);
});