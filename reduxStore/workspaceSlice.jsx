import { createSlice} from '@reduxjs/toolkit';
const forge = require('node-forge');
const DOMPurify = require('dompurify');
const axios = require('axios');

import { debugLog, PostCall } from '../lib/helper'

const debugOn = true;

const initialState = {
    activity: "Done", // Done, Loading, Searching
    error: null,
    currentSpace: null,
    mode:"listAll", // listAll, search
    itemsPerPage: 20,
    pageNumber: 1,
    total: 0,
    hits:[],
};

const workspaceSlice = createSlice({
    name: "workspace",
    initialState: initialState,
    reducers: {
        activityChanged: (state, action) => {
            state.activity = action.payload;
        },
    }
})

export const {activityChanged} = workspaceSlice.actions;

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
            PostCall({
                api:'/memberAPI/listItems',
                body: {
                    container: state.currentSpace,
                    size: state.itemsPerPage,
                    from: (state.pageNumber - 1) * state.itemsPerPage,
                }
            }).then( data => {
                debugLog(debugOn, data);
                if(data.status === 'ok') {                                  
                    const signedURL = data.signedURL;
                    resolve(signedURL);
                } else {
                    debugLog(debugOn, "preS3Download failed: ", data.error);
                    reject(data.error);
                }
            }).catch( error => {
                debugLog(debugOn, "preS3Download failed: ", error)
                reject("preS3Download failed!");
            })
        });
    });
}

export const workspaceReducer = workspaceSlice.reducer;

export default workspaceSlice;
