// Remembers the last export/backup folder, and whether backups may be viewed while logged
// out, across app restarts and logouts. Folder handles from the
// File System Access API can't go in localStorage, but IndexedDB can store them. Kept in
// its own database so the service-worker DB cleanup on idle timeout doesn't wipe it.

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
    if (!root) return null;
    if (root.kind === 'fsAccess') return root.handle.name;
    return root.path.split(/[\\/]/).filter(Boolean).pop() || root.path;
}

const ALLOW_LOGGED_OUT_VIEWING_KEY = 'allowLoggedOutViewing';

export async function saveAllowLoggedOutViewing(allowed) {
    await withStore('readwrite', (store) => store.put(!!allowed, ALLOW_LOGGED_OUT_VIEWING_KEY));
}

/** Per-device opt-in; defaults to false (backups viewable only while logged in). */
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

export async function loadLastFolder() {
    try {
        return (await withStore('readonly', (store) => store.get(LAST_FOLDER_KEY))) || null;
    } catch (error) {
        return null;
    }
}

/**
 * Checks (and, if `request` is true, asks for) access to a remembered folder. Asking only
 * works during a user click, so pass `request: false` for automatic checks on page load.
 */
export async function ensureFolderPermission(root, mode, request) {
    if (root.kind !== 'fsAccess') return true;
    const handle = root.handle;
    if (typeof handle.queryPermission !== 'function') return true;
    if ((await handle.queryPermission({ mode })) === 'granted') return true;
    if (!request) return false;
    return (await handle.requestPermission({ mode })) === 'granted';
}
