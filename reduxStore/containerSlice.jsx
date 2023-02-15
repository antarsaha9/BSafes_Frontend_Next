import { createSlice} from '@reduxjs/toolkit';

const forge = require('node-forge');
const DOMPurify = require('dompurify');

import { debugLog, PostCall } from '../lib/helper'
import {  stringToEncryptedTokens, newResultItem } from '../lib/bSafesCommonUI';
import { encryptBinaryString, decryptBinaryString, stringToEncryptedTokensCBC, decryptBinaryStringCBC } from '../lib/crypto';

import { getTeamData } from './teamSlice';

const debugOn = false;

const initialState = {
    activity: "Done", // Done, Loading, Searching
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
    selectedItems: [],
    containersPerPage: 20,
    containersPageNumber: 1,
    containerList: [],
    startDateValue: (new Date()).getTime(),
    diaryContentsPageFirstLoaded: true
};

const containerSlice = createSlice({
    name: "container",
    initialState: initialState,
    reducers: { 
        activityChanged: (state, action) => {
            state.activity = action.payload;
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
        selectItem: (state, action) => {
            state.selectedItems = state.selectedItems.concat([action.payload]);
        },
        deselectItem: (state, action) => {
            state.selectedItems = state.selectedItems.filter(i => i !== action.payload);
        },
        clearSelected: (state) => {
            state.selectedItems = [];
        },
        containersLoaded: (state, action) => {
            const containers = action.payload.hits;
            state.containerList = containers.map(c => {
                const {title, container, id} = newResultItem(c, state.workspaceKey);
                return {title: title.replace(/<\/?[^>]+(>|$)/g, ""), container, id};
            });
        },
        setStartDateValue:  (state, action) => {
            state.startDateValue = action.payload;
        },
        setDiaryContentsPageFirstLoaded: (state, action) => {
            state.diaryContentsPageFirstLoaded = action.payload;
        },   
    }
})

export const {activityChanged, clearContainer, setNavigationInSameContainer, changeContainerOnly, initContainer, setWorkspaceKeyReady, setMode, pageLoaded, clearItems, selectItem, deselectItem, clearSelected, containersLoaded, setStartDateValue, setDiaryContentsPageFirstLoaded} = containerSlice.actions;

const newActivity = async (dispatch, type, activity) => {
    dispatch(activityChanged(type));
    try {
        await activity();
        dispatch(activityChanged("Done"));
    } catch(error) {
        dispatch(activityChanged("Error"));
    }
}

export function setupNewItemKey() {
    const salt = forge.random.getBytesSync(16);
    const randomKey = forge.random.getBytesSync(32);
    const itemKey = forge.pkcs5.pbkdf2(randomKey, salt, 10000, 32);
    return itemKey;
}
  
export async function createANewItem(titleStr, currentContainer, selectedItemType, addAction, targetItem, targetPosition, workspaceKey, searchKey, searchIV) {
    return new Promise( (resolve, reject) => {
        const title = '<h2>' + titleStr + '</h2>';
        const encodedTitle = forge.util.encodeUtf8(title);
      
        const itemKey = setupNewItemKey();
        const keyEnvelope = encryptBinaryString(itemKey, workspaceKey);
        const encryptedTitle = encryptBinaryString(encodedTitle, itemKey);
      
        const titleTokens = stringToEncryptedTokens(titleStr, searchKey, searchIV);
      
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
        
        PostCall({
            api:'/memberAPI/' + addAction,
            body: addActionOptions
        }).then( data => {
            debugLog(debugOn, data);
            if(data.status === 'ok') {
                debugLog(debugOn, `${addAction} succeeded`);
                resolve(data.item)
            } else {
                debugLog(debugOn, `${addAction} failed: `, data.error)
                reject(data.error);
            } 
        }).catch( error => {
            debugLog(debugOn,  `${addAction} failed.`)
            reject(error);
        })
     });
};

export const initWorkspaceThunk = (data) => async (dispatch, getState) => {
    newActivity(dispatch, "Loading", () => {
        return new Promise(async (resolve, reject) => {
            let auth, team, teamKeyEnvelope, privateKeyFromPem, encodedTeamKey, teamKey, encryptedTeamName, teamIV, encodedTeamName, teamName, length, displayTeamName, teamSearchKeyEnvelope,teamSearchKeyIV, teamSearchIVEnvelope, teamSearchKey, teamSearchIV ;
            auth = getState().auth;
            try {
                dispatch(clearContainer());
                team = await getTeamData(data.teamId);
                teamKeyEnvelope = team.teamKeyEnvelope;
                privateKeyFromPem = forge.pki.privateKeyFromPem(auth.privateKey);
                encodedTeamKey = privateKeyFromPem.decrypt(forge.util.decode64(teamKeyEnvelope));
                teamKey = forge.util.decodeUtf8(encodedTeamKey);
                encryptedTeamName = team.team._source.name;
                if(team.team._source.IV) {
                    teamIV = team.team._source.IV;
                    encodedTeamName = decryptBinaryStringCBC(forge.util.decode64(encryptedTeamName), teamKey, forge.util.decode64(teamIV));
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
                    teamSearchKey = decryptBinaryStringCBC(forge.util.decode64(teamSearchKeyEnvelope), teamKey, forge.util.decode64(teamSearchKeyIV));
                } else {
                    teamSearchKey = decryptBinaryString(forge.util.decode64(teamSearchKeyEnvelope), teamKey);
                }
                if(team.team._source.searchIVEnvelope) {
                    teamSearchIVEnvelope = team.team._source.searchIVEnvelope;
                    teamSearchIV = decryptBinaryString(forge.util.decode64(teamSearchIVEnvelope), teamKey);
                }
                
                dispatch(initContainer({container: data.container, workspaceId:data.teamId, workspaceName:displayTeamName, workspaceKey:teamKey, searchKey:teamSearchKey, searchIV:teamSearchIV }));
                dispatch(setWorkspaceKeyReady(true));
                resolve();
            } catch(error) {
                debugLog(debugOn, "initWorkspaceThunk faile: ", error);
                reject(error);
            }
        });
    });
};

export const listItemsThunk = (data) => async (dispatch, getState) => {
    newActivity(dispatch, "Loading", () => {
        return new Promise(async (resolve, reject) => {
            let state, pageNumber;
            dispatch(setMode("listAll"));
            state = getState().container;
            
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
            } else if(state.container.startsWith('f') || state.container.startsWith('b')) {
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
                body
            }).then( data => {
                debugLog(debugOn, data);
                if(data.status === 'ok') {                                  
                    const total = data.hits.total;
                    const hits = data.hits.hits;
                    dispatch(pageLoaded({pageNumber, total, hits}));
                    resolve();
                } else {
                    debugLog(debugOn, "listItems failed: ", data.error);
                    reject(data.error);
                }
            }).catch( error => {
                debugLog(debugOn, "listItems failed: ", error)
                reject("listItems failed!");
            })
        });
    });
}

export const listContainerThunk = (data) => async (dispatch, getState) => {
    newActivity(dispatch, "Loading", () => {
        const state = getState().container;
        return new Promise(async (resolve, reject) => {        
            PostCall({
                api:'/memberAPI/listContainers',
                body:{
                    container: data.container,
                    from: (state.containersPageNumber - 1) * state.containersPerPage,
                    size: state.containersPerPage
                }
            }).then( data => {
                debugLog(debugOn, data);
                if(data.status === 'ok') {                                  
                    const total = data.hits.total;
                    const hits = data.hits.hits;
                    dispatch(containersLoaded({total, hits}));
                    resolve();
                } else {
                    debugLog(debugOn, "list container failed: ", data.error);
                    reject(data.error);
                }
            }).catch( error => {
                debugLog(debugOn, "list container failed: ", error)
                reject("list container failed!");
            })
        });
    });
}

export const searchItemsThunk = (data) => async (dispatch, getState) => {
    newActivity(dispatch, "Searching", () => {
        return new Promise(async (resolve, reject) => {
            let state, body, searchTokens, searchTokensStr;
            const pageNumber = data.pageNumber;
            dispatch(setMode("search"));
            state = getState().container;
            searchTokens = stringToEncryptedTokensCBC(data.searchValue, state.searchKey, state.searchIV);
            searchTokensStr = JSON.stringify(searchTokens);
            body = {
                container: state.container==='root'?state.workspace:state.container,
                searchTokens: searchTokensStr,
                size: state.itemsPerPage,
                from: (pageNumber - 1) * state.itemsPerPage,
            }
            PostCall({
                api:'/memberAPI/search',
                body
            }).then( data => {
                debugLog(debugOn, data);
                if(data.status === 'ok') {                                  
                    const total = data.hits.total;
                    const hits = data.hits.hits;
                    dispatch(pageLoaded({pageNumber, total, hits}));
                    resolve();
                } else {
                    debugLog(debugOn, "search failed: ", data.error);
                    reject(data.error);
                }
            }).catch( error => {
                debugLog(debugOn, "search failed: ", error)
                reject("listItems failed!");
            })
        });
    });
}

export const getFirstItemInContainer = async (container) => {
    return new Promise(async (resolve, reject) => {
        PostCall({
            api:'/memberAPI/getFirstItemInContainer',
            body: {
                container
            }
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
                reject(data.error);
            }
        }).catch( error => {
            debugLog(debugOn, "getFirstItemInContainer failed: ", error)
            reject("getFirstItemInContainer failed!");
        })
    });
}

export const getLastItemInContainer = async (container) => {
    return new Promise(async (resolve, reject) => {
        PostCall({
            api:'/memberAPI/getLastItemInContainer',
            body: {
                container
            }
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
                reject(data.error);
            }
        }).catch( error => {
            debugLog(debugOn, "getFirstItemInContainer failed: ", error)
            reject("getFirstItemInContainer failed!");
        })
    });
}

export const dropItems = async (data) => {
    const api = '/memberAPI/' + data.action;
    const payload = data.payload;
    return new Promise(async (resolve, reject) => {
        PostCall({
            api,
            body: payload
        }).then( data => {
            debugLog(debugOn, data);
            if(data.status === 'ok') {
                resolve();
            } else {
                debugLog(debugOn, "drop items inside failed: ", data.error);
                reject(data.error);
            }
        }).catch( error => {
            debugLog(debugOn, "drop items inside failed: ", error)
            reject("drop items inside failed!");
        })
    });
}

export const containerReducer = containerSlice.reducer;

export default containerSlice;
