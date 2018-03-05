/**
 * This file extends the functionality of the default
 * HTTP plugin of Cloud9 by simplifying the information
 * that has to be provided with a function call.
 */
"use strict";

define(function(require, exports, module) {
    exports.HTTP = function(http) {
        var CONSTANTS = {
            PROTOCOL: "http",
            HOST: "localhost",
            PORT: 8081
        };

        var methods = {
            getURL: function(path) {
                return CONSTANTS.PROTOCOL
                    + "://" + CONSTANTS.HOST
                    + ':' + CONSTANTS.PORT
                    + path;
                //return path;
            },

            get: function(path, queryParams, callback) {
                var url = methods.getURL(path);

                http.request(url, {
                    method: "GET",
                    query: queryParams
                }, callback);
            },

            post: function(path, data, callback) {
                var url = methods.getURL(path);
                var dataString = JSON.stringify(data);

                http.request(url, {
                    method: "POST",
                    body: dataString,
                }, callback);
            }
        };

        return methods;
    };
});