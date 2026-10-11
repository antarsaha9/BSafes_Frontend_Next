const forge = require('node-forge');
const DOMPurify = require('dompurify');

import { PostCall } from './helper';
import { decryptLargeBinaryString } from './crypto';
import { decryptItemCore, extractMediaRefsFromContent, EMBEDDED_JSON_SEPARATOR } from './itemDecryption';
import { newResultItem, isItemAContainer } from './bSafesCommonUI';
import { preS3Download, getS3Object } from './s3Helper';

const LISTING_PAGE_SIZE = 100;
const DIARY_MAX_EMPTY_MONTHS_STREAK = 12;
const DIARY_MAX_MONTHS_TOTAL = 240; // never look back more than 20 years

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
        for (const hit of hits) {
            if (isCancelled && isCancelled()) throw new ExportCancelledError('Export cancelled');
            const itemId = hit._id;
            if (!itemId || itemId.startsWith('t')) continue; // skip the trash itself
            if (hit._source && hit._source.type === 'T') continue; // skip items that were moved to the trash

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
    const s3Key = forge.util.decode64(item.content.substring(9)); // remove the 's3Object/' marker
    const decryptedContent = await downloadAndDecryptLarge(itemId, s3Key, itemKey, itemIV);
    const content = DOMPurify.sanitize(forge.util.decodeUtf8(decryptedContent));
    return { content, contentMediaRefs: extractMediaRefsFromContent(content) };
}

async function resolveS3DrawingContent(itemId, item, itemKey, itemIV) {
    const s3Key = forge.util.decode64(item.content.substring(16)); // remove the 's3DrawingObject/' marker
    const decryptedContent = await downloadAndDecryptLarge(itemId, s3Key, itemKey, itemIV);
    // Saved as "NA" + separator + drawing data. The "NA" part is just a placeholder, not a picture.
    const embeddedJSON = decryptedContent.split(EMBEDDED_JSON_SEPARATOR)[1];
    return { drawing: { sceneJSON: embeddedJSON ? forge.util.decodeUtf8(embeddedJSON) : null } };
}

async function downloadAndDecryptLarge(itemId, s3Key, itemKey, itemIV) {
    const signedURL = await preS3Download(itemId, s3Key);
    const downloaded = await getS3Object(signedURL);
    return decryptLargeBinaryString(downloaded.binaryString, itemKey, itemIV);
}

/**
 * Downloads one page and unlocks its title, tags and text.
 * For long pages and drawings, it also downloads the extra file that holds the content.
 * It does not download the images, videos, audios or attachments;
 * those are downloaded later, only while the backup is being written.
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
