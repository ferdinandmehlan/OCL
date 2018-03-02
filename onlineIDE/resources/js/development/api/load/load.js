var Load = (function() {
    var CONSTANTS = {
        RESERVED_KEYS: ["mountPoint", "url"]
    };

    var methods = {
        init: function() {
            methods.addEventListeners();

            delete methods.init;
            return methods;
        },

        addEventListeners: function() {
            Checker.on("checked", events.onChecked);
        },

        load: function() {
            var href = window.location.href;
            var index = href.indexOf('?');
            var queryString = href.substr(index + 1, href.length - 1);
            var query = Utilities.query(queryString);

            methods.checkQuery(query);
        },

        checkQuery: function(query) {
            var mountPoint = query.mountPoint;

            if(mountPoint === undefined) Dialog.show("The specification of a MountPoint is mandatory!", "error");
            else methods.executeQuery(query);
        },

        executeQuery: function(query) {
            var mountPoint = query.mountPoint;
            var url = query.url;
            var parts = mountPoint.split('/');
            var hasProject = Dashboard.hasProject(parts[0], parts[1], parts[2]);

            if(hasProject) methods.redirect(query);
            else if(url === undefined) methods.create(query);
            else methods.clone(query);
        },

        create: function(query) {
            var mountPoint = query.mountPoint;

            function onInit(error) {
                if(error) Dialog.show("An error occurred while initiating the VFS.", "error", [], [], error);
                else methods.handleInit(query);
            }

            Loader.show("Preparing...");
            VFS(mountPoint).init(onInit);
        },

        clone: function(query) {
            var mountPoint = query.mountPoint;
            var url = query.url;

            function onInit(error) {
                if(error) Dialog.show("An error occurred while initiating the VFS.", "error", [], [], error);
                else methods.handleInit(query);
            }

            Loader.show("Preparing...");
            URLVFS(mountPoint, url).init(onInit);
        },

        handleInit: function(query) {
            var mountPoint = query.mountPoint;
            var parts = mountPoint.split('/');

            Dashboard.addProject(parts[0], parts[1], parts[2]);
            methods.redirect(query);
        },

        redirect: function(query) {
            var mountPoint = query.mountPoint;
            var parts = mountPoint.split('/');
            var newQuery = methods.removeReservedKeys(query);
            var queryString = methods.toQueryString(newQuery);

            localStorage.setItem("username", parts[0]);
            localStorage.setItem("reponame", parts[1]);
            localStorage.setItem("branchname", parts[2]);

            window.location.href = "ide.html" + queryString;
        },

        removeReservedKeys: function(query) {
            var keys = Object.getOwnPropertyNames(query);

            function filterFunction(element) {
                return CONSTANTS.RESERVED_KEYS.indexOf(element) === -1;
            }

            var filteredKeys = keys.filter(filterFunction);

            return methods.removeReservedValues(filteredKeys, query);
        },

        removeReservedValues: function(keys, query) {
            var newQuery = {};
            var length = keys.length;

            for(var i = 0; i < length; i++) {
                var key = keys[i];

                newQuery[key] = query[key];
            }

            return newQuery;
        },

        toQueryString: function(query) {
            var keys = Object.getOwnPropertyNames(query);
            var length = keys.length;
            var queryString = "";

            for(var i = 0; i < length; i++) {
                var key = keys[i];

                if(i === 0) queryString += '?';
                if(i > 0) queryString += '&';

                queryString += key + '=' + query[key];
            }

            return queryString;
        }
    };

    var events = {
        onChecked: function(event) {
            methods.load();
        }
    };

    return methods.init();
})();