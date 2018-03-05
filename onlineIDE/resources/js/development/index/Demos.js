var Demos = (function() {
    var CONSTANTS = {
        USERNAME: "EmbeddedMontiArc",
        REPONAME: "Demos",
        BRANCHNAME: "master"
    };

    var properties = {
        $panel: null,
        $list: null,
        $back: null,
        contents: [],
        index: -1
    };

    var methods = {
        init: function() {
            methods.addEventListeners();

            delete methods.init;
            return methods;
        },

        load: function() {
            var instance = GitHub.getInstance();
            var repository = instance.getRepo(CONSTANTS.USERNAME, CONSTANTS.REPONAME);

            function onGetContents(error, contents) {
                if(error) Dialog.show("An error occurred while listing the demos.", "error", ["OK"], [], error);
                else methods.addAll(contents);
            }

            Loader.show("Listing Demos...");
            repository.getContents(CONSTANTS.BRANCHNAME, "", false, onGetContents);
        },

        addEventListeners: function() {
            $(document).ready(events.onDocumentReady);
        },

        addEventHandlers: function() {
            properties.$list.on("click", "li[id!='demos-back']", events.onDemoClick);
            properties.$list.on("click", "li[id='demos-back']", events.onBackClick);
        },

        show: function() {
            Dashboard.hide();
            properties.$panel.show();
        },

        hide: function() {
            properties.$panel.hide();
            Dashboard.show();
            Menu.hide();
        },

        addAll: function(contents) {
            var length = contents.length;

            properties.contents = contents;
            properties.$list.empty();

            for(var i = 0; i < length; i++) {
                methods.add(contents[i]);
            }

            methods.addBack();
            Loader.hide();
            methods.show();
        },

        add: function(content) {
            var name = content.name.replace(".zip", '');
            var $title = $("<span/>", { "class": "text", "text": name });
            var $item = $("<li/>").append($title);

            properties.$list.append($item);
        },

        addBack: function() {
            var $item = $("<li/>", { id: "demos-back" });

            properties.$list.prepend($item);
        }
    };

    var events = {
        onDocumentReady: function(event) {
            properties.$panel = $("#demos-panel");
            properties.$list = $("#demos-list");
            properties.$back = $("#demos-back");

            methods.addEventHandlers();
        },

        onDemoClick: function(event) {
            var index = $(this).index();
            var content = properties.contents[index - 1];
            var name = content.path.replace(".zip", '');
            var hasProject = Dashboard.hasProject(CONSTANTS.USERNAME, CONSTANTS.REPONAME, name);

            if(hasProject) {
                Dialog.show("Project already exists in the Dashboard!", "warning", ["OK"]);
            } else {
                function onInit(error) {
                    if(error) {
                        Dialog.show("An error occurred while adding the demo.", "error", ["OK"], [], error);
                    } else {
                        methods.hide();
                        Dashboard.addProject(CONSTANTS.USERNAME, CONSTANTS.REPONAME, name);
                        Loader.hide();
                    }
                }

                Loader.show("Preparing Virtual File System...");
                DemoVFS(CONSTANTS.USERNAME, CONSTANTS.REPONAME, content.path).init(onInit);
            }
        },

        onBackClick: function(event) {
            methods.hide();
        }
    };

    return methods.init();
})();