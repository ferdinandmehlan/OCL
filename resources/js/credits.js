(function() {
    var labelCredits = document.getElementById("label-credits");
    var creditsOverlay = document.getElementById("credits-overlay");

    function onCreditsClick(event) {
        creditsOverlay.style = "display:block";
    }

    function onOverlayClick(event) {
        creditsOverlay.style = "display:none";
    }

    labelCredits.addEventListener("click", onCreditsClick);
    creditsOverlay.addEventListener("click", onOverlayClick);
})();