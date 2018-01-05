(function() {
    var buttonClear = document.getElementById("button-clear");
    var textareaOutput = document.getElementById("console");

    function onClick(event) {
        textareaOutput.value = '';
    }

    buttonClear.addEventListener("click", onClick);
})();