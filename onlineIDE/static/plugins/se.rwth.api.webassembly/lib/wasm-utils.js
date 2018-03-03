/**
 * @author Mozilla Developer Network
 */
function instantiateCachedURL(dbVersion, url, imports) {
    var DATABASE_NAME = "WASM-Cache";
    var OBJECT_STORE_NAME = "WASM-Cache";

    function openDatabase() {
        function promiseFunction(resolve, reject) {
            var request = window.indexedDB.open(DATABASE_NAME, dbVersion);

            function onError(event) {
                reject(event.target.result);
            }

            function onSuccess(event) {
                resolve(event.target.result);
            }

            function onUpgradeNeeded(event) {
                var database = event.target.result;
                var contains = database.objectStoreNames.contains(OBJECT_STORE_NAME);

                if(contains) {
                    database.deleteObjectStore(OBJECT_STORE_NAME);
                }

                database.createObjectStore(OBJECT_STORE_NAME);
            }

            request.onerror = onError;
            request.onsuccess = onSuccess;
            request.onupgradeneeded = onUpgradeNeeded;
        }

        return new Promise(promiseFunction);
    }

    function lookupInDatabase(database) {
        function promiseFunction(resolve, reject) {
            var objectStore = database.transaction([OBJECT_STORE_NAME]).objectStore(OBJECT_STORE_NAME);
            var request = objectStore.get(url);

            function onError(event) {
                reject(event.target.result);
            }

            function onSuccess(event) {
                var value = event.target.result;

                if(value) resolve(value);
                else reject();
            }

            request.onerror = onError;
            request.onsuccess = onSuccess;
        }

        return new Promise(promiseFunction);
    }

    function storeInDatabase(database, results) {
        function promiseFunction(resolve, reject) {
            var objectStore = database.transaction([OBJECT_STORE_NAME], "readwrite").objectStore(OBJECT_STORE_NAME);

            try {
                var request = objectStore.put(results.module, url);

                function onError(event) {
                    reject(event.target.result);
                }

                function onSuccess(event) {
                    resolve(results.instance);
                }

                request.onerror = onError;
                request.onsuccess = onSuccess;
            } catch(error) {
                resolve(results.instance);
            }
        }

        return new Promise(promiseFunction);
    }

    function fetchAndInstantiate() {
        function onArrayBuffer(buffer) {
            return WebAssembly.instantiate(buffer, imports);
        }

        function onResponse(response) {
            return response.arrayBuffer();
        }

        return fetch(url).then(onResponse).then(onArrayBuffer);
    }

    function onOpenDatabase(database) {
        function onLookupInDatabase(module) {
            return WebAssembly.instantiate(module, imports);
        }

        function onLookupInDatabaseFailed() {
            function onFetchAndInstantiate(results) {
                return storeInDatabase(database, results);
            }

            return fetchAndInstantiate().then(onFetchAndInstantiate);
        }

        return lookupInDatabase(database).then(onLookupInDatabase, onLookupInDatabaseFailed);
    }

    function onOpenDatabaseFailed() {
        function onFetchAndInstantiate(results) {
            return results.instance;
        }

        return fetchAndInstantiate().then(onFetchAndInstantiate);
    }

    return openDatabase().then(onOpenDatabase, onOpenDatabaseFailed);
}