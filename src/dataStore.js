const DATABASE_NAME = 'ship-database-app';
const STORE_NAME = 'app-state';
const STATE_KEY = 'database-v1';
const DATABASE_VERSION = 1;

function openDatabase() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DATABASE_NAME, DATABASE_VERSION);

    request.onupgradeneeded = () => {
      const database = request.result;

      if (!database.objectStoreNames.contains(STORE_NAME)) {
        database.createObjectStore(STORE_NAME);
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function loadStoredDatabaseState() {
  const database = await openDatabase();

  return new Promise((resolve, reject) => {
    const transaction = database.transaction(STORE_NAME, 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.get(STATE_KEY);

    request.onsuccess = () => {
      resolve(request.result ?? null);
      database.close();
    };

    request.onerror = () => {
      reject(request.error);
      database.close();
    };
  });
}

export async function saveStoredDatabaseState(state) {
  const database = await openDatabase();

  return new Promise((resolve, reject) => {
    const transaction = database.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);

    transaction.oncomplete = () => {
      resolve();
      database.close();
    };

    transaction.onerror = () => {
      reject(transaction.error);
      database.close();
    };

    store.put(state, STATE_KEY);
  });
}
