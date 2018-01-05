(function() {
    var imgCredits = document.getElementById("img-credits");
    var creditsOverlay = document.getElementById("credits-overlay");

    function onCreditsClick(event) {
        creditsOverlay.style = "display:block";
    }

    function onOverlayClick(event) {
        creditsOverlay.style = "display:none";
    }

    imgCredits.addEventListener("click", onCreditsClick);
    creditsOverlay.addEventListener("click", onOverlayClick);
})();