import { createSlice } from '@reduxjs/toolkit';

import { debugLog } from '../lib/helper';
import { localExportActivity } from '../lib/activities';
import { walkWorkspace, fetchFullyDecryptedItem, ExportCancelledError } from '../lib/exportTreeWalk';
import { getItemType } from '../lib/bSafesCommonUI';
import { pickExportFolder, pickBackupFolderToOpen, checkFolder } from '../lib/exportFsAccess';
import { uniqueEntryName } from '../lib/exportNaming';
import { exportLeafItem, writeContainerManifest, writeBackupManifest } from '../lib/exportWriter';
import { readBackupManifest, readContainerManifest, readAndVerifyItem, buildViewableFragment, revokeBlobUrls } from '../lib/exportViewer';
import { htmlToText } from '../lib/itemDecryption';
import { updateLocalBackupThunk } from './localBackupSlice';
import { saveLastFolder, loadLastFolder, getRootDisplayName, saveAllowLoggedOutViewing, loadAllowLoggedOutViewing } from '../lib/exportFolderPrefs';

const debugOn = true;

const initialState = {
    activity: 0,
    activityErrors: 0,
    activityErrorCodes: {},
    exportInProgress: false,
    cancelRequested: false,
    statusBarMessage: "",
    containerCount: 0,
    leafItemCount: 0,
    exportErrors: [],
    lastFolderName: null,
    lastFolderPath: null,
    syncFailurePrompt: null, // { reason } while asking whether to export without an up-to-date local backup
    allowLoggedOutViewing: null, // null means not loaded yet
    backupRoot: null,
    backupManifest: null,
    openBackupError: null,
    currentRelPath: null,
    currentContainerManifest: null,
    breadcrumbs: [],
    viewingItem: null,
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
            state.exportErrors = [];
        },
        incrementContainerCount: (state) => {
            state.containerCount += 1;
        },
        incrementLeafItemCount: (state) => {
            state.leafItemCount += 1;
        },
        addExportError: (state, action) => {
            state.exportErrors.push(action.payload);
        },
        setBackupRoot: (state, action) => {
            state.backupRoot = action.payload;
        },
        setBackupManifest: (state, action) => {
            state.backupManifest = action.payload;
        },
        setOpenBackupError: (state, action) => {
            state.openBackupError = action.payload;
        },
        setCurrentContainer: (state, action) => {
            state.currentRelPath = action.payload.relPath;
            state.currentContainerManifest = action.payload.manifest;
        },
        setBreadcrumbs: (state, action) => {
            state.breadcrumbs = action.payload;
        },
        setViewingItem: (state, action) => {
            state.viewingItem = action.payload;
        },
        setSyncFailurePrompt: (state, action) => {
            state.syncFailurePrompt = action.payload;
        },
        setLastFolder: (state, action) => {
            state.lastFolderName = action.payload ? action.payload.name : null;
            state.lastFolderPath = action.payload ? action.payload.path : null;
        },
        setAllowLoggedOutViewing: (state, action) => {
            state.allowLoggedOutViewing = action.payload;
        },
        clearOpenBackup: (state) => {
            state.backupRoot = null;
            state.backupManifest = null;
            state.openBackupError = null;
            state.currentRelPath = null;
            state.currentContainerManifest = null;
            state.breadcrumbs = [];
            state.viewingItem = null;
        },
    }
});

export const {
    resetLocalExportActivity, activityStart, activityDone, activityError,
    setExportInProgress, setCancelRequested, setStatusBarMessage,
    resetExportCounters, incrementContainerCount, incrementLeafItemCount,
    addExportError,
    setBackupRoot, setBackupManifest, setOpenBackupError, setCurrentContainer, setLastFolder, setSyncFailurePrompt, setAllowLoggedOutViewing,
    setBreadcrumbs, setViewingItem, clearOpenBackup
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
 * Makes a full backup of the workspace, unlocked, into a folder on the computer.
 * - Uses the remembered folder (if useLastFolder is true), otherwise asks the user to pick one.
 * - Creates a folder for each Box, Folder, Notebook and Diary, and one for each page
 *   (with page.html, media/ and manifest.json).
 * - If one page fails, it is noted and skipped; the rest of the backup continues.
 * Progress is shown in the status bar, and the user can cancel at any time.
 */
export const startExportThunk = ({ useLastFolder = false } = {}) => (dispatch, getState) => {
    return newActivity(dispatch, localExportActivity.Export, () => {
        return new Promise(async (resolve, reject) => {
            dispatch(resetExportCounters());
            dispatch(setCancelRequested(false));
            dispatch(setExportInProgress(true));
            dispatch(setStatusBarMessage("Preparing export..."));

            let root = null;
            try {
                if (useLastFolder) {
                    const lastFolder = await loadLastFolder();
                    if (lastFolder && await checkFolder(lastFolder, { write: true })) {
                        root = lastFolder;
                    }
                }
                if (!root) {
                    dispatch(setStatusBarMessage("Choose a folder to export your backup to..."));
                    root = await pickExportFolder();
                    if (root) await rememberFolder(dispatch, root);
                }
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

            // The export is built from the local backup, so bring it up to date first.
            dispatch(setStatusBarMessage("Updating your local backup before exporting..."));
            const sync = await dispatch(updateLocalBackupThunk());
            const localBackupUpToDate = sync.ok;
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

            const authState = getState().auth;
            const containerState = getState().container;
            const workspace = containerState.workspace;
            const workspaceKey = containerState.workspaceKey;
            const workspaceName = containerState.workspaceName || 'Personal';

            const rootEntryName = uniqueEntryName(workspaceName, workspace, 'workspace');
            const rootNode = { relPath: rootEntryName, entryName: rootEntryName, id: workspace, type: 'Workspace', title: workspaceName, children: [] };
            const nodeStack = [rootNode];

            const isCancelled = () => getState().localExport.cancelRequested;
            const progressPrefix = () => `[${getState().localExport.leafItemCount} pages done]`;

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
                        const node = { relPath: `${parent.relPath}/${entryName}`, entryName, id: entry.id, type: getItemType(entry.id), title: titleText, children: [] };
                        parent.children.push(node);
                        nodeStack.push(node);
                    },
                    onContainerExit: async () => {
                        const node = nodeStack.pop();
                        try {
                            await writeContainerManifest(root, node.relPath, {
                                id: node.id, type: node.type, title: node.title,
                                children: node.children.map((c) => ({ id: c.id, type: c.type, title: c.title, relPath: c.entryName })),
                            });
                        } catch (error) {
                            debugLog(debugOn, `startExportThunk: failed to write container manifest for ${node.id}`, error);
                            dispatch(addExportError({ itemId: node.id, error: error.message || String(error) }));
                        }
                    },
                    onLeafItem: async (entry) => {
                        try {
                            dispatch(setStatusBarMessage(`${progressPrefix()} Exporting ${htmlToText(entry.title) || 'untitled page'}...`));
                            const { decrypted, drawing } = await fetchFullyDecryptedItem(entry.id, workspaceKey);
                            const parent = nodeStack[nodeStack.length - 1];
                            const entryName = uniqueEntryName(decrypted.titleText, entry.id, getItemType(entry.id) || 'page');
                            const relPath = `${parent.relPath}/${entryName}`;
                            await exportLeafItem(root, relPath, entry.id, decrypted, drawing, isCancelled);
                            dispatch(incrementLeafItemCount());
                            parent.children.push({ id: entry.id, type: getItemType(entry.id), title: decrypted.titleText, entryName });
                        } catch (error) {
                            if (error instanceof ExportCancelledError) throw error;
                            debugLog(debugOn, `startExportThunk: failed to export item ${entry.id}`, error);
                            dispatch(addExportError({ itemId: entry.id, error: error.message || String(error) }));
                        }
                    },
                    onError: (info) => {
                        debugLog(debugOn, `startExportThunk: error walking ${info.itemId}`, info.error);
                        dispatch(addExportError({ itemId: info.itemId, error: info.error.message || String(info.error) }));
                    },
                });

                // If nothing was found, something went wrong reading the local backup. Don't
                // overwrite an earlier backup in this folder with an empty one.
                if (rootNode.children.length === 0) {
                    const errorCount = getState().localExport.exportErrors.length;
                    dispatch(setStatusBarMessage(`Export stopped: no content was found in your local backup${errorCount ? ` (${errorCount} errors)` : ''}. The backup folder was not changed.`));
                    dispatch(setExportInProgress(false));
                    resolve();
                    return;
                }

                await writeContainerManifest(root, rootNode.relPath, {
                    id: rootNode.id, type: rootNode.type, title: rootNode.title,
                    children: rootNode.children.map((c) => ({ id: c.id, type: c.type, title: c.title, relPath: c.entryName })),
                });

                await writeBackupManifest(root, {
                    formatVersion: 1,
                    exportedAt: new Date().toISOString(),
                    memberId: authState.memberId,
                    displayName: authState.displayName,
                    root: rootNode.relPath,
                    localBackupUpToDate,
                });

                const notice = localBackupUpToDate ? '' : ' Made from your existing local backup, so recent changes may be missing.';
                dispatch(setStatusBarMessage(`Export complete: ${getState().localExport.containerCount} folders/notebooks/diaries, ${getState().localExport.leafItemCount} pages, ${getState().localExport.exportErrors.length} errors.${notice}`));
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

function closeViewingItem(dispatch, getState) {
    const viewingItem = getState().localExport.viewingItem;
    if (viewingItem) revokeBlobUrls(viewingItem.blobUrls);
    dispatch(setViewingItem(null));
}

async function loadContainer(dispatch, getState, relPath) {
    const root = getState().localExport.backupRoot;
    const manifest = await readContainerManifest(root, relPath);
    closeViewingItem(dispatch, getState);
    dispatch(setCurrentContainer({ relPath, manifest }));
}

async function rememberFolder(dispatch, root) {
    try {
        await saveLastFolder(root);
        dispatch(setLastFolder(root));
    } catch (error) {
        debugLog(debugOn, "Failed to remember the backup folder: ", error);
    }
}

export const loadLastFolderThunk = () => async (dispatch) => {
    const lastFolder = await loadLastFolder();
    dispatch(setLastFolder(lastFolder));
}

export const loadAllowLoggedOutViewingThunk = () => async (dispatch) => {
    const allowed = await loadAllowLoggedOutViewing();
    dispatch(setAllowLoggedOutViewing(allowed));
    return allowed;
}

/** Turns "view backups without logging in" on or off. Only works while logged in, so someone who isn't logged in can't turn it on. */
export const changeAllowLoggedOutViewingThunk = (allowed) => async (dispatch, getState) => {
    if (!getState().auth.isLoggedIn) return;
    await saveAllowLoggedOutViewing(allowed);
    dispatch(setAllowLoggedOutViewing(!!allowed));
}

async function canViewBackups(dispatch, getState) {
    if (getState().auth.isLoggedIn) return true;
    return dispatch(loadAllowLoggedOutViewingThunk());
}

/**
 * Opens a backup folder to view it in the app.
 * - useLastFolder: open the remembered folder; if it's gone, ask the user to pick one
 * - autoOpen: used when the page loads by itself. It opens the remembered folder if it
 *   still exists, and never shows a folder picker.
 * - neither: ask the user to pick a folder
 * When logged out, it only works if "view backups without logging in" is turned on.
 */
export const openBackupFolderThunk = ({ useLastFolder = false, autoOpen = false } = {}) => (dispatch, getState) => {
    return newActivity(dispatch, localExportActivity.OpenBackup, async () => {
        dispatch(setOpenBackupError(null));
        if (!(await canViewBackups(dispatch, getState))) return;
        let root = null;
        if (useLastFolder || autoOpen) {
            const lastFolder = await loadLastFolder();
            dispatch(setLastFolder(lastFolder));
            if (lastFolder && await checkFolder(lastFolder)) {
                root = lastFolder;
            }
        }
        if (!root) {
            if (autoOpen) return;
            root = await pickBackupFolderToOpen();
            if (!root) return; // picker closed: keep showing whatever backup is open
        }
        // A folder was chosen: close the backup shown so far, so its content never
        // appears together with a warning (or content) about the new folder.
        closeViewingItem(dispatch, getState);
        dispatch(clearOpenBackup());
        let backupManifest;
        try {
            backupManifest = await readBackupManifest(root);
        } catch (error) {
            dispatch(setOpenBackupError("This folder is not a BSafes backup (backup-manifest.json is missing or unreadable)."));
            return;
        }
        dispatch(setBackupRoot(root));
        dispatch(setBackupManifest(backupManifest));
        dispatch(setBreadcrumbs([]));
        await rememberFolder(dispatch, root);
        try {
            await loadContainer(dispatch, getState, backupManifest.root);
        } catch (error) {
            dispatch(setOpenBackupError("Failed to read the backup: " + (error.message || String(error))));
        }
    });
}

export const openBackupChildThunk = (child) => (dispatch, getState) => {
    return newActivity(dispatch, localExportActivity.OpenBackup, async () => {
        const state = getState().localExport;
        const childRelPath = `${state.currentRelPath}/${child.relPath}`;
        dispatch(setOpenBackupError(null));
        try {
            if (CONTAINER_TYPES.has(child.type)) {
                const parentCrumb = { relPath: state.currentRelPath, title: state.currentContainerManifest.title };
                await loadContainer(dispatch, getState, childRelPath);
                dispatch(setBreadcrumbs([...state.breadcrumbs, parentCrumb]));
                return;
            }
            closeViewingItem(dispatch, getState);
            const { manifest, tampered, tamperedFiles, fileContents } = await readAndVerifyItem(state.backupRoot, childRelPath);
            if (tampered) {
                dispatch(setViewingItem({ relPath: childRelPath, title: manifest.title, tags: manifest.tags, tampered: true, tamperedFiles, bodyHtml: null, blobUrls: [] }));
                return;
            }
            const { bodyHtml, blobUrls } = buildViewableFragment(fileContents);
            dispatch(setViewingItem({ relPath: childRelPath, title: manifest.title, tags: manifest.tags, tampered: false, tamperedFiles: [], bodyHtml, blobUrls }));
        } catch (error) {
            debugLog(debugOn, "openBackupChildThunk failed: ", error);
            dispatch(setOpenBackupError("Failed to open this item - the backup may have been modified or is incomplete: " + (error.message || String(error))));
        }
    });
}

export const openBackupBreadcrumbThunk = (index) => (dispatch, getState) => {
    return newActivity(dispatch, localExportActivity.OpenBackup, async () => {
        const breadcrumbs = getState().localExport.breadcrumbs;
        const target = breadcrumbs[index];
        if (!target) return;
        dispatch(setOpenBackupError(null));
        try {
            await loadContainer(dispatch, getState, target.relPath);
            dispatch(setBreadcrumbs(breadcrumbs.slice(0, index)));
        } catch (error) {
            dispatch(setOpenBackupError("Failed to read the backup: " + (error.message || String(error))));
        }
    });
}

export const closeBackupItemThunk = () => (dispatch, getState) => {
    closeViewingItem(dispatch, getState);
}

export const closeBackupThunk = () => (dispatch, getState) => {
    closeViewingItem(dispatch, getState);
    dispatch(clearOpenBackup());
}

export default localExportSlice;