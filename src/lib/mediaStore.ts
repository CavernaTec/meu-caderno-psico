// IndexedDB-based media storage to avoid localStorage quota limits

export interface MediaItem {
  id: string;
  patientId: string;
  date: string;
  name: string;
  type: string;
  dataUrl: string;
}

const DB_NAME = 'ep_media_db';
const STORE_NAME = 'media';
const DB_VERSION = 1;

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        store.createIndex('patientId', 'patientId', { unique: false });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function generateId(): string {
  return Math.random().toString(36).substring(2, 15);
}

export async function saveMediaItem(item: Omit<MediaItem, 'id'>): Promise<MediaItem> {
  const db = await openDB();
  const newItem: MediaItem = { ...item, id: generateId() };
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    tx.objectStore(STORE_NAME).put(newItem);
    tx.oncomplete = () => resolve(newItem);
    tx.onerror = () => reject(tx.error);
  });
}

export async function getAllMedia(patientId: string): Promise<MediaItem[]> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const index = tx.objectStore(STORE_NAME).index('patientId');
    const request = index.getAll(patientId);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function deleteMediaItem(id: string): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    tx.objectStore(STORE_NAME).delete(id);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function deleteAllPatientMedia(patientId: string): Promise<void> {
  const items = await getAllMedia(patientId);
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    items.forEach(item => store.delete(item.id));
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}
