"use strict";

var DB = {}

let db, settings, configuration, data, files, attendance, fileDetails, account, lifeAndMinistry;

self.onmessage = async function (a) {
    switch (a.data.action) {
        case "init":
            DB.open(a.data.dbName, a.data.t);
            break;
        case "readAll":
            DB.readAll(a.data.storeName, a.data.name, a.data.index);
            break;
        case "save":
            DB.save(a.data.storeName, a.data.value, a.data.page);
            break;
        case "updateResult":
            DB.updateResult(a.data.storeName, a.data.name, a.data.version);
            break;
        case "deleteItem":
            DB.deleteItem(a.data.storeName, a.data.value);
            break;
        case "deleteDB":
            DB.deleteDB(a.data.dbName);
    }
};

DB.open = function(b, c, d) {
    //console.log(b, c, d)
    var a = indexedDB.open(b);
    
    a.onupgradeneeded = function (e) {
        let db = e.target.result;
        
        if (b == "handler") {
            settings = db.createObjectStore('settings',{keyPath: 'name'});
        } else if (b == "congRec") {
            account = db.createObjectStore('account',{keyPath: 'name'});
            attendance = db.createObjectStore('attendance',{keyPath: 'name'});
            configuration = db.createObjectStore('configuration',{keyPath: 'name'});
            data = db.createObjectStore('data',{keyPath: 'name'});
            files = db.createObjectStore('files',{keyPath: 'name'});
            fileDetails = db.createObjectStore('fileDetails',{keyPath: 'name'});
            lifeAndMinistry = db.createObjectStore('lifeAndMinistry',{keyPath: 'name'});
        } else {

        }
        
        self.postMessage({ name: "created" });
                
    }
    a.onsuccess = function (e) {
        db = a.result
        if (b=="handler") {
            DB.readAll("settings")
        } else if (b=="congRec") {
            DB.readAll("configuration")
        } else {
            DB.readAll(b)
            //console.log("Opened Successfully")
            self.postMessage({ name: "ready",b:b });
        };
    }
    a.onerror = function (a) {
        console.log("error");
    };
}

DB.readAll = async function(a, c, e, item) {
    //console.log(a, c, e, item)
    //console.log(db)
    if(!db){return}

    let b = db.transaction(a).objectStore(a),
        f = [],
        d;
    switch (a) {
        case "productionMonitor":
            if(c!==undefined){d = b.index(e).getAll(c)};
            break;
        case "overdue":
            if(c!==undefined){d = b.index(e).getAll(c)};
            break;
        case "completed":
            if(c!==undefined){d = b.index(e).getAll(c)};
            break;
        case "workload":
            if(c!==undefined){d = b.index(e).getAll(c)};
            break;
        default:
            b.openCursor().onsuccess = function (c) {
                let b = c.target.result;
                if (b) {
                    f.push(b.value), b.continue();
                } else self.postMessage({ name: a, value: f, item:item });
            };
            return;
    }
    c
        ? (d.onsuccess = function () {
              void 0 !== d.result ? (self.postMessage({ name: a, requestName: c, index:e, value: d.result })/*, console.log(a, c, e, d.result)*/) : console.log("No such advisor");
          })
        : (b.openCursor().onsuccess = function (c) {
              let b = c.target.result;
              b ? (f.push(b.value), b.continue()) : e ? self.postMessage({ name: a, value: f, t: e }) : self.postMessage({ name: a, value: f });
          });
}
DB.save = function(a, c, d) {
    //console.log(a, c, d)
    var count = 0,val;
    c.forEach(e=>{
        let b = db.transaction([a], "readwrite").objectStore(a).put(e);
        b.onsuccess = function (b) {
            //self.postMessage({ name: "savings", value: "Saved", storeName:a });
        }
        b.onerror = function (a) {
            self.postMessage("something went wrong here");
        };
    })
    if(d){
        self.postMessage({ name: "savings", value: "Saved", storeName:a, page:d });
    }else{
        self.postMessage({ name: "savings", value: "Saved", storeName:a });
    };
}
DB.updateResult = function(a, d, e) {
    let database = db.transaction([a], "readwrite"),
        objectStore = database.objectStore(a);
        objectStore.openCursor().onsuccess = function (f) {
        let b = f.target.result;
        if (b) {
            if (b.value.name === d) {
                let g = b.update(e);
                g.onsuccess = function () {
                    console.log(a + " " + d + " Updated"), self.postMessage({ name: "savings", value: "Updated" });
                };
            }
            b.continue();
        } else console.log("Entries Updated.");
    };
}
DB.deleteItem = function(a, c) {
    let b = db.transaction([a], "readwrite").objectStore(a).delete(c);
    (b.onsuccess = function (e) {
        self.postMessage(["Successfully deleted user in db", a ,c]);
    }),
        (b.onerror = function (e) {
            self.postMessage("something went wrong here");
        });
}
DB.deleteDB = function(b) {
    // Open a connection to the database
    var request = indexedDB.open(b);

    // Handle the success event
    request.onsuccess = function(event) {
    var db = event.target.result;

    // Close the database connection before deleting it
    db.close();

    // Delete the database
    var deleteRequest = indexedDB.deleteDatabase(b);

    // Handle the success event for deleting the database
    deleteRequest.onsuccess = function() {
        console.log('Database deleted successfully');
    };

    // Handle the error event for deleting the database
    deleteRequest.onerror = function(event) {
        console.error('Error deleting database:', event.target.error);
    };
    };

    // Handle the error event for opening the database
    request.onerror = function(event) {
        console.error('Error opening database:', event.target.error);
    };

};