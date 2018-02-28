$(document).ready(function() {
    $("#rows").kendoSplitter({
        "orientation": "vertical",
        "panes": [
            { collapsible: true, resizable: true },
            { collapsible: true, resizable: false, size: "50px" },
            { collapsible: true, resizable: true },
            { collapsible: true, resizable: false, size: "50px" }
        ]
    });

    $("#columns-1").kendoSplitter({
        "orientation": "horizontal",
        "panes": [
            { collapsible: true, resizable: true },
            { collapsible: true, resizable: true }
        ]
    });

    $("#columns-2").kendoSplitter({
        "orientation": "horizontal",
        "panes": [
            { collapsible: true, resizable: true },
            { collapsible: true, resizable: true }
        ]
    });

    $("#toolstrip").kendoTooltip({
        "filter": "img",
        "position": "top"
    });

    $("#div-console").kendoTooltip({
        "filter": "img",
        "position": "top"
    });
});