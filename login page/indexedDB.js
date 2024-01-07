"use strict";

var DB = {}

let db, configuration, data, files;

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
            updateResult(a.data.storeName, a.data.name, a.data.version), "labels" == a.data.storeName && updateResult(a.data.storeName, a.data.id, a.data.value);
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
        configuration = db.createObjectStore('configuration',{keyPath: 'name'});
        data = db.createObjectStore('data',{keyPath: 'name'});
        files = db.createObjectStore('files',{keyPath: 'name'});
        self.postMessage({ name: "created" });
                
    }
    a.onsuccess = function (e) {
        db = a.result
        if (b=="congRec") {
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
    let b = db.transaction([a], "readwrite"),
        c = b.objectStore(a);
    c.openCursor().onsuccess = function (f) {
        let b = f.target.result;
        if (b) {
            if (b.value.name === d) {
                let c = b.value;
                //"productionMonitor" == a && (c.ID = e);
                let g = b.update(c);
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
    (b.onsuccess = function (a) {
        self.postMessage("Successfully deleted user in db");
    }),
        (b.onerror = function (a) {
            self.postMessage("something went wrong here");
        });
}
DB.deleteDB = function(b) {
    var a = window.indexedDB.deleteDatabase(b);
    (a.onerror = function (a) {
        console.log("Error deleting database.");
    }),
        (a.onsuccess = function (a) {
            console.log("Database deleted successfully"), console.log(a.result);
        });
}