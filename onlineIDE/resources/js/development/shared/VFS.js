var VFS = function(mountPoint) {
	var properties = {
		fs: null,
        callbacks: {}
	};
	
	var methods = {
		init: function(callback) {
			var System = {};

			BrowserFS.install(System);
			BrowserFS.configure({
				fs: "IndexedDB",
				options: {
					storeName: mountPoint
				}
			}, function(error) {
				properties.fs = System.require("fs");
				callback(error);
			});
		},

        trigger: function(error, event, path) {
            var callbacks = properties.callbacks[path] || [];
            var length = callbacks.length;

            for(var i = 0; i < length; i++) {
                callbacks[i](error, event, path);
            }
        },

        getMetadataPath: function(path) {
		    return "/.c9/metadata" + path;
        },

        normalizePath: function(path) {
            path = path.charAt(0) === '/' ? path : '/' + path;
            return path.replace('~', ".home");
        },

        normalizeDirectory: function(path) {
            path = methods.normalizePath(path);
            return path.substr(-1) === '/' ? path : path + '/';
        },

        normalizeFile: function(path) {
            path = methods.normalizePath(path);
		    return path.substr(-1) === '/' ? path.substr(0, path.length - 1) : path;
        },

        readFile: function(path, encoding, callback) {
		    if(typeof encoding === "function") { callback = encoding; encoding = "utf8"; }

            path = methods.normalizeFile(path);
            callback = callback || function() {};
            properties.fs.readFile(path, encoding, callback);
        },

        readFileWithMetadata: function(path, options, callback) {
            var metadataPath = methods.getMetadataPath(path);
            var encoding = options.encoding || "utf8";

            callback = callback || function() {};
            methods.readFile(path, encoding, function(errorOuter, data) {
                methods.readFile(metadataPath, encoding, function(errorInner, metadata) {
                    callback(errorOuter /*|| errorInner*/, data, metadata || "");
                });
            });
		},

        writeFile: function(path, data, encoding, callback, nocheck) {
            if(typeof encoding === "function") { nocheck = callback; callback = encoding; encoding = "utf8"; }
            if(data === null) { data = ""; }
            path = methods.normalizeFile(path);
            callback = callback || function() {};
            var subPath = path.substr(0, path.lastIndexOf('/') + 1);

            if(nocheck === undefined && subPath.length > 1) {
                methods.mkdirP(subPath, function(error, result) {
                    properties.fs.writeFile(path, data, encoding, function(error, result) {
                        callback(error, result);
                    });
                });
            } else {
                properties.fs.writeFile(path, data, encoding, function(error, result) {
                    callback(error, result);
                });
            }
        },

        appendFile: function(path, data, encoding, callback) {
            if(typeof encoding === "function") { callback = encoding; encoding = "utf8"; }
            path = methods.normalizeFile(path);
            callback = callback || function() {};
		    properties.fs.appendFile(path, data, encoding, function(error, result) {
		        callback(error, result);
		        //methods.trigger(error, "change", path);
            });
        },

        readdir: function(path, callback) {
            path = methods.normalizeDirectory(path);
            callback = callback || function() {};
            properties.fs.readdir(path, function(errorOuter, result) {
                var data = [];

                recursion();
                function recursion() {
                    var pathi = path + result.shift();

                    methods.stat(pathi, function(errorInner, stat) {
                        data.push(stat);

                        if(result.length === 0) {
                            callback(errorOuter || errorInner, data);
                        } else {
                            recursion();
                        }
                    });
                }
            });
        },

        exists: function(path, callback) {
            path = methods.normalizePath(path);
            callback = callback || function() {};
		    properties.fs.exists(path, callback);
        },

        stat: function(path, callback) {
            var paths = path.split('/');
            var length = paths.length;

            path = methods.normalizePath(path);
            callback = callback || function() {};
            properties.fs.stat(path, function(error, result) {
                if(error) {
                    callback(error);
                } else {
                    var data = {};
                    data.name = paths[length - 1] === "" ? paths[length - 2] : paths[length - 1];
                    data.fullPath = path;
                    data.size = result.size;
                    data.mtime = new Date(result.mtime).getTime();
                    data.mime = result.isDirectory() ? "folder" : "file";
                    data.link = false;
                    data.linkStat = {};
                    callback(error, data);
                }
            });
        },

        rename: function(from, to, options, callback) {
            if(typeof options === "function") { callback = options; options = {}; }
            from = methods.normalizePath(from);
            to = methods.normalizePath(to);
            callback = callback || function() {};
            properties.fs.rename(from, to, function(error, result) {
                callback(error, result);
                //methods.trigger(error, "rename", to);
            });
        },

        mkdirP: function(path, callback) {
            path = methods.normalizeDirectory(path);
            callback = callback || function() {};

		    var nodes = path.split('/');
		    var node = nodes.shift() + '/';

            recursion();

		    function recursion() {
                node += nodes.shift() + '/';
                properties.fs.mkdir(node, function(error, result) {
                    if(nodes.length === 1) {
                        callback(error, result);
                        methods.trigger(error, "directory", path);
                    } else {
                        recursion();
                    }
                });
            }
        },

        mkdir: function(path, callback) {
            path = methods.normalizeDirectory(path);
            callback = callback || function() {};
            properties.fs.mkdir(path, function(error, result) {
                callback(error, result);
                methods.trigger(error, "directory", path);
            });
        },

        unlink: function(path, callback) {
            path = methods.normalizePath(path);
            callback = callback || function() {};
		    properties.fs.unlink(path, function(error, result) {
		        callback(error, result);
		        methods.trigger(error, "change", path);
            });
        },

        rmfile: function(path, callback) {
            path = methods.normalizeFile(path);
            callback = callback || function() {};
		    properties.fs.unlink(path, function(error, result) {
		        callback(error, result);
		        methods.trigger(error, "change", path);
            });
        },

        rmdir: function(path, options, callback) {
            if(typeof options === "function") { callback = options; options = {}; }
            path = methods.normalizeDirectory(path);
            callback = callback || function() {};
		    properties.fs.rmdir(path, function(error, result) {
		        callback(error, result);
		        methods.trigger(error, "change", path);
            });
        },

        copy: function(from, to, options, callback) {
            if(typeof options === "function") { callback = options; options = {}; }
            methods.stat(from, function(error, stat) {
                if(error) callback(error);
                else if(stat.mime === "folder") methods.copyDir(from, to, callback);
                else methods.copyFile(from, to, callback);
            });
        },

        copyDir: function(from, to, callback) {
		    var stack = [from];

		    function onCopy(error) {
                if(error) callback(error);
            }

		    function onReadDir(error, contents) {
                if(error) {
                    callback(error);
                } else {
                    var length = contents.length;

                    for(var i = 0; i < length; i++) {
                        var content = contents[i];
                        var fromPath = content.fullPath;

                        if(content.mime === "folder") {
                            stack.push(fromPath);
                            recursion();
                        } else {
                            var toPath = fromPath.replace(from, to);

                            methods.copyFile(fromPath, toPath, onCopy);
                        }
                    }
                }
            }

		    function recursion() {
                if(stack.length === 0) {
                    callback(null);
                } else {
                    var fromDir = stack.pop();

                    methods.readdir(fromDir, onReadDir);
                }
            }

            recursion();
        },

        copyFile: function(from, to, callback) {
            methods.readFile(from, function(errorOuter, content) {
                methods.writeFile(to, content, function(errorInner) {
                    callback(errorOuter || errorInner);
                });
            });
        },

        chmod: function(path, mode, callback) {
            path = methods.normalizePath(path);
            callback = callback || function() {};
            properties.fs.chmod(path, mode, callback);
        },

        symlink: function(path, target, callback) {
            path = methods.normalizePath(path);
            callback = callback || function() {};
		    properties.fs.symlink(path, target, callback);
        },

        metadata: function(path, data, callback) {
            path = methods.normalizePath(path);
            var metadataPath = methods.getMetadataPath(path);

            methods.writeFile(metadataPath, data, callback);
        },

        watch: function(path, callback) {
            path = methods.normalizePath(path);
            var callbacks = properties.callbacks;

            callbacks[path] = callbacks[path] || [];
            callbacks[path].push(callback);
            methods.trigger(null, "init", path);
        },

        unwatch: function(path, callback) {
            path = methods.normalizePath(path);
            var callbacks = properties.callbacks[path] || [];
            var index = callbacks.indexOf(callback);

            if(index > -1) {
                callbacks.splice(index, 1);
            }
        }
	};
	
	return methods;
};