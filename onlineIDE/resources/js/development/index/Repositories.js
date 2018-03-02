var Repositories = (function() {
    var properties = {
        $panel: null,
        $list: null,
        repositories: [],
        index: -1
    };

    var methods = {
        init: function() {
            methods.addEventListeners();

            delete methods.init;
            return methods;
        },

        load: function() {
            var user = Users.getUser();

            function onListRepos(error, repositories) {
                if(error) Dialog.show("An error occurred while listing the repositories.", "error", ["OK"], [], error);
                else methods.addAll(repositories);
            }

            Loader.show("Listing Repositories...");
            user.listRepos(onListRepos);
        },

        addEventListeners: function() {
            $(document).ready(events.onDocumentReady);
        },

        addEventHandlers: function() {
            properties.$list.on("click", "li[id!='repositories-back']", events.onItemClick);
            properties.$list.on("click", "li[id='repositories-back']", events.onBackClick);
        },

        show: function() {
            properties.$panel.show();
        },

        hide: function() {
            properties.$panel.hide();
        },

        addAll: function(repositories) {
            var length = repositories.length;

            properties.repositories = repositories;
            properties.$list.empty();

            for(var i = 0; i < length; i++) {
                methods.add(repositories[i]);
            }

            methods.addBack();
            Loader.hide();
            methods.show();
        },

        add: function(repository) {
            var $reponame = $("<span/>", { "class": "text", "text": repository.name });
            var $item = $("<li/>").append($reponame);

            properties.$list.append($item);
        },

        addBack: function() {
            var $item = $("<li/>", { id: "repositories-back" });

            properties.$list.prepend($item);
        },

        getRepository: function() {
            var instance = GitHub.getInstance();
            var reponame = methods.getReponame();
            var username = Users.getUsername();

            return instance.getRepo(username, reponame);
        },

        getReponame: function() {
            var repository = properties.repositories[properties.index - 1];

            return repository.name;
        },

        isPrivate: function() {
            var repository = properties.repositories[properties.index - 1];

            return repository.private;
        }
    };

    var events = {
        onDocumentReady: function(event) {
            properties.$panel = $("#repositories-panel");
            properties.$list = $("#repositories-list");

            methods.addEventHandlers();
        },

        onItemClick: function(event) {
            properties.index = $(this).index();

            methods.hide();
            Branches.load();
        },

        onBackClick: function(event) {
            methods.hide();
            Users.show();
        }
    };

    return methods.init();
})();