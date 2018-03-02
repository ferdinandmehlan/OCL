define(function(require, exports, module) {
    var DEFAULT_TIMEOUT = 30000;

    var cache = {};
    var nextID = 0;

    function getNextKey() {
        var key = "{{" + nextID++ + "}}";
        return cache.hasOwnProperty(key) ? getNextKey() : key;
    }

    function add(entry, ttl) {
        var key = getNextKey();

        cache[key] = entry;
        ttl = ttl || DEFAULT_TIMEOUT;

        if(ttl > 0) window.setTimeout(remove, ttl, key);

        return key;
    }

    function has(key) {
        return cache.hasOwnProperty(key);
    }

    function remove(key) {
        delete cache[key];
    }

    function get(key) {
        return cache[key];
    }

    return {
        add: add,
        remove: remove,
        has: has,
        get: get
    };
});