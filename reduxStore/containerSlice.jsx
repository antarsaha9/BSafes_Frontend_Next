import { createSlice} from '@reduxjs/toolkit';

const forge = require('node-forge');
const DOMPurify = require('dompurify');

import { debugLog, PostCall, extractHTMLElementText} from '../lib/helper'
import { newResultItem, formatTimeDisplay, isItemAContainer } from '../lib/bSafesCommonUI';
import { encryptBinaryString, decryptBinaryString, stringToEncryptedTokensCBC, stringToEncryptedTokensECB, decryptBinaryStringCBC } from '../lib/crypto';
import { containerActivity } from '../lib/activities';

import { getTeamData } from './teamSlice';
import { getItemPathThunk } from './pageSlice';

const debugOn = true;

const initialState = {
    activity: 0,  
    activityErrors: 0,
    activityErrorMessages: {},
    listingItems: false,
    error: null,
    container:null, // container of current item. Note: For contents page of a container, this is the container. e.g. This is the notebook id for a notebook contents page.
    navigationInSameContainer: false,
    workspace: null,
    workspaceName: null,
    workspaceKey: null,
    workspaceKeyReady: false,
    searchKey: null,
    searchIV: null,
    mode:"listAll", // listAll, search
    itemsPerPage: 20,
    pageNumber: 1,
    total: 0,
    totalNumberOfPages:0,
    hits:[],
    items:[],
    newItem: null,
    selectedItems: [],
    containersPerPage: 20,
    containersPageNumber: 1,
    containersTotal:0,
    containersList: [],
    startDateValue: (new Date()).getTime(),
    diaryContentsPageFirstLoaded: true,
    trashBoxId:null,
    activities:[],
    movingItemsTask: null
};

function separateActivities(activities, getTitle) {
    var previousId;
    return activities.reduce((acc, activity) => {
        const updatedTime = formatTimeDisplay(activity._source.createdTime);
        let title, titleText;
        
        let updatedText;
        if(activity._source.version < 0) {
            titleText = 'Trashed item';
            updatedText = activity._source.update;
        } else {
            title = activity._id.charAt(0) === 't' ? "Trash Box" : getTitle(activity);
            titleText = extractHTMLElementText(title);
            updatedText = activity._source.version === 1 ? "Creation" : "Updated " + activity._source.update
        }
        const formatedActivity = {
            id: activity._source.id,
            container: activity._source.container,
            titleText,
            updatedText,
            updatedBy: DOMPurify.sanitize(activity._source.displayName ? activity._source.displayName : activity._source.updatedBy),
            updatedTime,
            createdTime: activity._source.createdTime
        }
        if (previousId !== activity._source.id) {
            previousId = activity._source.id;
            acc.push([formatedActivity]);
        } else {
            acc[acc.length - 1].push(formatedActivity)
        }
        return acc;
    }, []);
}

const containerSlice = createSlice({
    name: "container",
    initialState: initialState,
    reducers: { 
        cleanContainerSlice: (state, action) => {
            const stateKeys = Object.keys(initialState);
            for(let i=0; i<stateKeys.length; i++) {
                let key = stateKeys[i];
                state[key] = initialState[key];
            }
        },
        activityStart: (state, action) => {
            state.activityErrors &= ~action.payload;
            state.activityErrorMessages[action.payload]='';
            state.activity |= action.payload;
        },
        activityDone: (state, action) => {
            state.activity &= ~action.payload;
        },
        activityError: (state, action) => {
            state.activity &= ~action.payload.type;
            state.activityErrors |= action.payload.type;
            state.activityErrorMessages[action.payload.type] = action.payload.error;
        },
        setListingItems: (state, action) => {
            state.listingItems = action.payload;
        },
        clearContainer: (state, action) => {
            const stateKeys = Object.keys(initialState);
            for(let i=0; i<stateKeys.length; i++) {
                let key = stateKeys[i];
                state[key] = initialState[key];
            }
        },
        initContainer: (state, action) => {
            state.container = action.payload.container;
            state.workspace = action.payload.workspaceId;
            state.workspaceName = action.payload.workspaceName || 'Personal';
            state.workspaceKey = action.payload.workspaceKey;
            state.searchKey = action.payload.searchKey;
            state.searchIV = action.payload.searchIV;
            state.total = 0;
            state.hits = [];
            state.items = [];
        },
        setNavigationInSameContainer: (state, action) => {
            state.navigationInSameContainer = action.payload;
        },
        changeContainerOnly: (state, action) => {
            state.container = action.payload.container;
            state.total = 0;
            state.hits = [];
            state.items = [];
        },
        setWorkspaceKeyReady : (state, action) => {
            state.workspaceKeyReady = action.payload;
        },
        setMode: (state, action) => {
            state.mode = action.payload;
            state.total = 0;
            state.totalNumberOfPages = 0;
            state.pageNumber = 1;
            state.hits = [];
            state.items = [];
        },
        pageLoaded: (state, action) => {
            state.total = action.payload.total;
            state.totalNumberOfPages = Math.ceil(action.payload.total/state.itemsPerPage);
            state.pageNumber = action.payload.pageNumber;
            state.hits = action.payload.hits;
            
            state.items = [];
            for(let i=0; i<state.hits.length; i++) {
                let resultItem;
                let item = state.hits[i];
                if (item._source && item._source.type === 'T') continue;
                
                resultItem = newResultItem(item, state.workspaceKey);
                state.items.push(resultItem);
            }
        },
        clearItems: (state, action) => {
            state.total = 0;
            state.totalNumberOfPages = 0;
            state.pageNumber = 1;
            state.hits = [];
            state.items = [];
        },
        setNewItem: (state, action) => {
            state.newItem = action.payload;
        },
        clearNewItem: (state, action) => {
            state.newItem = null;
        },
        selectItem: (state, action) => {
            state.selectedItems = state.selectedItems.concat([action.payload]);
        },
        deselectItem: (state, action) => {
            state.selectedItems = state.selectedItems.filter(i => i.id !== action.payload);
        },
        clearSelected: (state) => {
            state.selectedItems = [];
        },
        containersLoaded: (state, action) => {
            state.containersTotal = action.payload.total;
            state.containersPageNumber = action.payload.pageNumber;
            const containers = action.payload.hits;
            const newContainersList = containers.map(c => {
                const {title, container, id} = newResultItem(c, state.workspaceKey);
                return {title: title.replace(/<\/?[^>]+(>|$)/g, ""), container, id};
            });
            if(action.payload.pageNumber === 1){
                state.containersList = newContainersList;
            } else {
                state.containersList = state.containersList.concat(newContainersList);
            }     
        },
        setStartDateValue:  (state, action) => {
            state.startDateValue = action.payload;
        },
        setDiaryContentsPageFirstLoaded: (state, action) => {
            state.diaryContentsPageFirstLoaded = action.payload;
        },
        trashBoxIdLoaded: (state, action) => {
            state.trashBoxId = action.payload.trashBoxId;;
        },
        clearActivities: (state, action) => {
            state.activities = [];
            state.total = 0;
            state.pageNumber = 1;
        },
        activitiesLoaded: (state, action) => {
            const groupedActivities = separateActivities(action.payload.activities.hits, (a)=>newResultItem(a, state.workspaceKey).title);
            state.total = action.payload.activities.total;
            state.pageNumber = action.payload.pageNumber;
            state.activities = state.activities.concat(groupedActivities);
        },
        setMovingItemsTask: (state, action) => {
            state.movingItemsTask = action.payload;
        },
        completedMovingAnItem: (state, action) => {
            state.movingItemsTask.completed += 1;
            state.items = state.items.filter(i=> i.id !== action.payload.id);
        },
        insertAnItemBefore: (state, action) => {
            const targetItem = action.payload.targetItem;
            const newItems=[];
            for(let i=state.items.length-1; i>=0; i--){
                newItems.unshift(state.items[i]);
                if(state.items[i].id === targetItem) {
                    newItems.unshift(action.payload.item);
                }
            }
            state.items = newItems;
        },
        insertAnItemAfter: (state, action) => {
            const targetItem = action.payload.targetItem;
            const newItems=[];
            for(let i=0; i<state.items.length; i++){
                newItems.push(state.items[i]);
                if(state.items[i].id === targetItem) {
                    newItems.push(action.payload.item);
                }
            }
            state.items = newItems;
        }
    }
})

export const {cleanContainerSlice, activityStart, activityDone, activityError, setListingItems, clearContainer, setNavigationInSameContainer, changeContainerOnly, initContainer, setWorkspaceKeyReady, setMode, pageLoaded, clearItems, setNewItem, clearNewItem, selectItem, deselectItem, clearSelected, containersLoaded, setStartDateValue, setDiaryContentsPageFirstLoaded, trashBoxIdLoaded, clearActivities, activitiesLoaded, setMovingItemsTask, completedMovingAnItem, insertAnItemBefore, insertAnItemAfter} = containerSlice.actions;

const newActivity = async (dispatch, type, activity) => {
    dispatch(activityStart(type));
    try {
        await activity();
        dispatch(activityDone(type));
    } catch(error) {
        dispatch(activityError({type, error}));
    }
}

export function setupNewItemKey() {
    const salt = forge.random.getBytesSync(16);
    const randomKey = forge.random.getBytesSync(32);
    const itemKey = forge.pkcs5.pbkdf2(randomKey, salt, 10000, 32);
    return itemKey;
}

export const createANewItemThunk = (data) => async (dispatch, getState) => {
    const titleStr = data.titleStr;
    const currentContainer = data.currentContainer;
    const selectedItemType = data.selectedItemType;
    const addAction = data.addAction;
    const targetItem = data.targetItem; 
    const targetPosition = data.targetPosition; 
    const workspaceKey = data.workspaceKey;
    const searchKey = data.searchKey;
    const searchIV = data.searchIV;
    newActivity(dispatch, containerActivity.CreateANewItem, () => {
        return new Promise( (resolve, reject) => {
            const auth = getState().auth;
            const title = '<h2>' + titleStr + '</h2>';
            const encodedTitle = forge.util.encodeUtf8(title);
          
            const itemKey = setupNewItemKey();
            const keyEnvelope = encryptBinaryString(itemKey, workspaceKey);
            const encryptedTitle = encryptBinaryString(encodedTitle, itemKey);
          
            let titleTokens;
            if(auth.accountVersion === 'v1') {
                titleTokens = stringToEncryptedTokensECB(titleStr, searchKey)
            } else {
                titleTokens = stringToEncryptedTokensCBC(titleStr, searchKey, searchIV);
            }
          
            let addActionOptions;
            if (addAction === "addAnItemOnTop") {
              addActionOptions = {
                "targetContainer": currentContainer,
                "type": selectedItemType,
                "keyEnvelope": forge.util.encode64(keyEnvelope),
                "title": forge.util.encode64(encryptedTitle),
                "titleTokens": JSON.stringify(titleTokens)
              };
            } else {
              addActionOptions = {
                "targetContainer": currentContainer,
                "targetItem": targetItem,
                "targetPosition": targetPosition,
                "type": selectedItemType,
                "keyEnvelope": forge.util.encode64(keyEnvelope),
                "title": forge.util.encode64(encryptedTitle),
                "titleTokens": JSON.stringify(titleTokens)
              };
            }
            const workspace = getState().container.workspace;
            addActionOptions.space = workspace;
            PostCall({
                api:'/memberAPI/' + addAction,
                body: addActionOptions,
                dispatch
            }).then( data => {
                debugLog(debugOn, data);
                if(data.status === 'ok') {
                    debugLog(debugOn, `${addAction} succeeded`);
                    dispatch(setNewItem(data.item))
                    resolve()
                } else {
                    debugLog(debugOn, `${addAction} failed: `, data.error)
                    reject("Failed to create a new item.");
                } 
            }).catch( error => {
                debugLog(debugOn,  `${addAction} failed.`)
                reject("Failed to create a new item.");
            })
         });
    });
};

export const initWorkspaceThunk = (data) => async (dispatch, getState) => {
    dispatch(clearContainer());
    
    newActivity(dispatch, containerActivity.InitWorkspace, () => {
        return new Promise(async (resolve, reject) => {
            let state, auth, team, teamKeyEnvelope, privateKeyFromPem, encodedTeamKey, teamKey, workspaceId, encryptedTeamName, teamIV, encodedTeamName, teamName, length, displayTeamName, teamSearchKeyEnvelope,teamSearchKeyIV, teamSearchIVEnvelope, teamSearchKey, teamSearchIV ;
            auth = getState().auth;
            try {
                
                if(auth.accountVersion === 'v1') {
                    workspaceId = data.teamId + ':' + '1' + ':' + '0';
                } else {
                    workspaceId = data.teamId;
                }
                
                team = await getTeamData(data.teamId);
                state = getState().container;
                if(state.workspaceKeyReady) {
                    debugLog(debugOn, "Duplicated initWorkspace.")
                    resolve();
                    return;
                }

                teamKeyEnvelope = team.teamKeyEnvelope;
                privateKeyFromPem = forge.pki.privateKeyFromPem(auth.privateKey);
                encodedTeamKey = privateKeyFromPem.decrypt(forge.util.decode64(teamKeyEnvelope));
                teamKey = forge.util.decodeUtf8(encodedTeamKey);
                encryptedTeamName = team.team._source.name;
                if(team.team._source.IV) {
                    teamIV = team.team._source.IV;
                    encodedTeamName = decryptBinaryString(forge.util.decode64(encryptedTeamName), teamKey, forge.util.decode64(teamIV));
                } else {
                    encodedTeamName = decryptBinaryString(forge.util.decode64(encryptedTeamName), teamKey);
                }
                
                teamName = forge.util.decodeUtf8(encodedTeamName);
                teamName = DOMPurify.sanitize(teamName);
                length = teamName.length;
                if (teamName.length > 20) {
                    displayTeamName = teamName.substr(0, 20);
                } else {
                    displayTeamName = teamName;
                }
        
                teamSearchKeyEnvelope = team.team._source.searchKeyEnvelope;
                if(team.team._source.searchKeyIV) {
                    teamSearchKeyIV = team.team._source.searchKeyIV;
                    teamSearchKey = decryptBinaryString(forge.util.decode64(teamSearchKeyEnvelope), teamKey, forge.util.decode64(teamSearchKeyIV));
                } else {
                    teamSearchKey = decryptBinaryString(forge.util.decode64(teamSearchKeyEnvelope), teamKey);
                }
                if(team.team._source.searchIVEnvelope) {
                    teamSearchIVEnvelope = team.team._source.searchIVEnvelope;
                    teamSearchIV = decryptBinaryString(forge.util.decode64(teamSearchIVEnvelope), teamKey);
                }
                
                dispatch(initContainer({container: data.container, workspaceId, workspaceName:displayTeamName, workspaceKey:teamKey, searchKey:teamSearchKey, searchIV:teamSearchIV }));
                dispatch(setWorkspaceKeyReady(true));
                resolve();
            } catch(error) {
                debugLog(debugOn, "initWorkspaceThunk failed: ", error);
                reject("Failed to initialize workspace.");
            }
        });
    });
};

export const listItemsThunk = (data) => async (dispatch, getState) => {
    newActivity(dispatch, containerActivity.ListItems, () => {
        return new Promise(async (resolve, reject) => {
            let state, pageNumber;
            dispatch(setListingItems(true));
            dispatch(setMode("listAll"));
            state = getState().container;
            if(!state.container){
                reject('container is null!');
                return;
            }
            let body;
            if(state.container.startsWith('n')) {
                pageNumber = data.pageNumber;
                body = {
                    container: state.container,
                    size: state.itemsPerPage,
                    from: (pageNumber - 1) * state.itemsPerPage,
                }
            } else if(state.container.startsWith('d')) {
                let selectedDiaryContentStartPosition, selectedDiaryContentEndPosition;
                const startDate = data.startDate;
                pageNumber= 1;
                selectedDiaryContentStartPosition = parseInt(startDate + '00');
                selectedDiaryContentEndPosition = parseInt(startDate + '31');

                body = {
                    container: state.container,
                    size: 31,
                    from: 0,
                    selectedDiaryContentStartPosition,
                    selectedDiaryContentEndPosition
                }
            } else if(state.container.startsWith('f') || state.container.startsWith('b') || state.container.startsWith('t')) {
                pageNumber = data.pageNumber;
                body = {
                    container: state.container,
                    size: state.itemsPerPage,
                    from: (pageNumber - 1) * state.itemsPerPage,
                }
            } else {
                pageNumber = data.pageNumber;
                body = {
                    container: state.workspace,
                    size: state.itemsPerPage,
                    from: (pageNumber - 1) * state.itemsPerPage,
                }
            }

            PostCall({
                api:'/memberAPI/listItems',
                body,
                dispatch
            }).then( data => {
                debugLog(debugOn, data);
                if(data.status === 'ok') {                                  
                    const total = data.hits.total;
                    const hits = data.hits.hits;
                    dispatch(pageLoaded({pageNumber, total, hits}));
                    resolve();
                } else {
                    debugLog(debugOn, "listItems failed: ", data.error);
                    reject("Failed to list items.");
                }
            }).catch( error => {
                debugLog(debugOn, "listItems failed: ", error)
                reject("Failed to list items.");
            }).finally(()=> {
                dispatch(setListingItems(false));
            })
        });
    });
}

export const listContainersThunk = (data) => async (dispatch, getState) => {
    newActivity(dispatch, containerActivity.ListContainers, () => {
        const state = getState().container;
        return new Promise(async (resolve, reject) => {
            const pageNumber = data.pageNumber;        
            PostCall({
                api:'/memberAPI/listContainers',
                body:{
                    container: data.container,
                    boxOnly: data.boxOnly,
                    from: (pageNumber - 1) * state.containersPerPage,
                    size: state.containersPerPage
                },
                dispatch
            }).then( data => {
                debugLog(debugOn, data);
                if(data.status === 'ok') {                                  
                    const total = data.hits.total;
                    const hits = data.hits.hits;
                    dispatch(containersLoaded({total, pageNumber, hits}));
                    resolve();
                } else {
                    debugLog(debugOn, "list container failed: ", data.error);
                    reject("Failed to list containers.");
                }
            }).catch( error => {
                debugLog(debugOn, "list container failed: ", error)
                reject("Failed to list containers.");
            })
        });
    });
}

export const searchItemsThunk = (data) => async (dispatch, getState) => {
    newActivity(dispatch, containerActivity.SearchItems, () => {
        return new Promise(async (resolve, reject) => {
            let auth, state, body, searchTokens, searchTokensStr;
            const pageNumber = data.pageNumber;
            dispatch(setMode("search"));
            auth = getState().auth;
            state = getState().container;
            if(auth.accountVersion === 'v1') {
                searchTokens = stringToEncryptedTokensECB(data.searchValue, state.searchKey)
            } else {
                searchTokens = stringToEncryptedTokensCBC(data.searchValue, state.searchKey, state.searchIV);
            }
            
            searchTokensStr = JSON.stringify(searchTokens);
            body = {
                container: state.container==='root'?state.workspace:state.container,
                searchTokens: searchTokensStr,
                size: state.itemsPerPage,
                from: (pageNumber - 1) * state.itemsPerPage,
            }
            PostCall({
                api:'/memberAPI/search',
                body,
                dispatch
            }).then( data => {
                debugLog(debugOn, data);
                if(data.status === 'ok') {                                  
                    const total = data.hits.total;
                    const hits = data.hits.hits;
                    dispatch(pageLoaded({pageNumber, total, hits}));
                    resolve();
                } else {
                    debugLog(debugOn, "search failed: ", data.error);
                    reject("Failed to search items.");
                }
            }).catch( error => {
                debugLog(debugOn, "search failed: ", error)
                reject("Failed to search items.");
            })
        });
    });
}

export const getFirstItemInContainer = async (container, dispatch) => {
    return new Promise(async (resolve, reject) => {
        PostCall({
            api:'/memberAPI/getFirstItemInContainer',
            body: {
                container
            },
            dispatch
        }).then( data => {
            debugLog(debugOn, data);
            if(data.status === 'ok') {                                  
                let itemId = null;
                if (data.hits.hits.length) {
                    itemId = data.hits.hits[0]._id;
                }
                resolve(itemId);
            } else {
                debugLog(debugOn, "getFirstItemInContainer failed: ", data.error);
                reject("Failed to get first item.");
            }
        }).catch( error => {
            debugLog(debugOn, "getFirstItemInContainer failed: ", error)
            reject("Failed to get first item.");
        })
    });
}

export const getLastItemInContainer = async (container, dispatch) => {
    return new Promise(async (resolve, reject) => {
        PostCall({
            api:'/memberAPI/getLastItemInContainer',
            body: {
                container
            },
            dispatch
        }).then( data => {
            debugLog(debugOn, data);
            if(data.status === 'ok') {                                  
                let itemId = null;
                if (data.hits.hits.length) {
                    itemId = data.hits.hits[0]._id;
                }
                resolve(itemId);
            } else {
                debugLog(debugOn, "getLastItemInContainer failed: ", data.error);
                reject("Failed to get last item.");
            }
        }).catch( error => {
            debugLog(debugOn, "getLastItemInContainer failed: ", error)
            reject("Failed to get last item");
        })
    });
}

function dropAnItem(api, payload, dispatch) {
    
    return new Promise(async (resolve, reject) => {
        PostCall({
            api,
            body: payload,
            dispatch
        }).then( data => {
            debugLog(debugOn, data);
            if(data.status === 'ok') {
                resolve();
            } else {
                debugLog(debugOn, "dropAnItem failed: ", data.error);
                reject("Failed to drop an item.");
            }
        }).catch( error => {
            debugLog(debugOn, "dropAnItem failed: ", error)
            reject("Failed to drop an item.");
        })
    });

}

export const dropItemsThunk = (data) => async (dispatch, getState) => {
    newActivity(dispatch, containerActivity.DropItems, () => {
        return new Promise(async (resolve, reject) => {
            const action = data.action;
            const fromTopControlPanel = data.fromTopControlPanel;
            const payload = data.payload;
            const items = payload.items;
            const numberOfItems = items.length;
            const targetItemIndex = payload.targetItemIndex;

            let containerItems = getState().container.items;
            let nextItemPosition = -1;
            let api;
            switch(action) {
                case 'dropItemsBefore':
                    api = '/memberAPI/dropAnItemBefore';
                    nextItemPosition = (targetItemIndex === 0)? -1: containerItems[targetItemIndex-1].position;
                    break;
                case 'dropItemsAfter':
                    api = '/memberAPI/dropAnItemAfter';
                    nextItemPosition = (targetItemIndex === (containerItems.length -1))? -1: containerItems[targetItemIndex+1].position;
                    break;
                default: 
                    api = '/memberAPI/dropAnItemInside';
            }

            dispatch(setMovingItemsTask({
                numberOfItems,
                completed: 0,
            }));
            let i, result;
            
            for(i=0; i<items.length; i++){
                const indexInTask=((action==='dropItemsAfter') || (action==='dropItemsInside'))?(items.length-i-1):i;
                let item = items[indexInTask];
                let itemCopy = {id:item.id, container:item.container, position: item.position, type:item.itemPack.type};
                if(isItemAContainer(item.id)){
                    itemCopy.totalItemVersions = item.itemPack.totalItemVersions || 0;
                    itemCopy.totalStorage = item.itemPack.totalStorage || 0;
                } else {
                    itemCopy.version = item.itemPack.version;
                    itemCopy.totalItemSize = item.itemPack.totalItemSize;
                }
                const itemPayload = {
                    space: payload.space,
                    targetContainer: payload.targetContainer,
                    item: JSON.stringify(itemCopy),
                    targetItem: payload.targetItem,
                    targetPosition: payload.targetPosition,
                    indexInTask,
                    numberOfItems,
                    nextItemPosition,
                }
                if(action === 'dropItemsInside') {
                    itemPayload.sourceContainersPath = payload.sourceContainersPath;
                    itemPayload.targetContainersPath = payload.targetContainersPath;
                }
                try {
                    await dropAnItem(api, itemPayload, dispatch);
                    dispatch(deselectItem(item.id));
                    if(fromTopControlPanel) {
                        dispatch(getItemPathThunk({itemId:item.id}));
                    } else {
                        dispatch(completedMovingAnItem(item));
                        switch(action) {
                            case 'dropItemsBefore':
                                dispatch(insertAnItemBefore({targetItem: payload.targetItem, item}));
                                break;
                            case 'dropItemsAfter':
                                dispatch(insertAnItemAfter({targetItem: payload.targetItem, item}));
                                break;
                            default: 
                        }
                    }
                } catch (error) {
                    debugLog(debugOn, "dropItemsThunk failed: ", error)
                    result == "Failed to drop items.";
                    break;
                }
            }
            dispatch(setMovingItemsTask(null));
            if(i===items.length) {
                resolve();
            } else {
                reject(result);
            }
        });
    });
}

function trashAnItem(api, payload, dispatch) {
    return new Promise(async (resolve, reject) => {
        PostCall({
            api,
            body: payload,
            dispatch
        }).then( data => {
            debugLog(debugOn, data);
            if(data.status === 'ok') {
                resolve();
            } else {
                debugLog(debugOn, "trashAnItem failed: ", data.error);
                reject("Failed to trash an item.");
            }
        }).catch( error => {
            debugLog(debugOn, "trashAnItem failed: ", error)
            reject("Failed to trash an item.");
        })
    });
}

export const trashItemsThunk = (data) => async (dispatch, getState) => {
    newActivity(dispatch, containerActivity.TrashItems, () => {
        const api = '/memberAPI/trashAnItem' ;
        const fromTopControlPanel = data.fromTopControlPanel;
        const payload = data.payload;
        const { items } = payload;
        return new Promise(async (resolve, reject) => {
            dispatch(setMovingItemsTask({
                numberOfItems: payload.items.length,
                completed: 0,
            }));
            let result = null;
            for (let i=items.length-1; i>=0; i-- ) {
                let item = items[i];
                let itemCopy = {id:item.id, container:item.container, type:item.itemPack.type, position: item.position};
                if(isItemAContainer(item.id)){
                    itemCopy.totalItemVersions = item.itemPack.totalItemVersions || 0;
                    itemCopy.totalStorage = item.itemPack.totalStorage || 0;
                } else {
                    itemCopy.version = item.itemPack.version;
                    itemCopy.totalItemSize = item.itemPack.totalItemSize;
                }
                const itemPayload = {
                    item: JSON.stringify(itemCopy),
                    targetSpace: payload.targetSpace,
                    originalContainer: payload.originalContainer,
                    sourceContainersPath: payload.sourceContainersPath
                }

                try {
                    await trashAnItem(api, itemPayload, dispatch);
                    dispatch(deselectItem(item.id));
                    if(fromTopControlPanel) {

                    } else {
                        dispatch(completedMovingAnItem(item));
                    }
                } catch (error) {
                    debugLog(debugOn, "trashItemsThunk failed: ", error)
                    result == "Failed to trash items.";
                    break;
                }

            }

            dispatch(setMovingItemsTask(null));
            if(!result) {
                resolve();
            } else {
                reject(result);
            }
        });
    });
}

export const getTrashBoxThunk = (data) => async (dispatch, getState) => {
    newActivity(dispatch, containerActivity.GetTrashBox, () => {
        return new Promise(async (resolve, reject) => {
            const state = getState().container;
            
            PostCall({
                api:'/memberAPI/getTrashBox',
                body:{
                    teamSpace:state.workspace
                },
                dispatch
            }).then( data => {
                debugLog(debugOn, data);
                if(data.status === 'ok') {                                  
                    const {trashBoxId} = data;
                    if(trashBoxId) {
                        dispatch(trashBoxIdLoaded({trashBoxId}));
                    }
                    resolve();
                } else {
                    debugLog(debugOn, "getTrashBox failed: ", data.error);
                    reject("Failed to get trash box.");
                }
            }).catch( error => {
                debugLog(debugOn, "getTrashBox failed: ", error)
                reject("Failed to get trash box.");
            })
        });
    });
}

function emptyATrashBoxItem(api, payload, dispatch) {
    return new Promise(async (resolve, reject) => {
        PostCall({
            api,
            body: payload,
            dispatch
        }).then( data => {
            debugLog(debugOn, data);
            if(data.status === 'ok') {
                resolve();
            } else {
                debugLog(debugOn, "emptyATrashBoxItem failed: ", data.error);
                reject("Failed to empty a trash box item.");
            }
        }).catch( error => {
            debugLog(debugOn, "emptyATrashBoxItem failed: ", error)
            reject("Failed to empty a trash box item.");
        })
    });
}

export const emptyTrashBoxItemsThunk = (data) => async (dispatch, getState) => {
    newActivity(dispatch, containerActivity.EmptyTrashBoxItems, () => {
        const api = '/memberAPI/emptyATrashBoxItem' ;
        const payload = data.payload;
        const items  = payload.selectedItems;
        
        return new Promise(async (resolve, reject) => {
            dispatch(setMovingItemsTask({
                numberOfItems: items.length,
                completed: 0,
            }));

            let result = null;
            for (let i=items.length-1; i>=0; i-- ) {
                let item = items[i];
                let itemCopy = {
                    id:item.id, 
                    container:item.container, 
                    position: item.position
                };
                if(isItemAContainer(item.id)){
                    itemCopy.totalItemVersions = item.itemPack.totalItemVersions || 0;
                    itemCopy.totalStorage = item.itemPack.totalStorage || 0;
                } else {
                    itemCopy.version = item.itemPack.version;
                    itemCopy.totalItemSize = item.itemPack.totalItemSize;
                }
                const itemPayload = {
                    item: JSON.stringify(itemCopy),
                    teamSpace: payload.teamSpace,
                    trashBoxId: payload.trashBoxId
                }

                try {
                    await emptyATrashBoxItem(api, itemPayload, dispatch);
                    dispatch(deselectItem(item.id));
                    dispatch(completedMovingAnItem(item));
                } catch (error) {
                    debugLog(debugOn, "emptyTrashBoxItemsThunk failed: ", error)
                    result == "Failed to empty trash box items.";
                    break;
                }
            }
            dispatch(setMovingItemsTask(null));
            if(!result) {
                resolve();
            } else {
                reject("Failed to empty trash box items.");
            }
        });
    });
}

function restoreAnItemFromTrash(api, payload, dispatch) {
    return new Promise(async (resolve, reject) => {
        PostCall({
            api,
            body: payload,
            dispatch
        }).then( data => {
            debugLog(debugOn, data);
            if(data.status === 'ok') {
                resolve();
            } else {
                debugLog(debugOn, "restoreAnItemFromTrash failed: ", data.error);
                reject("Failed to restore an item from trash.");
            }
        }).catch( error => {
            debugLog(debugOn, "restoreAnItemFromTrash failed: ", error)
            reject("Failed to restore an item from trash.");
        })
    });
}

export const restoreItemsFromTrashThunk = (data) => async (dispatch, getState) => {
    newActivity(dispatch, containerActivity.RestoreItemsFromTrash, () => {
        const api = '/memberAPI/restoreAnItemFromTrash' ;
        const payload = data.payload;
        const items  = payload.selectedItems;

        return new Promise(async (resolve, reject) => {
            dispatch(setMovingItemsTask({
                numberOfItems: items.length,
                completed: 0,
            }));

            let result = null;
            for (let i=items.length-1; i>=0; i-- ) {
                let item = items[i];
                let itemCopy = {
                    id:item.id, 
                    container:item.container, 
                    position: item.position, 
                    originalContainer:item.itemPack.originalContainer, 
                    originalPosition:item.itemPack.originalPosition
                };
                if(isItemAContainer(item.id)){
                    itemCopy.totalItemVersions = item.itemPack.totalItemVersions || 0;
                    itemCopy.totalStorage = item.itemPack.totalStorage || 0;
                } else {
                    itemCopy.version = item.itemPack.version;
                    itemCopy.totalItemSize = item.itemPack.totalItemSize;
                }
                const itemPayload = {
                    item: JSON.stringify(itemCopy),
                    teamSpace: payload.teamSpace,
                    trashBoxId: payload.trashBoxId
                }

                try {
                    await restoreAnItemFromTrash(api, itemPayload, dispatch);
                    dispatch(deselectItem(item.id));
                    dispatch(completedMovingAnItem(item));
                } catch (error) {
                    debugLog(debugOn, "restoreItemsFromTrashThunk failed: ", error)
                    result = "Failed to restore items from trash";
                    break;
                }
            }
            dispatch(setMovingItemsTask(null));
            if(!result) {
                resolve();
            } else {
                reject(result);
            }
        });
    });
}

export const listActivitiesThunk = (data) => async (dispatch, getState) => {
    newActivity(dispatch, containerActivity.ListActivities, () => {
        return new Promise(async (resolve, reject) => {
            const state = getState().container;
            const pageNumber = data.pageNumber || state.pageNumber + 1;

            PostCall({
                api: '/memberAPI/listActivities',
                body: {
                    space: state.workspace,
                    size: state.itemsPerPage,
                    from: (pageNumber - 1) * state.itemsPerPage,
                },
                dispatch
            }).then(data => {
                debugLog(debugOn, data);
                if (data.status === 'ok') {
                    dispatch(activitiesLoaded({ pageNumber, activities: data.hits }));
                    resolve();
                } else {
                    debugLog(debugOn, "listActivities failed: ", data.error);
                    reject("Failed to list activities.");
                }
            }).catch(error => {
                debugLog(debugOn, "listActivities failed: ", error)
                reject("Failed to list activities.");
            })
        });
    });
}

export const containerReducer = containerSlice.reducer;

export default containerSlice;
