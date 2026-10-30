import { createSlice } from '@reduxjs/toolkit';

import { debugLog } from '../lib/helper';
import { localExportActivity } from '../lib/activities';
import { walkWorkspace, fetchFullyDecryptedItem, ExportCancelledError } from '../lib/exportTreeWalk';
import { getItemType } from '../lib/bSafesCommonUI';
import { pickExportFolder, pickExportFolderToOpen, checkFolder, openInBrowser } from '../lib/exportFsAccess';
import { uniqueEntryName, sanitizeFsName, diaryPageDate } from '../lib/exportNaming';
import { exportLeafItem, writeContainerManifest, writeExportManifest, writeIndexHtml, EXPORT_FORMAT } from '../lib/exportWriter';
import { isPageUpToDate, pruneContainerFolder } from '../lib/exportIncremental';
import { ensureStoreFolder, readPageRecord, verifyRecordObjects, restorePageFromStore, collectGarbage } from '../lib/exportStore';
import { writeStyleFolder, styleHrefFor } from '../lib/exportStyle';
import { readExportManifest, readExportOwner, checkExport } from '../lib/exportViewer';
import { htmlToText } from '../lib/itemDecryption';
import { updateLocalBackupThunk } from './localBackupSlice';
import { saveLastFolder, loadLastFolder, getRootDisplayName } from '../lib/exportFolderPrefs';

const debugOn = true;

const initialState = {
    activity: 0,
    activityErrors: 0,
    activityErrorCodes: {},
    exportInProgress: false,
    cancelRequested: false,
    statusBarMessage: "",
    containerCount: 0,
    leafItemCount: 0, // pages exported (new or changed) in this run
    skippedCount: 0, // pages left as they were, because they hadn't changed
    movedCount: 0, // pages rebuilt from the hidden store (moved/renamed), without unlocking them again
    removedCount: 0, // folders removed because their item no longer exists
    exportErrors: [],
    lastFolderName: null,
    lastFolderPath: null,
    syncFailurePrompt: null, // { reason } while asking whether to export without an up-to-date local backup
    openExportError: null,
    openExportMessage: null, // e.g. "Opened MyExport in your browser."
    // While opening an export: { status: 'checking', pagesChecked } or
    // { status: 'problems', folderName, pagesChecked, problems } (waiting for the user's choice).
    openCheck: null,
    openCheckCancelRequested: false,
}

const localExportSlice = createSlice({
    name: 'localExport',
    initialState,
    reducers: {
        resetLocalExportActivity: (state) => {
            state.activity = 0;
            state.activityErrors = 0;
            state.activityErrorCodes = {};
        },
        activityStart: (state, action) => {
            state.activityErrors &= ~action.payload;
            state.activityErrorCodes[action.payload] = '';
            state.activity |= action.payload;
        },
        activityDone: (state, action) => {
            state.activity &= ~action.payload;
        },
        activityError: (state, action) => {
            state.activity &= ~action.payload.type;
            state.activityErrors |= action.payload.type;
            state.activityErrorCodes[action.payload.type] = action.payload.error;
        },
        setExportInProgress: (state, action) => {
            state.exportInProgress = action.payload;
        },
        setCancelRequested: (state, action) => {
            state.cancelRequested = action.payload;
        },
        setStatusBarMessage: (state, action) => {
            state.statusBarMessage = action.payload;
        },
        resetExportCounters: (state) => {
            state.containerCount = 0;
            state.leafItemCount = 0;
            state.skippedCount = 0;
            state.movedCount = 0;
            state.removedCount = 0;
            state.exportErrors = [];
        },
        incrementContainerCount: (state) => {
            state.containerCount += 1;
        },
        incrementLeafItemCount: (state) => {
            state.leafItemCount += 1;
        },
        incrementMovedCount: (state) => {
            state.movedCount += 1;
        },
        incrementSkippedCount: (state) => {
            state.skippedCount += 1;
        },
        addRemovedCount: (state, action) => {
            state.removedCount += action.payload;
        },
        addExportError: (state, action) => {
            state.exportErrors.push(action.payload);
        },
        setOpenExportError: (state, action) => {
            state.openExportError = action.payload;
        },
        setOpenExportMessage: (state, action) => {
            state.openExportMessage = action.payload;
        },
        setOpenCheck: (state, action) => {
            state.openCheck = action.payload;
        },
        setOpenCheckCancelRequested: (state, action) => {
            state.openCheckCancelRequested = action.payload;
        },
        setSyncFailurePrompt: (state, action) => {
            state.syncFailurePrompt = action.payload;
        },
        setLastFolder: (state, action) => {
            state.lastFolderName = action.payload ? action.payload.name : null;
            state.lastFolderPath = action.payload ? action.payload.path : null;
        },
        clearOpenExport: (state) => {
            state.openExportError = null;
            state.openExportMessage = null;
            state.openCheck = null;
            state.openCheckCancelRequested = false;
        },
    }
});

export const {
    resetLocalExportActivity, activityStart, activityDone, activityError,
    setExportInProgress, setCancelRequested, setStatusBarMessage,
    resetExportCounters, incrementContainerCount, incrementLeafItemCount, incrementSkippedCount, incrementMovedCount, addRemovedCount,
    addExportError,
    setOpenExportError, setOpenExportMessage, setOpenCheck, setOpenCheckCancelRequested,
    setLastFolder, setSyncFailurePrompt, clearOpenExport
} = localExportSlice.actions;
export const localExportReducer = localExportSlice.reducer;

const newActivity = async (dispatch, type, activity) => {
    dispatch(activityStart(type));
    try {
        await activity();
        dispatch(activityDone(type));
    } catch (error) {
        dispatch(activityError({ type, error }));
    }
}

// Resolves the question shown when the local backup update fails (true = export anyway).
// Kept outside Redux because a function can't be stored in the state.
let answerSyncFailurePrompt = null;

function askToExportWithoutSync(dispatch, reason) {
    return new Promise((resolve) => {
        answerSyncFailurePrompt = (exportAnyway) => {
            answerSyncFailurePrompt = null;
            dispatch(setSyncFailurePrompt(null));
            resolve(exportAnyway);
        };
        dispatch(setSyncFailurePrompt({ reason }));
    });
}

/** The user's answer to "the local backup couldn't be updated - export anyway?" */
export const answerSyncFailurePromptThunk = (exportAnyway) => () => {
    if (answerSyncFailurePrompt) answerSyncFailurePrompt(!!exportAnyway);
}

export const cancelExportThunk = () => (dispatch) => {
    dispatch(setCancelRequested(true));
    if (answerSyncFailurePrompt) answerSyncFailurePrompt(false);
}

/**
 * Exports the whole workspace, unlocked, into a folder on the computer.
 * - Uses the account's remembered folder (if useLastFolder is true), otherwise asks the user to pick one.
 * - If updateFirst is true, brings the local backup up to date before exporting;
 *   otherwise it exports what's already in the local backup.
 * - Creates a folder for each Box, Folder, Notebook and Diary, and one for each page
 *   (with page.html, media/ and manifest.json).
 * - Pages that haven't changed since the last export (and whose files weren't edited) are
 *   left as they are, unless fullReexport is true. Folders of items that no longer exist are removed.
 * - Writes index.html files so the export can be browsed in a web browser, starting from
 *   index.html in the chosen folder.
 * - If one page fails, it is noted and skipped; the rest of the export continues.
 * Progress is shown in the status bar, and the user can cancel at any time.
 */
export const startExportThunk = ({ useLastFolder = false, updateFirst = true, fullReexport = false } = {}) => (dispatch, getState) => {
    return newActivity(dispatch, localExportActivity.Export, () => {
        return new Promise(async (resolve, reject) => {
            dispatch(resetExportCounters());
            dispatch(setCancelRequested(false));
            dispatch(setExportInProgress(true));
            dispatch(setStatusBarMessage("Preparing export..."));

            let root = null;
            try {
                if (useLastFolder) {
                    const lastFolder = await loadLastFolder(currentMemberId(getState));
                    if (lastFolder && await checkFolder(lastFolder, { write: true })) {
                        root = lastFolder;
                    }
                }
                if (!root) {
                    dispatch(setStatusBarMessage("Choose a folder to export to..."));
                    root = await pickExportFolder();
                }
                // Never export into a folder that holds another account's export.
                const owner = root ? await readExportOwner(root) : null;
                if (owner && owner !== getState().auth.memberId) {
                    dispatch(setStatusBarMessage(`Export stopped: "${getRootDisplayName(root)}" already has an export from another account. Please choose a different folder.`));
                    dispatch(setExportInProgress(false));
                    resolve();
                    return;
                }
                if (root) await rememberFolder(dispatch, getState, root);
            } catch (error) {
                debugLog(debugOn, "startExportThunk: pickExportFolder failed: ", error);
                dispatch(setStatusBarMessage("Failed to access the export folder: " + (error.message || String(error))));
                dispatch(setExportInProgress(false));
                reject(error);
                return;
            }
            if (!root) {
                dispatch(setStatusBarMessage("Export cancelled - no folder selected."));
                dispatch(setExportInProgress(false));
                resolve();
                return;
            }

            // The export is built from the local backup, so bring it up to date first (if asked to).
            let localBackupUpToDate = false;
            if (updateFirst) {
                dispatch(setStatusBarMessage("Updating your local backup before exporting..."));
                const sync = await dispatch(updateLocalBackupThunk());
                localBackupUpToDate = sync.ok;
                if (!sync.ok) {
                    const reason = (sync.error && sync.error.message) || String(sync.error || 'unknown error');
                    dispatch(setStatusBarMessage("The local backup could not be updated. Waiting for your choice..."));
                    const exportAnyway = await askToExportWithoutSync(dispatch, reason);
                    if (!exportAnyway) {
                        dispatch(setStatusBarMessage("Export cancelled - the local backup could not be updated (" + reason + ")."));
                        dispatch(setExportInProgress(false));
                        resolve();
                        return;
                    }
                }
            }

            const authState = getState().auth;
            const containerState = getState().container;
            const workspace = containerState.workspace;
            const workspaceKey = containerState.workspaceKey;
            const workspaceName = containerState.workspaceName || 'Personal';

            const rootEntryName = uniqueEntryName(workspaceName, workspace, 'workspace');
            const newNode = (fields) => ({ ...fields, children: [], keepNames: new Set(), listingFailed: false });
            const rootNode = newNode({ relPath: rootEntryName, entryName: rootEntryName, id: workspace, type: 'Workspace', title: workspaceName });
            const nodeStack = [rootNode];

            const isCancelled = () => getState().localExport.cancelRequested;
            const seenIds = new Set(); // every page found in this export (kept in the hidden store)
            let anyListingFailed = false; // if true, the store isn't cleaned up (the list was incomplete)
            let copiedInsteadOfLinked = false; // the drive couldn't make hard links
            const progressPrefix = () => {
                const { leafItemCount, skippedCount, movedCount } = getState().localExport;
                return `[${leafItemCount + skippedCount + movedCount} pages done]`;
            };

            // Links back up the folder tree ("breadcrumbs") for a file in folder `dirRelPath`.
            // `ancestors` are the containers above it, below the workspace (outermost first).
            const depthOf = (relPath) => relPath.split('/').length;
            const crumbsFor = (dirRelPath, ancestors) => {
                const depth = depthOf(dirRelPath);
                return [
                    { title: 'Export home', href: '../'.repeat(depth) + 'index.html' },
                    ...ancestors.map((node) => ({ title: node.title, href: '../'.repeat(depth - depthOf(node.relPath)) + 'index.html' })),
                ];
            };
            const indexItems = (node, hrefPrefix = '') => node.children.map((c) => ({
                title: c.title,
                typeLabel: c.type,
                href: `${hrefPrefix}${c.entryName}/${CONTAINER_TYPES.has(c.type) ? 'index.html' : 'page.html'}`,
            }));
            const manifestChildren = (node) => node.children.map((c) => ({ id: c.id, type: c.type, title: c.title, relPath: c.entryName }));

            // Removes folders of items that no longer exist, unless this folder's list was incomplete.
            const prune = async (node) => {
                if (node.listingFailed) return;
                try {
                    const removed = await pruneContainerFolder(root, node.relPath, node.keepNames);
                    if (removed) dispatch(addRemovedCount(removed));
                } catch (error) {
                    debugLog(debugOn, `startExportThunk: failed to remove old folders in ${node.relPath}`, error);
                    dispatch(addExportError({ itemId: node.id, error: 'Could not remove old folders: ' + (error.message || String(error)) }));
                }
            };

            try {
                dispatch(setStatusBarMessage(`Exporting to ${getRootDisplayName(root)}: reading your content list...`));
                await walkWorkspace(workspace, workspaceKey, {
                    isCancelled,
                    onContainerEnter: async (entry) => {
                        dispatch(incrementContainerCount());
                        const titleText = htmlToText(entry.title);
                        dispatch(setStatusBarMessage(`${progressPrefix()} Opening ${titleText || 'untitled'}...`));
                        const parent = nodeStack[nodeStack.length - 1];
                        const entryName = uniqueEntryName(titleText, entry.id, getItemType(entry.id) || 'container');
                        const node = newNode({ relPath: `${parent.relPath}/${entryName}`, entryName, id: entry.id, type: getItemType(entry.id), title: titleText });
                        parent.children.push(node);
                        parent.keepNames.add(entryName);
                        nodeStack.push(node);
                    },
                    onContainerExit: async () => {
                        const node = nodeStack.pop();
                        try {
                            await writeContainerManifest(root, node.relPath, { id: node.id, type: node.type, title: node.title, children: manifestChildren(node) });
                            await writeIndexHtml(root, node.relPath, { title: node.title, crumbs: crumbsFor(node.relPath, nodeStack.slice(1)), items: indexItems(node), styleHref: styleHrefFor(node.relPath) });
                            await prune(node);
                        } catch (error) {
                            debugLog(debugOn, `startExportThunk: failed to write container manifest for ${node.id}`, error);
                            dispatch(addExportError({ itemId: node.id, error: error.message || String(error) }));
                        }
                    },
                    onLeafItem: async (entry) => {
                        const parent = nodeStack[nodeStack.length - 1];
                        const titleText = htmlToText(entry.title);
                        const type = getItemType(entry.id);
                        // A diary page is named by its date (one page per day), e.g. "2026-10-30 Hike".
                        const date = diaryPageDate(entry.id);
                        const label = date ? (titleText ? `${date} – ${titleText}` : date) : titleText;
                        const entryName = date ? sanitizeFsName(titleText ? `${date} ${titleText}` : date) : uniqueEntryName(titleText, entry.id, type || 'page');
                        const relPath = `${parent.relPath}/${entryName}`;
                        const version = entry.itemPack && entry.itemPack.version;
                        parent.keepNames.add(entryName); // keep its folder even if this page fails below
                        seenIds.add(entry.id); // and keep its copy in the hidden store
                        const crumbs = crumbsFor(relPath, nodeStack.slice(1));
                        try {
                            if (!fullReexport) {
                                // 1. Its folder is already current: nothing to do.
                                if (await isPageUpToDate(root, relPath, entry.id, version)) {
                                    dispatch(incrementSkippedCount());
                                    parent.children.push({ id: entry.id, type, title: label, entryName });
                                    return;
                                }
                                // 2. Unchanged, but moved or renamed: rebuild it from the hidden store.
                                const record = await readPageRecord(root, entry.id);
                                if (record && record.version === version && record.exportFormat === EXPORT_FORMAT && await verifyRecordObjects(root, record)) {
                                    dispatch(setStatusBarMessage(`${progressPrefix()} Moving ${label || 'untitled page'}...`));
                                    const { linked } = await restorePageFromStore(root, relPath, record, crumbs, styleHrefFor(relPath), label);
                                    if (!linked) copiedInsteadOfLinked = true;
                                    dispatch(incrementMovedCount());
                                    parent.children.push({ id: entry.id, type, title: label, entryName });
                                    return;
                                }
                            }
                            // 3. New or changed: unlock it from the local backup and export it.
                            dispatch(setStatusBarMessage(`${progressPrefix()} Exporting ${label || 'untitled page'}...`));
                            const { item, decrypted, drawing } = await fetchFullyDecryptedItem(entry.id, workspaceKey);
                            const { linked } = await exportLeafItem(root, relPath, entry.id, item.version, decrypted, drawing, crumbs, styleHrefFor(relPath), label, isCancelled);
                            if (!linked) copiedInsteadOfLinked = true;
                            dispatch(incrementLeafItemCount());
                            parent.children.push({ id: entry.id, type, title: label, entryName });
                        } catch (error) {
                            if (error instanceof ExportCancelledError) throw error;
                            debugLog(debugOn, `startExportThunk: failed to export item ${entry.id}`, error);
                            dispatch(addExportError({ itemId: entry.id, error: error.message || String(error) }));
                        }
                    },
                    onError: (info) => {
                        debugLog(debugOn, `startExportThunk: error walking ${info.itemId}`, info.error);
                        // This folder's list is incomplete, so don't remove anything from it.
                        nodeStack[nodeStack.length - 1].listingFailed = true;
                        anyListingFailed = true;
                        dispatch(addExportError({ itemId: info.itemId, error: info.error.message || String(info.error) }));
                    },
                });

                // If nothing was found, something went wrong reading the local backup. Don't
                // overwrite an earlier export in this folder with an empty one.
                if (rootNode.children.length === 0) {
                    const errorCount = getState().localExport.exportErrors.length;
                    dispatch(setStatusBarMessage(`Export stopped: no content was found in your local backup${errorCount ? ` (${errorCount} errors)` : ''}. The export folder was not changed.`));
                    dispatch(setExportInProgress(false));
                    resolve();
                    return;
                }

                // The hidden store's folder (files were already added to it during the export).
                await ensureStoreFolder(root);

                // The stylesheets and fonts every page links to, so pages look like the app.
                const styleOk = await writeStyleFolder(root);

                await writeContainerManifest(root, rootNode.relPath, { id: rootNode.id, type: rootNode.type, title: rootNode.title, children: manifestChildren(rootNode) });
                await writeIndexHtml(root, rootNode.relPath, { title: rootNode.title, crumbs: crumbsFor(rootNode.relPath, []), items: indexItems(rootNode), styleHref: styleHrefFor(rootNode.relPath) });
                await prune(rootNode);

                // Clean the hidden store only after a complete export, so nothing still needed is removed.
                if (!anyListingFailed) {
                    try {
                        await collectGarbage(root, seenIds);
                    } catch (error) {
                        debugLog(debugOn, "startExportThunk: failed to clean up the hidden store", error);
                    }
                }

                await writeExportManifest(root, {
                    formatVersion: 1,
                    exportedAt: new Date().toISOString(),
                    memberId: authState.memberId,
                    displayName: authState.displayName,
                    root: rootNode.relPath,
                    localBackupUpToDate,
                });

                // The starting page of the export, to open in a web browser.
                const exportedAt = new Date().toLocaleString();
                await writeIndexHtml(root, '', {
                    title: `BSafes Export – ${rootNode.title}`,
                    subtitle: `${authState.displayName ? authState.displayName + ' · ' : ''}exported ${exportedAt}`,
                    items: indexItems(rootNode, `${rootNode.entryName}/`),
                    styleHref: styleHrefFor(''),
                });

                const notice = localBackupUpToDate ? '' : ' Made from your existing local backup, so recent changes may be missing.';
                const linkNotice = copiedInsteadOfLinked ? " This drive doesn't support hard links, so files were copied (uses more disk space)." : '';
                const styleNotice = styleOk ? '' : " The page styles couldn't be added, so pages will look plainer than in the app.";
                const { leafItemCount, skippedCount, movedCount, removedCount, exportErrors } = getState().localExport;
                dispatch(setStatusBarMessage(`Export complete: ${leafItemCount} pages updated, ${movedCount} moved, ${skippedCount} unchanged, ${removedCount} removed, ${exportErrors.length} errors.${notice}${linkNotice}${styleNotice}`));
                dispatch(setExportInProgress(false));
                resolve();
            } catch (error) {
                if (error instanceof ExportCancelledError) {
                    dispatch(setStatusBarMessage("Export cancelled."));
                    dispatch(setExportInProgress(false));
                    resolve();
                    return;
                }
                debugLog(debugOn, "startExportThunk failed: ", error);
                dispatch(setStatusBarMessage("Export failed: " + (error.message || String(error))));
                dispatch(setExportInProgress(false));
                reject(error);
            }
        });
    });
}

const CONTAINER_TYPES = new Set(['Workspace', 'Box', 'Folder', 'Notebook', 'Diary']);

// The logged-in account, whose export folder is remembered (null if nobody is logged in).
const currentMemberId = (getState) => {
    const { isLoggedIn, memberId } = getState().auth;
    return isLoggedIn && memberId ? memberId : null;
};

async function rememberFolder(dispatch, getState, root) {
    const memberId = currentMemberId(getState);
    if (!memberId) return;
    try {
        await saveLastFolder(memberId, root);
        dispatch(setLastFolder(root));
    } catch (error) {
        debugLog(debugOn, "Failed to remember the export folder: ", error);
    }
}

export const loadLastFolderThunk = () => async (dispatch, getState) => {
    const lastFolder = await loadLastFolder(currentMemberId(getState));
    dispatch(setLastFolder(lastFolder));
}

// Resolves the "some files were changed - open anyway?" question (true = open anyway).
// Kept outside Redux because a function can't be stored in the state.
let answerOpenProblems = null;

/** The user's answer when the export check found changed or missing files. */
export const answerOpenProblemsThunk = (openAnyway) => () => {
    if (answerOpenProblems) answerOpenProblems(!!openAnyway);
}

/** Stops a running export check (or answers "Cancel" if it's waiting for the user). */
export const cancelOpenExportThunk = () => (dispatch) => {
    dispatch(setOpenCheckCancelRequested(true));
    if (answerOpenProblems) answerOpenProblems(false);
}

/**
 * Opens an export in the user's web browser.
 * 1. Uses the account's remembered folder (if useLastFolder and it still exists), otherwise asks the user to pick one.
 * 2. Makes sure it's a BSafes export, and remembers it.
 * 3. Checks every page for files changed or deleted outside the app. If it finds any,
 *    it lists them and waits for the user to choose "Open anyway" or "Cancel".
 * 4. Opens the export's index.html in the default browser.
 * Only works while logged in.
 */
export const openExportInBrowserThunk = ({ useLastFolder = false } = {}) => (dispatch, getState) => {
    return newActivity(dispatch, localExportActivity.OpenExport, async () => {
        if (!getState().auth.isLoggedIn) return;
        let root = null;
        if (useLastFolder) {
            const lastFolder = await loadLastFolder(currentMemberId(getState));
            dispatch(setLastFolder(lastFolder));
            if (lastFolder && await checkFolder(lastFolder)) root = lastFolder;
        }
        if (!root) {
            root = await pickExportFolderToOpen();
            if (!root) return; // picker closed
        }
        dispatch(clearOpenExport());

        let exportManifest;
        try {
            exportManifest = await readExportManifest(root);
        } catch (error) {
            dispatch(setOpenExportError(`"${root.name}" is not a BSafes export (export-manifest.json is missing or unreadable).`));
            return;
        }
        await rememberFolder(dispatch, getState, root);

        dispatch(setOpenCheck({ status: 'checking', pagesChecked: 0 }));
        let result;
        try {
            result = await checkExport(root, exportManifest, {
                onProgress: (pagesChecked) => dispatch(setOpenCheck({ status: 'checking', pagesChecked })),
                isCancelled: () => getState().localExport.openCheckCancelRequested,
            });
        } catch (error) {
            dispatch(setOpenCheck(null));
            dispatch(setOpenExportError("Failed to check the export: " + (error.message || String(error))));
            return;
        }
        if (result.cancelled) {
            dispatch(clearOpenExport());
            return;
        }
        if (result.problems.length) {
            const openAnyway = await new Promise((resolve) => {
                answerOpenProblems = (choice) => {
                    answerOpenProblems = null;
                    resolve(choice);
                };
                dispatch(setOpenCheck({ status: 'problems', folderName: root.name, pagesChecked: result.pagesChecked, problems: result.problems }));
            });
            dispatch(setOpenCheck(null));
            if (!openAnyway) return;
        } else {
            dispatch(setOpenCheck(null));
        }

        try {
            await openInBrowser(root);
            dispatch(setOpenExportMessage(`Opened "${root.name}" in your web browser.`));
        } catch (error) {
            dispatch(setOpenExportError(error.code === 'ENOENT'
                ? `"${root.name}" was made by an older version of the app and can't be opened in a browser yet. Export to this folder again to make it browsable.`
                : "Failed to open the export in your browser: " + (error.message || String(error))));
        }
    });
}

export default localExportSlice;