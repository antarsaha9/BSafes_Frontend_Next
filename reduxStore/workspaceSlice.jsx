import { createSlice} from '@reduxjs/toolkit';
const forge = require('node-forge');
const DOMPurify = require('dompurify');
const axios = require('axios');

import { debugLog, PostCall } from '../lib/helper'
import { newResultItem } from '../lib/bSafesCommonUI';

const debugOn = true;

const initialState = {
    activity: "Done", // Done, Loading, Searching
    error: null,
    currentSpace: null,
    workspaceKey: null,
    searchKey: null,
    searchIV: null,
    mode:"listAll", // listAll, search
    itemsPerPage: 20,
    pageNumber: 1,
    total: 0,
    hits:[],
    items:[],
};

const workspaceSlice = createSlice({
    name: "workspace",
    initialState: initialState,
    reducers: { 
        activityChanged: (state, action) => {
            state.activity = action.payload;
        },
        initWorkspace: (state, action) => {
            state.currentSpace = action.payload.workspaceId;
            state.workspaceKey = action.payload.workspaceKey;
            state.searchKey = action.payload.searchKey;
            state.searchIV = action.payload.searchIV;
        },
        pageLoaded: (state, action) => {
            state.total = action.payload.total;
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
    }
})

export const {activityChanged, initWorkspace, pageLoaded} = workspaceSlice.actions;

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
            const state = getState().workspace;
            const pageNumber = data.pageNumber;
            PostCall({
                api:'/memberAPI/listItems',
                body: {
                    container: state.currentSpace,
                    size: state.itemsPerPage,
                    from: (pageNumber - 1) * state.itemsPerPage,
                }
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

export const workspaceReducer = workspaceSlice.reducer;

export default workspaceSlice;
