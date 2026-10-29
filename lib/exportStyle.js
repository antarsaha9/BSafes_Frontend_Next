import { writeFile, hashFile, listFolder, removeEntry } from './exportFsAccess';
import { convertUint8ArrayToBinaryString } from './helper';

/**
 * The folder in the export holding the stylesheets and fonts of the exported pages, so they look
 * like the app when opened in a web browser. It's next to the export's index.html, and every
 * page links to it. Its contents are made by scripts/buildExportStyle.js and served by the app
 * from /exportStyle/.
 */
export const STYLE_DIR = 'bsafes-style';
const SOURCE_URL = '/exportStyle/';

/** The link from a file in folder `dirRelPath` ('' for the export's top folder) to the style folder. */
export function styleHrefFor(dirRelPath) {
    const depth = dirRelPath ? dirRelPath.split('/').length : 0;
    return `${'../'.repeat(depth)}${STYLE_DIR}/`;
}

async function fetchBinaryString(url) {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Failed to load ${url} (${response.status})`);
    return convertUint8ArrayToBinaryString(new Uint8Array(await response.arrayBuffer()));
}

async function isSameFile(root, relPath, { sha256, size }) {
    try {
        const existing = await hashFile(root, relPath, size);
        return existing.size === size && existing.sha256 === sha256;
    } catch (error) {
        return false;
    }
}

/**
 * Puts the style folder into the export. Files that are already there and unchanged are left
 * alone, and files the app no longer uses are removed.
 * Returns true if it worked. If it didn't, the export can go on: pages then use the small
 * stylesheet built into each of them.
 */
export async function writeStyleFolder(root) {
    try {
        const response = await fetch(`${SOURCE_URL}files.json`);
        if (!response.ok) throw new Error(`Failed to load the list of style files (${response.status})`);
        const files = await response.json();

        for (const file of files) {
            const relPath = `${STYLE_DIR}/${file.path}`;
            if (await isSameFile(root, relPath, file)) continue;
            await writeFile(root, relPath, await fetchBinaryString(SOURCE_URL + file.path));
        }

        const listed = new Set(files.map((f) => f.path));
        for (const dir of ['', 'fonts']) {
            for (const entry of await listFolder(root, dir ? `${STYLE_DIR}/${dir}` : STYLE_DIR)) {
                const path = dir ? `${dir}/${entry.name}` : entry.name;
                if (entry.isDirectory || listed.has(path)) continue;
                await removeEntry(root, `${STYLE_DIR}/${path}`);
            }
        }
        return true;
    } catch (error) {
        console.error('Failed to add the page styles to the export.', error);
        return false;
    }
}
