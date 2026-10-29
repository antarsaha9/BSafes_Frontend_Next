// Remembers the last export folder each account used, on this computer, even after restarts
// and logouts (one account's folder is never suggested to another).
// They're kept in a separate browser database (IndexedDB), because the app clears its
// main database when it times out.

const DB_NAME = 'bsafesLocalExport';
const STORE_NAME = 'prefs';
// One remembered folder per account.
const lastFolderKey = (memberId) => `lastFolder:${memberId}`;

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

/** Remembers `root` as the account's export folder. */
export async function saveLastFolder(memberId, root) {
    if (!memberId) return;
    await withStore('readwrite', (store) => store.put(root, lastFolderKey(memberId)));
}

/**
 * Returns the account's remembered folder, or null.
 * Folders saved by older versions of the app (picked with the browser's folder access)
 * are ignored, so the user is asked to pick the folder once more.
 */
export async function loadLastFolder(memberId) {
    if (!memberId) return null;
    try {
        const saved = await withStore('readonly', (store) => store.get(lastFolderKey(memberId)));
        return saved && saved.kind === 'native' ? saved : null;
    } catch (error) {
        return null;
    }
}
