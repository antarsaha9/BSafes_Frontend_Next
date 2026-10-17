// Remembers two things on this computer, even after restarts and logouts:
// - the last backup folder that was used
// - whether backups may be viewed without logging in
// They're kept in a separate browser database (IndexedDB), because the app clears its
// main database when it times out.

const DB_NAME = 'bsafesLocalExport';
const STORE_NAME = 'prefs';
const LAST_FOLDER_KEY = 'lastFolder';

function openDb() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, 1);
        request.onupgradeneeded = () => request.result.createObjectStore(STORE_NAME);
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

async function withStore(mode, fn) {
    const db = await openDb();
    try {
        return await new Promise((resolve, reject) => {
            const tx = db.transaction(STORE_NAME, mode);
            const request = fn(tx.objectStore(STORE_NAME));
            tx.oncomplete = () => resolve(request.result);
            tx.onerror = () => reject(tx.error);
        });
    } finally {
        db.close();
    }
}

export function getRootDisplayName(root) {
    return root ? root.name : null;
}

const ALLOW_LOGGED_OUT_VIEWING_KEY = 'allowLoggedOutViewing';

export async function saveAllowLoggedOutViewing(allowed) {
    await withStore('readwrite', (store) => store.put(!!allowed, ALLOW_LOGGED_OUT_VIEWING_KEY));
}

/** Whether backups can be viewed without logging in, on this computer. Off unless the user turned it on. */
export async function loadAllowLoggedOutViewing() {
    try {
        return (await withStore('readonly', (store) => store.get(ALLOW_LOGGED_OUT_VIEWING_KEY))) === true;
    } catch (error) {
        return false;
    }
}

export async function saveLastFolder(root) {
    await withStore('readwrite', (store) => store.put(root, LAST_FOLDER_KEY));
}

/**
 * Returns the remembered folder, or null.
 * Folders saved by older versions of the app (picked with the browser's folder access)
 * are ignored, so the user is asked to pick the folder once more.
 */
export async function loadLastFolder() {
    try {
        const saved = await withStore('readonly', (store) => store.get(LAST_FOLDER_KEY));
        return saved && saved.kind === 'native' ? saved : null;
    } catch (error) {
        return null;
    }
}
