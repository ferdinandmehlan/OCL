var Menu = (function() {
    var CONSTANTS = {
        DEMO: {
            USERNAME: "EmbeddedMontiArc",
            REPONAME: "Documentation"
        }
    };

    var properties = {
        $menu: null,
        $newProject: null,
        $fromGitHub: null,
        $demo: null,
        $cancel: null
    };

    var methods = {
        init: function() {
            methods.addEventListeners();

            delete methods.init;
            return methods;
        },

        addEventListeners: function() {
            $(document).ready(events.onDocumentReady);
        },

        addEventHandlers: function() {
            properties.$newProject.on("click", events.onNewProjectClick);
            properties.$fromGitHub.on("click", events.onFromGitHubClick);
            properties.$demo.on("click", events.onDemoClick);
            properties.$cancel.on("click", events.onCancelClick);
        },

        show: function() {
            properties.$menu.slideDown();
        },

        hide: function() {
            properties.$menu.slideUp();
        }
    };

    var events = {
        onDocumentReady: function() {
            properties.$menu = $("#menu-panel");
            properties.$newProject = $("#menu-item-new-project");
            properties.$fromGitHub = $("#menu-item-from-github");
            properties.$demo = $("#menu-item-demo");
            properties.$cancel = $("#menu-item-cancel");

            methods.addEventHandlers();
        },

        onNewProjectClick: function(event) {
        },

        onFromGitHubClick: function(event) {
            GitHubContainer.show();
        },

        onDemoClick: function(event) {
            Demos.load();
        },

        onCancelClick: function(event) {
            methods.hide();
        }
    };

    return methods.init();
})();