var Search = (function() {
    var properties = {
        $query: null,
        $search: null,
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
            properties.$search.on("click", events.onSearchClick);
            properties.$cancel.on("click", events.onCancelClick);
            properties.$query.on("keyup", events.onKeyUp);
        },

        getQuery: function() {
            return properties.$query.val();
        }
    };

    var events = {
        onDocumentReady: function(event) {
            properties.$query = $("#search-query");
            properties.$search = $("#search-search");
            properties.$cancel = $("#search-cancel");

            methods.addEventHandlers();
        },

        onSearchClick: function(event) {
            Branches.hide();
            Repositories.hide();
            Users.hide();
            Users.load();
        },

        onKeyUp: function(event) {
            if(event.keyCode === 13) {
                events.onSearchClick();
            }
        },

        onCancelClick: function(event) {
            GitHubContainer.hide();
        }
    };

    return methods.init();
})();