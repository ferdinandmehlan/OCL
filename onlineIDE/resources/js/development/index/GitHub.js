var GitHub = (function(GitHub) {
    var properties = {
        instance: null
    };

    var methods = {
        getInstance: function() {
            return properties.instance || (properties.instance = new GitHub());
        }
    };

    return methods;
})(GitHub);