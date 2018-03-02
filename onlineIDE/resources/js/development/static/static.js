var Static = (function() {
    var CONSTANTS = {
        REGEX: /(["'])(?:(?=(\\?))\2.)*?\1/g,
        EXTENSIONS: ["html", "svg"]
    };

    var methods = {
        init: function() {
            methods.load();

            delete methods.init;
            return methods;
        },

        load: function() {
            var href = window.location.href;
            var index = href.indexOf('?');
            var queryString = href.substr(index + 1, href.length - 1);
            var query = Utilities.query(queryString);

            methods.check(query);
        },

        check: function(query) {
            var method = query.method;

            if(method === undefined) methods.content("The specification of a method is mandatory!");
            else if(methods.hasOwnProperty(method) === false) methods.content("The requested method is not implemented!");
            else methods.execute(query);
        },

        execute: function(query) {
            var method = query.method;

            methods[method].call(null, query);
        },

        content: function(content) {
            var doc = document.open("text/html", "replace");

            doc.write(content);
            doc.close();
        },

        raw: function(query) {
            var mountPoint = query.mountPoint;
            var path = query.path;
            var vfs = VFS(mountPoint);

            function onReadFile(error, content) {
                if(error) methods.content("An error occurred while reading \"" + path + "\".");
                else methods.content(content);
            }

            function onInit(error) {
                if(error) methods.content("An error occurred while initiating the VFS.");
                else vfs.readFile(path, onReadFile);
            }

            vfs.init(onInit);
        },

        rawurlrewrite: function(query) {
            var mountPoint = query.mountPoint;
            var path = query.path;
            var radix = query.radix;
            var vfs = VFS(mountPoint);

            function onReadFile(error, content) {
                if(error) methods.content("An error occurred while reading \"" + path + "\".");
                else methods.handleURLRewrite(content, mountPoint, radix);
            }

            function onInit(error) {
                if(error) methods.content("An error occurred while initiating the VFS.");
                else vfs.readFile(path, onReadFile);
            }

            vfs.init(onInit);
        },

        handleURLRewrite: function(content, mountPoint, radix) {
            var matches = methods.matchContent(content);
            var recMatches = methods.matchMatches(matches);
            var occurrences = methods.filter(recMatches);
            var modContent = methods.replace(content, occurrences, mountPoint, radix);

            methods.content(modContent);
        },

        matchContent: function(content) {
            return content.match(CONSTANTS.REGEX) || [];
        },

        matchMatches: function(matches) {
            for(var i = 0; i < matches.length; i++) {
                var match = matches[i];
                var modMatch = match.substr(1, match.length - 2);
                var recMatches = methods.matchContent(modMatch);

                matches = matches.concat(recMatches);
            }

            return matches;
        },

        filter: function(matches) {
            function filterExtensions(element, index, array) {
                var extensions = CONSTANTS.EXTENSIONS;
                var length = extensions.length;
                var quotation = element.substr(-1);

                for(var i = 0; i < length; i++) {
                    var extension = extensions[i];
                    var condition = element.endsWith('.' + extension + quotation);

                    if(condition) return true;
                }

                return false;
            }

            return matches.filter(filterExtensions);
        },

        replace: function(content, occurrences, mountPoint, radix) {
            var length = occurrences.length;
            var modContent = content;

            for(var i = 0; i < length; i++) {
                var occurrence = occurrences[i];
                var modification = methods.rewrite(occurrence, mountPoint, radix);

                modContent = modContent.replace(occurrence, modification);
            }

            return modContent;
        },

        rewrite: function(occurrence, mountPoint, radix) {
            var value = occurrence.substr(1, occurrence.length - 2);
            var path = (radix || "") + value;
            var queryString = "method=rawurlrewrite&mountPoint=" + mountPoint + "&path=" + path + "&radix=" + radix;
            var url = "static.html?" + queryString;

            return occurrence.replace(value, url);
        }
    };

    return methods.init();
})();