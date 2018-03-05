var Utilities = (function() {
    var methods = {
        query: function(queryString) {
            var pairs = queryString.split('&');
            var result = {};
            var length = pairs.length;

            for(var i = 0; i < length; i++) {
                var pair = pairs[i];
                var parts = pair.split('=');
                var key = parts[0];

                result[key] = parts[1];
            }

            return result;
        },

        occurrences: function(string, search) {
            var occurrences = 0;
            var position = 0;

            while(true) {
                position = string.indexOf(search, position);

                if(position >= 0) {
                    occurrences++;
                    position += search.length;
                } else break;
            }

            return occurrences;
        }
    };

    return methods;
})();