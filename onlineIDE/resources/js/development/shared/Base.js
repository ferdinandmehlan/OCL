(function() {
    var pathname = window.location.pathname;
    var index = pathname.lastIndexOf('/');

    window.location.base = pathname.substr(0, index);
})();