import { createSlice} from '@reduxjs/toolkit';

import { debugLog, PostCall } from '../lib/helper'
import { newResultItem } from '../lib/bSafesCommonUI';
import { stringToEncryptedTokensCBC } from '../lib/crypto';

const debugOn = false;

const initialState = {
    activity: "Done", // Done, Loading, Searching
    error: null,
    container:null, // container of current item. Note: For contents page of a container, this is the container. e.g. This is the notebook id for a notebook contents page.
    workspace: null,
    workspaceKey: null,
    searchKey: null,
    searchIV: null,
    mode:"listAll", // listAll, search
    itemsPerPage: 20,
    pageNumber: 1,
    total: 0,
    totalNumberOfPages:0,
    hits:[],
    items:[],
    itemPath:{
        for:null,
        data:[{id:'u:'}]
    }
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
            state.workspaceKey = action.payload.workspaceKey;
            state.searchKey = action.payload.searchKey;
            state.searchIV = action.payload.searchIV;
            state.total = 0;
            state.hits = [];
            state.items = [];
        },
        changeContainerOnly: (state, action) => {
            state.container = action.payload.container;
            state.total = 0;
            state.hits = [];
            state.items = [];
        },
        pathLoaded: (state, action) => {
            state.itemPath = action.payload;
        },
        resetPath: (state, action) => {
            state.itemPath = initialState.itemPath;
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
    }
})

export const {activityChanged, clearContainer, changeContainerOnly, initContainer, pathLoaded, resetPath, setMode, pageLoaded, clearItems} = containerSlice.actions;

const newActivity = async (dispatch, type, activity) => {
    dispatch(activityChanged(type));
    try {
        await activity();
        dispatch(activityChanged("Done"));
    } catch(error) {
        dispatch(activityChanged("Error"));
    }
}

export const listItemsThunk = (data) => async (dispatch, getState) => {
    newActivity(dispatch, "Loading", () => {
        return new Promise(async (resolve, reject) => {
            let state, pageNumber;
            state = getState().container;
            
            let body;
            if(state.container.startsWith('n') || state.container.startsWith('b')) {
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
                    from: (pageNumber - 1) * state.itemsPerPage || 0,
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

export const searchItemsThunk = (data) => async (dispatch, getState) => {
    newActivity(dispatch, "Searching", () => {
        return new Promise(async (resolve, reject) => {
            let state, body, searchTokens, searchTokensStr;
            dispatch(setMode("search"));
            state = getState().container;
            searchTokens = stringToEncryptedTokensCBC(data.searchValue, state.searchKey, state.searchIV);
            searchTokensStr = JSON.stringify(searchTokens);
            body = {
                container: state.container==='root'?state.workspace:state.container,
                searchTokens: searchTokensStr,
                size: state.itemsPerPage,
                from: (data.pageNumber - 1) * state.itemsPerPage,
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

export const getItemPathThunk = (data) => async (dispatch, getState) => {
    newActivity(dispatch, "LoadingItemPath", () => {
        return new Promise(async (resolve, reject) => {
            console.log(data);
            const {itemId, workspaceKey} = data;
            PostCall({
                api: '/memberAPI/getItemPath',
                body: {
                    itemId
                },
            }).then(result => {
                debugLog(debugOn, result);
                if (result.status === 'ok') {
                    console.log(result);

                    const newPath = result.itemPath.map(path=>{
                        if(path._source){
                            const decryptedData = newResultItem(path, workspaceKey);
                            decryptedData.title = decryptedData.title.replace(/<\/?[^>]+(>|$)/g, "");
                            console.log(decryptedData);
                            return decryptedData;
                        }
                        return {id:path._id};
                    })
                    dispatch(pathLoaded({for:itemId,data:newPath}));
                    resolve();

                } else {
                    debugLog(debugOn, "woo... failed to get a item version history!", data.error);
                    reject("woo... failed to get a item version history!");
                }
            }).catch(error => {
                debugLog(debugOn, "woo... failed to get a item version history.", error)
                reject("woo... failed to get a item version history!");
            })
        });
    });
}

export const containerReducer = containerSlice.reducer;

export default containerSlice;
