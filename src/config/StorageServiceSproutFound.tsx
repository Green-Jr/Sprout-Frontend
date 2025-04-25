import { Constans } from "../utils/Constans";
import * as idb from 'idb';
const initialize = async () => {
    if (!('indexedDB' in window)) {
      
        return;
    }
    return;
}
initialize().then(() => {
   
}).catch(() => {
   
})
const DB_INDEXED_NAME = Constans.DB_INDEXED_NAME;
const dbPromise = idb.openDB(DB_INDEXED_NAME, 1, {
    upgrade(upgradeDb, _F, _K) {
        if (!upgradeDb.objectStoreNames.contains(DB_INDEXED_NAME)) {
            upgradeDb.createObjectStore(DB_INDEXED_NAME);
        }
    }
});
export const StorageService = {
    async get(key: any) {
        let keyValue = await (await dbPromise).get(DB_INDEXED_NAME, btoa(key));
        let value: any = keyValue ? atob(keyValue) : undefined;
        try {
            let objectvalue = JSON.parse(value);
            value = objectvalue;
        } catch (e) { }
        return value;
    },
    async set(key: any, val: any) {
        return (await dbPromise).put(DB_INDEXED_NAME, btoa(typeof val === 'object' ? JSON.stringify(val) : val), btoa(key));
    },
    async delete(key: any) {
        return (await dbPromise).delete(DB_INDEXED_NAME, btoa(key));
    },
    async deleteList(keys: any) {
        for (let key of keys) {
            if (key) {
                await ((await dbPromise).delete(DB_INDEXED_NAME, btoa(key)));
            }
        }
        return Promise.resolve();
    },
    async clear() {
        return (await dbPromise).clear(DB_INDEXED_NAME);
    },
    async keys() {
        return (await dbPromise).getAllKeys(DB_INDEXED_NAME);
    }
}

