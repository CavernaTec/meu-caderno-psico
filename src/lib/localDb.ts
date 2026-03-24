export type StoreName =
  | 'patients'
  | 'sessions'
  | 'goals'
  | 'notes'
  | 'abc'
  | 'assessments'
  | 'tests';

const DB_NAME = 'ep_local_db';
const DB_VERSION = 1;

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains('patients')) {
        db.createObjectStore('patients', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('sessions')) {
        const store = db.createObjectStore('sessions', { keyPath: 'id' });
        store.createIndex('patientId', 'patientId', { unique: false });
      }
      if (!db.objectStoreNames.contains('goals')) {
        const store = db.createObjectStore('goals', { keyPath: 'id' });
        store.createIndex('patientId', 'patientId', { unique: false });
      }
      if (!db.objectStoreNames.contains('notes')) {
        const store = db.createObjectStore('notes', { keyPath: 'id' });
        store.createIndex('patientId', 'patientId', { unique: false });
      }
      if (!db.objectStoreNames.contains('abc')) {
        const store = db.createObjectStore('abc', { keyPath: 'id' });
        store.createIndex('patientId', 'patientId', { unique: false });
      }
      if (!db.objectStoreNames.contains('assessments')) {
        db.createObjectStore('assessments', { keyPath: 'patientId' });
      }
      if (!db.objectStoreNames.contains('tests')) {
        const store = db.createObjectStore('tests', { keyPath: 'id' });
        store.createIndex('patientId', 'patientId', { unique: false });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function wrapRequest<T>(request: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function dbGetAll<T>(storeName: StoreName): Promise<T[]> {
  const db = await openDB();
  const tx = db.transaction(storeName, 'readonly');
  const store = tx.objectStore(storeName);
  return wrapRequest(store.getAll());
}

export async function dbGet<T>(storeName: StoreName, key: IDBValidKey): Promise<T | undefined> {
  const db = await openDB();
  const tx = db.transaction(storeName, 'readonly');
  const store = tx.objectStore(storeName);
  return wrapRequest(store.get(key));
}

export async function dbPut<T>(storeName: StoreName, value: T): Promise<void> {
  const db = await openDB();
  const tx = db.transaction(storeName, 'readwrite');
  const store = tx.objectStore(storeName);
  await wrapRequest(store.put(value));
}

export async function dbDelete(storeName: StoreName, key: IDBValidKey): Promise<void> {
  const db = await openDB();
  const tx = db.transaction(storeName, 'readwrite');
  const store = tx.objectStore(storeName);
  await wrapRequest(store.delete(key));
}

export async function dbGetAllByIndex<T>(storeName: StoreName, indexName: string, value: IDBValidKey): Promise<T[]> {
  const db = await openDB();
  const tx = db.transaction(storeName, 'readonly');
  const store = tx.objectStore(storeName);
  const index = store.index(indexName);
  return wrapRequest(index.getAll(value));
}
