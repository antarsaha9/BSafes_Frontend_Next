import { createSlice } from '@reduxjs/toolkit';

import { debugLog, PostCall } from '../lib/helper'
import { newResultItem } from '../lib/bSafesCommonUI';
import { stringToEncryptedTokensCBC } from '../lib/crypto';

const debugOn = false;

const initialState = {
    activity: "Done", // Done, Loading, Searching
    error: null,
    container: null, // container of current item. Note: For contents page of a container, this is the container. e.g. This is the notebook id for a notebook contents page.
    workspace: null,
    workspaceKey: null,
    workspaceKeyReady: false,
    searchKey: null,
    searchIV: null,
    mode: "listAll", // listAll, search
    itemsPerPage: 20,
    pageNumber: 1,
    total: 0,
    totalNumberOfPages: 0,
    hits: [],
    items: [],
};

const TeamSlice = createSlice({
    name: "team",
    initialState: initialState,
    reducers: {
        activityChanged: (state, action) => {
            state.activity = action.payload;
        },
        clearContainer: (state, action) => {
            const stateKeys = Object.keys(initialState);
            for (let i = 0; i < stateKeys.length; i++) {
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
        setWorkspaceKeyReady: (state, action) => {
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
            state.totalNumberOfPages = Math.ceil(action.payload.total / state.itemsPerPage);
            state.pageNumber = action.payload.pageNumber;
            state.hits = action.payload.hits;

            state.items = [];
            for (let i = 0; i < state.hits.length; i++) {
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

export const { activityChanged, clearContainer, changeContainerOnly, initContainer, setWorkspaceKeyReady, setMode, pageLoaded, clearItems } = TeamSlice.actions;

const newActivity = async (dispatch, type, activity) => {
    dispatch(activityChanged(type));
    try {
        await activity();
        dispatch(activityChanged("Done"));
    } catch (error) {
        dispatch(activityChanged("Error"));
    }
}

export const listTeamsThunk = (data) => async (dispatch, getState) => {
    newActivity(dispatch, "Loading", () => {
        return new Promise(async (resolve, reject) => {
            let state, pageNumber;
            dispatch(setMode("listAll"));
            state = getState().team;
            PostCall({
                api: '/memberAPI/listTeams',
                body: {
                    from: 0,
                    size: 20
                }
            }).then(data => {
                debugLog(debugOn, data);
                if (data.status === 'ok') {
                    console.log(data);
                    // const total = data.hits.total;
                    // const hits = data.hits.hits;
                    // dispatch(pageLoaded({ pageNumber, total, hits }));
                    resolve();
                } else {
                    debugLog(debugOn, "listItems failed: ", data.error);
                    reject(data.error);
                }
            }).catch(error => {
                debugLog(debugOn, "listItems failed: ", error)
                reject("listItems failed!");
            })
        });
    });
}


export const teamReducer = TeamSlice.reducer;

export default TeamSlice;
