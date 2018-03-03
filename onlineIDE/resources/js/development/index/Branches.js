var Branches = (function() {
    var properties = {
        $panel: null,
        $list: null,
        $back: null,
        branches: [],
        index: -1
    };

    var methods = {
        init: function() {
            methods.addEventListeners();

            delete methods.init;
            return methods;
        },

        load: function() {
            var repository = Repositories.getRepository();

            function onListBranches(error, branches) {
                if(error) Dialog.show("An error occurred while listing the branches.", "error", ["OK"], [], error);
                else methods.addAll(branches);
            }

            Loader.show("Listing Branches...");
            repository.listBranches(onListBranches);
        },

        addEventListeners: function() {
            $(document).ready(events.onDocumentReady);
        },

        addEventHandlers: function() {
            properties.$list.on("click", "li[id!='branches-back']", events.onItemClick);
            properties.$list.on("click", "li[id='branches-back']", events.onBackClick);
        },

        show: function() {
            Repositories.hide();
            properties.$panel.show();
        },

        hide: function() {
            properties.$panel.hide();
            Repositories.show();
        },

        addAll: function(branches) {
            var length = branches.length;

            properties.branches = branches;
            properties.$list.empty();

            for(var i = 0; i < length; i++) {
                methods.add(branches[i]);
            }

            methods.addBack();
            Loader.hide();
            methods.show();
        },

        add: function(branch) {
            var $name = $("<span/>", { "class": "text", "text": branch.name });
            var $item = $("<li/>").append($name);

            properties.$list.append($item);
        },

        addBack: function() {
            var $item = $("<li/>", { id: "branches-back" });

            properties.$list.prepend($item);
        },

        getBranch: function() {
            return properties.branches[properties.index - 1];
        },

        getBranchname: function() {
            var branch = methods.getBranch();

            return branch.name;
        },

        handlePrivate: function() {
            Credentials.show();
        },

        handleCheck: function() {
            var ownername = Users.getUsername();
            var reponame = Repositories.getReponame();
            var branchname = methods.getBranchname();
            var hasProject = Dashboard.hasProject(ownername, reponame, branchname);

            if(hasProject) Dialog.show("Project already exists in the Dashboard!", "warning", ["OK"]);
            else methods.handleClone();
        },

        handleClone: function(username, password) {
            var ownername = Users.getUsername();
            var reponame = Repositories.getReponame();
            var branchname = methods.getBranchname();

            function onInit(error) {
                if(error) {
                    Loader.hide();
                    Dialog.show("An error occurred while cloning the repository.", "error", ["OK"], [], error);
                } else {
                    Dashboard.addProject(ownername, reponame, branchname);
                    Loader.hide();
                    GitHubContainer.hide();
                }
            }

            Loader.show("Preparing Virtual File System...");
            GitHubVFS(ownername, reponame, branchname, username, password).init(onInit);
        }
    };

    var events = {
        onDocumentReady: function(event) {
            properties.$panel = $("#branches-panel");
            properties.$list = $("#branches-list");
            properties.$back = $("#branches-back");

            methods.addEventHandlers();
        },

        onItemClick: function(event) {
            var isPrivate = Repositories.isPrivate();

            properties.index = $(this).index();

            if(isPrivate) methods.handlePrivate();
            else methods.handleCheck();
        },

        onBackClick: function(event) {
            methods.hide();
            Repositories.show();
        }
    };

    return methods.init();
})();