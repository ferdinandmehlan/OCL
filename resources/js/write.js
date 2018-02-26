var write = function(fileName, type, content, inodeIdX) {

        var request = window.indexedDB.open("cjFS_/files/", 1);
        var db;
        request.onerror = function(event) {
          alert("Unable to open database!");
        };
        request.onsuccess = function(event) {
            db = this.result;
            var transaction = db.transaction(["files"],"readwrite");
            var objectStore = transaction.objectStore("files");
            var file = {type:type, contents:content, inodeId:inodeIdX};
            var request = objectStore.put(file, fileName);
            request.onerror = function(event) {
              alert("Unable to retrieve daa from database!");
            };
            request.onsuccess = function(event) {
              //alert('wrote sucesful file to database');
            };
        };

        return false;
};