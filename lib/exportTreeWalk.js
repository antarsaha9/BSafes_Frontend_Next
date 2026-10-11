const forge = require('node-forge');
const DOMPurify = require('dompurify');

import { PostCall } from './helper';
import { decryptLargeBinaryString } from './crypto';
import { decryptItemCore, extractMediaRefsFromContent, EMBEDDED_JSON_SEPARATOR } from './itemDecryption';
import { newResultItem, isItemAContainer } from './bSafesCommonUI';
import { preS3Download, getS3Object } from './s3Helper';

const LISTING_PAGE_SIZE = 100;
const DIARY_MAX_EMPTY_MONTHS_STREAK = 12;
const DIARY_MAX_MONTHS_TOTAL = 240; // 20-year safety cap against runaway month-walking

async function listItemsPage(container, from, size) {
    const data = await PostCall({
        api: '/memberAPI/listItems',
        body: { container, size, from }
    });
    if (data.status !== 'ok') {
        throw new Error(data.error || `listItems failed for container ${container}`);
    }
    return data.hits.hits || [];
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

async function listDiaryMonth(container, yyyymm) {
    const selectedDiaryContentStartPosition = parseInt(yyyymm + '00');
    const selectedDiaryContentEndPosition = parseInt(yyyymm + '31');
    const data = await PostCall({
        api: '/memberAPI/listItems',
        body: { container, size: 31, from: 0, selectedDiaryContentStartPosition, selectedDiaryContentEndPosition }
    });
    if (data.status !== 'ok') {
        throw new Error(data.error || `listItems (diary) failed for container ${container}`);
    }
    return data.hits.hits || [];
}

async function listAllDiaryItems(container) {
    const items = [];
    const now = new Date();
    let year = now.getFullYear();
    let month = now.getMonth() + 1;
    let emptyStreak = 0;
    let monthsChecked = 0;
    while (monthsChecked < DIARY_MAX_MONTHS_TOTAL && emptyStreak < DIARY_MAX_EMPTY_MONTHS_STREAK) {
        const yyyymm = `${year}${String(month).padStart(2, '0')}`;
        const hits = await listDiaryMonth(container, yyyymm);
        if (hits.length === 0) {
            emptyStreak++;
        } else {
            emptyStreak = 0;
            items.push(...hits);
        }
        monthsChecked++;
        month--;
        if (month === 0) {
            month = 12;
            year--;
        }
    }
    return items;
}

export class ExportCancelledError extends Error {}

/**
 * Recursively walks every Box/Folder/Notebook/Diary starting at `rootContainerId`
 * (typically the personal or team workspace root), invoking callbacks for every
 * container entered/exited and every leaf page found. Trashed items and Trash Box
 * containers are skipped - export covers active content only.
 *
 * Each callback receives the lightweight listing entry from `newResultItem`
 * ({id, container, position, title, itemPack}) - callers fetch full content
 * separately via `fetchFullyDecryptedItem` only for the leaf items they need.
 *
 * `isCancelled`, if provided, is polled between items/containers; when it returns
 * true the walk throws `ExportCancelledError` so the caller can stop cleanly.
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
        for (const hit of hits) {
            if (isCancelled && isCancelled()) throw new ExportCancelledError('Export cancelled');
            const itemId = hit._id;
            if (!itemId || itemId.startsWith('t')) continue; // skip Trash Box containers
            if (hit._source && hit._source.type === 'T') continue; // skip trashed items

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

async function resolveS3ObjectContent(itemId, item, itemKey, itemIV) {
    const s3Key = forge.util.decode64(item.content.substring(9)); // strip 's3Object/'
    const decryptedContent = await downloadAndDecryptLarge(itemId, s3Key, itemKey, itemIV);
    const content = DOMPurify.sanitize(forge.util.decodeUtf8(decryptedContent));
    return { content, contentMediaRefs: extractMediaRefsFromContent(content) };
}

async function resolveS3DrawingContent(itemId, item, itemKey, itemIV) {
    const s3Key = forge.util.decode64(item.content.substring(16)); // strip 's3DrawingObject/'
    const decryptedContent = await downloadAndDecryptLarge(itemId, s3Key, itemKey, itemIV);
    const [drawingImageBinaryString, embeddedJSON] = decryptedContent.split(EMBEDDED_JSON_SEPARATOR);
    return {
        drawing: {
            imageBinaryString: drawingImageBinaryString,
            sceneJSON: embeddedJSON ? forge.util.decodeUtf8(embeddedJSON) : null
        }
    };
}

async function downloadAndDecryptLarge(itemId, s3Key, itemKey, itemIV) {
    const signedURL = await preS3Download(itemId, s3Key);
    const downloaded = await getS3Object(signedURL);
    return decryptLargeBinaryString(downloaded.binaryString, itemKey, itemIV);
}

/**
 * Fetches an item's full encrypted record and decrypts everything about it *except*
 * media bytes (images/videos/audios/attachments) - those are downloaded separately,
 * on demand, only when actually writing the export to disk. Resolves the two special
 * page-content forms (large HTML blob, Excalidraw drawing) that `decryptItemCore` alone
 * leaves unresolved.
 */
export async function fetchFullyDecryptedItem(itemId, workspaceKey) {
    const data = await PostCall({ api: '/memberAPI/getPageItem', body: { itemId } });
    if (data.status !== 'ok' || !data.item) {
        throw new Error(data.error || `Failed to fetch item ${itemId}`);
    }
    const item = data.item;
    const decrypted = decryptItemCore(item, workspaceKey);
    if (decrypted.error) {
        throw (decrypted.error instanceof Error ? decrypted.error : new Error(String(decrypted.error)));
    }

    let drawing = null;
    if (item.content && item.content.startsWith('s3Object/')) {
        const resolved = await resolveS3ObjectContent(itemId, item, decrypted.itemKey, decrypted.itemIV);
        decrypted.content = resolved.content;
        decrypted.contentMediaRefs = resolved.contentMediaRefs;
    } else if (item.content && item.content.startsWith('s3DrawingObject/')) {
        const resolved = await resolveS3DrawingContent(itemId, item, decrypted.itemKey, decrypted.itemIV);
        drawing = resolved.drawing;
    }

    return { item, decrypted, drawing };
}
