var Users = (function() {
    var properties = {
        $panel: null,
        $list: null,
        users: [],
        index: -1
    };

    var methods = {
        init: function() {
            methods.addEventListeners();

            delete methods.init;
            return methods;
        },

        load: function() {
            var query = Search.getQuery();
            var instance = GitHub.getInstance();
            var parameters = { "q": query, "in": "login" };

            function onSearch(error, users) {
                if(error) Dialog.show("An error occurred while listing the users. You might need to specify a more specific query.", "warning", ["OK"], [], error);
                else methods.addAll(users);
            }

            Loader.show("Listing Users...");
            instance.search().forUsers(parameters, onSearch);
        },

        addEventListeners: function() {
            $(document).ready(events.onDocumentReady);
        },

        addEventHandlers: function() {
            properties.$list.on("click", "li", events.onItemClick);
        },

        show: function() {
            properties.$panel.show();
        },

        hide: function() {
            properties.$panel.hide();
        },

        addAll: function(users) {
            var length = users.length;

            properties.users = users;
            properties.$list.empty();

            for(var i = 0; i < length; i++) {
                methods.add(users[i]);
            }

            Loader.hide();
            methods.show();
        },

        add: function(user) {
            var $username = $("<span/>", { "class": "text", "text": user.login });
            var $item = $("<li/>").append($username);

            if(user.type === "Organization") {
                $item.css("background", "url('resources/media/images/Group.svg') no-repeat center");
            }

            properties.$list.append($item);
        },

        getUser: function() {
            var instance = GitHub.getInstance();
            var username = methods.getUsername();

            return instance.getUser(username);
        },

        getUsername: function() {
            var user = properties.users[properties.index];

            return user.login;
        }
    };

    var events = {
        onDocumentReady: function(event) {
            properties.$panel = $("#users-panel");
            properties.$list = $("#users-list");

            methods.addEventHandlers();
        },

        onItemClick: function(event) {
            properties.index = $(this).index();

            methods.hide();
            Repositories.load();
        }
    };

    return methods.init();
})();