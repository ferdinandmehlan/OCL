$(document).ready(function() {
    var $labelCredits = $("#label-credits");
    var $creditsOverlay = $("#credits-overlay");

    function onCreditsClick(event) {
        $creditsOverlay.show();
    }

    function onOverlayClick(event) {
        $creditsOverlay.hide();
    }

    $labelCredits.on("click", onCreditsClick);
    $creditsOverlay.on("click", onOverlayClick);
});