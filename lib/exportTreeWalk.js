const forge = require('node-forge');
const DOMPurify = require('dompurify');

import { decryptItemCore, extractMediaRefsFromContent, EMBEDDED_JSON_SEPARATOR } from './itemDecryption';
import { newResultItem, isItemAContainer } from './bSafesCommonUI';
import { readAndDecryptLargeObject } from './exportMediaDownload';
import { listLocalItems, getPageItemFromLocalBackup } from '../reduxStore/localBackupSlice';
import { diaryPageDate } from './exportNaming';

const LISTING_PAGE_SIZE = 100;

// All lists, pages and files below are read from the local backup (kept up to date by
// updateLocalBackupThunk), the same way the app shows content in the desktop build.

async function listItemsPage(container, from, size) {
    return (await listLocalItems({ container, size, from })).hits;
}

async function listAllItemsInContainer(container) {
    const items = [];
    let from = 0;
    while (true) {
        const hits = await listItemsPage(container, from, LISTING_PAGE_SIZE);
        items.push(...hits);
        if (hits.length < LISTING_PAGE_SIZE) break;
        from += LISTING_PAGE_SIZE;
    }
    return items;
}

const hitId = (hit) => (hit._source ? hit._id : hit.id);

/**
 * Lists every page of a diary, newest date first. The pages are read in batches like any other
 * list (the local backup's list doesn't filter diaries by month), then sorted by the date in
 * their id.
 */
async function listAllDiaryItems(container) {
    const items = await listAllItemsInContainer(container);
    return items.sort((a, b) => (diaryPageDate(hitId(b)) || '').localeCompare(diaryPageDate(hitId(a)) || ''));
}

export class ExportCancelledError extends Error {}

/**
 * Goes through everything in the workspace, one level at a time:
 * every Box, Folder, Notebook and Diary, and every page inside them.
 * Items in the trash are skipped.
 *
 * It calls you back as it goes:
 * - onContainerEnter / onContainerExit: when it goes into / comes out of a Box, Folder, Notebook or Diary
 * - onLeafItem: for each page it finds
 * - onError: when part of the list can't be loaded (the rest still continues)
 *
 * Each callback only gets the item's id and title. To get a page's full content,
 * call fetchFullyDecryptedItem.
 *
 * If isCancelled is given, it is checked between items. When it returns true,
 * the walk stops by throwing ExportCancelledError.
 */
export async function walkWorkspace(rootContainerId, workspaceKey, { onContainerEnter, onContainerExit, onLeafItem, onError, isCancelled } = {}) {
    async function walkContainer(containerId) {
        let hits;
        try {
            hits = containerId.startsWith('d') ? await listAllDiaryItems(containerId) : await listAllItemsInContainer(containerId);
        } catch (error) {
            if (onError) onError({ itemId: containerId, error });
            return;
        }
        const seen = new Set(); // in case a list returns the same item twice
        for (const hit of hits) {
            if (isCancelled && isCancelled()) throw new ExportCancelledError('Export cancelled');
            // Cloud lists give { _id, _source: {...} }; the local backup gives the item itself { id, ... }.
            const itemId = hitId(hit);
            if (itemId && seen.has(itemId)) continue;
            if (itemId) seen.add(itemId);
            const itemData = hit._source || hit;
            if (!itemId) {
                if (onError) onError({ itemId: containerId, error: new Error('An item in this list has no id.') });
                continue;
            }
            if (itemId.startsWith('t')) continue; // skip the trash itself
            if (itemData.type === 'T') continue; // skip items that were moved to the trash

            let listingEntry;
            try {
                listingEntry = newResultItem(hit, workspaceKey);
            } catch (error) {
                if (onError) onError({ itemId, error });
                continue;
            }

            if (isItemAContainer(itemId)) {
                if (onContainerEnter) await onContainerEnter(listingEntry);
                await walkContainer(itemId);
                if (onContainerExit) await onContainerExit(listingEntry);
            } else {
                if (onLeafItem) await onLeafItem(listingEntry);
            }
        }
    }
    await walkContainer(rootContainerId);
}

async function resolveS3ObjectContent(item, itemKey, itemIV) {
    const s3Key = forge.util.decode64(item.content.substring(9)); // remove the 's3Object/' marker
    const decryptedContent = await readAndDecryptLargeObject(s3Key, itemKey, itemIV);
    const content = DOMPurify.sanitize(forge.util.decodeUtf8(decryptedContent));
    return { content, contentMediaRefs: extractMediaRefsFromContent(content) };
}

async function resolveS3DrawingContent(item, itemKey, itemIV) {
    const s3Key = forge.util.decode64(item.content.substring(16)); // remove the 's3DrawingObject/' marker
    const decryptedContent = await readAndDecryptLargeObject(s3Key, itemKey, itemIV);
    // Saved as "NA" + separator + drawing data. The "NA" part is just a placeholder, not a picture.
    const embeddedJSON = decryptedContent.split(EMBEDDED_JSON_SEPARATOR)[1];
    return { drawing: { sceneJSON: embeddedJSON ? forge.util.decodeUtf8(embeddedJSON) : null } };
}

/**
 * Reads one page from the local backup and unlocks its title, tags and text.
 * For long pages and drawings, it also reads the extra file that holds the content.
 * It does not read the images, videos, audios or attachments;
 * those are read later, only while the export folder is being written.
 */
export async function fetchFullyDecryptedItem(itemId, workspaceKey) {
    const data = await getPageItemFromLocalBackup({ itemId });
    if (!data || data.status !== 'ok' || !data.item) {
        throw new Error((data && data.error) || `Page ${itemId} is not in the local backup yet.`);
    }
    const item = data.item;
    const decrypted = decryptItemCore(item, workspaceKey);
    if (decrypted.error) {
        throw (decrypted.error instanceof Error ? decrypted.error : new Error(String(decrypted.error)));
    }

    let drawing = null;
    if (item.content && item.content.startsWith('s3Object/')) {
        const resolved = await resolveS3ObjectContent(item, decrypted.itemKey, decrypted.itemIV);
        decrypted.content = resolved.content;
        decrypted.contentMediaRefs = resolved.contentMediaRefs;
    } else if (item.content && item.content.startsWith('s3DrawingObject/')) {
        const resolved = await resolveS3DrawingContent(item, decrypted.itemKey, decrypted.itemIV);
        drawing = resolved.drawing;
    }

    return { item, decrypted, drawing };
}
