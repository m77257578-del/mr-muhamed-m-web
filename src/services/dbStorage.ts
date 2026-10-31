// Unified Production-Grade IndexedDB Persistent Storage Service

const DB_NAME = 'OstazPlatformIndexedDB';
const DB_VERSION = 2;
const STORE_NAME = 'app_persistent_store';

let dbInstancePromise: Promise<IDBDatabase | null> | null = null;

function getIndexedDBInstance(): Promise<IDBDatabase | null> {
  if (dbInstancePromise) return dbInstancePromise;

  if (typeof window === 'undefined' || !window.indexedDB) {
    return Promise.resolve(null);
  }

  dbInstancePromise = new Promise((resolve) => {
    try {
      const request = window.indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event: any) => {
        const db: IDBDatabase = event.target.result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME);
        }
      };

      request.onsuccess = (event: any) => {
        const db: IDBDatabase = event.target.result;
        db.onversionchange = () => {
          db.close();
          dbInstancePromise = null;
        };
        resolve(db);
      };

      request.onerror = (err) => {
        console.error('IndexedDB open error:', err);
        dbInstancePromise = null;
        resolve(null);
      };
    } catch (e) {
      console.error('IndexedDB initialization failed:', e);
      dbInstancePromise = null;
      resolve(null);
    }
  });

  return dbInstancePromise;
}

/**
 * Unified function to save large student profiles, synced data, or state objects into IndexedDB
 */
export async function saveToIndexedDB(key: string, data: any): Promise<boolean> {
  // Always update LocalStorage as a instant sync backup
  try {
    localStorage.setItem(`idb_backup_${key}`, JSON.stringify(data));
  } catch {}

  const db = await getIndexedDBInstance();
  if (!db) return false;

  return new Promise((resolve) => {
    try {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.put(data, key);

      req.onsuccess = () => resolve(true);
      req.onerror = () => resolve(false);
    } catch (e) {
      console.warn('Failed writing to IndexedDB:', e);
      resolve(false);
    }
  });
}

/**
 * Unified function to retrieve data from IndexedDB reliably
 */
export async function loadFromIndexedDB<T = any>(key: string): Promise<T | null> {
  const db = await getIndexedDBInstance();

  if (db) {
    const fromDB = await new Promise<T | null>((resolve) => {
      try {
        const tx = db.transaction(STORE_NAME, 'readonly');
        const store = tx.objectStore(STORE_NAME);
        const req = store.get(key);

        req.onsuccess = () => resolve(req.result !== undefined ? req.result : null);
        req.onerror = () => resolve(null);
      } catch (e) {
        console.warn('Failed reading from IndexedDB:', e);
        resolve(null);
      }
    });

    if (fromDB !== null) return fromDB;
  }

  // Backup fallback from LocalStorage if IndexedDB was unavailable or empty
  try {
    const backup = localStorage.getItem(`idb_backup_${key}`);
    if (backup) return JSON.parse(backup) as T;
  } catch {}

  return null;
}

/**
 * Unified function to remove a key from IndexedDB
 */
export async function removeFromIndexedDB(key: string): Promise<boolean> {
  try {
    localStorage.removeItem(`idb_backup_${key}`);
  } catch {}

  const db = await getIndexedDBInstance();
  if (!db) return false;

  return new Promise((resolve) => {
    try {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.delete(key);

      req.onsuccess = () => resolve(true);
      req.onerror = () => resolve(false);
    } catch {
      resolve(false);
    }
  });
}

/**
 * Clear all stored keys from IndexedDB
 */
export async function clearIndexedDB(): Promise<boolean> {
  const db = await getIndexedDBInstance();
  if (!db) return false;

  return new Promise((resolve) => {
    try {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.clear();

      req.onsuccess = () => resolve(true);
      req.onerror = () => resolve(false);
    } catch {
      resolve(false);
    }
  });
}

// Aliases for seamless backward compatibility
export const setPersistentCache = saveToIndexedDB;
export const getPersistentCache = loadFromIndexedDB;
export const removePersistentCache = removeFromIndexedDB;
