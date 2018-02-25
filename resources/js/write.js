var write = function(fileName, content) {
  function string2Bin(str) {
    var result = [];
    for (var i = 0; i < str.length; i++) {
        result.push(str.charCodeAt(i));
    }
    return result;
  }

        var request = window.indexedDB.open("cjFS_/files/", 1);
        var db;
        request.onerror = function(event) {
          alert("Unable to open database!");
        };
        request.onsuccess = function(event) {
            db = this.result;
            var transaction = db.transaction(["files"],"readwrite");
            var objectStore = transaction.objectStore("files");
            var binContent = string2Bin(content);
            var request = objectStore.put(binContent, fileName);
            request.onerror = function(event) {
              alert("Unable to retrieve daa from database!");
            };
            request.onsuccess = function(event) {
              //alert('wrote sucesful file to database');
            };
        };

        return false;
};