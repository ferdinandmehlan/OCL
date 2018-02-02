(function() {
    var buttonClear = document.getElementById("button-clear");
    var textareaOutput = document.getElementById("console");

    function onClick(event) {
        textareaOutput.textContent = '';
    }

    buttonClear.addEventListener("click", onClick);
})();