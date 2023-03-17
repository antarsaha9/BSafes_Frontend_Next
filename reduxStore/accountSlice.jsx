import { createSlice } from '@reduxjs/toolkit';

import { debugLog, PostCall } from '../lib/helper'

const debugOn = true;

const initialState = {
    activity: "Done", // Done, Loading, Searching
    error: null,
    dashboard: {}
};

const accountSlice = createSlice({
    name: "account",
    initialState: initialState,
    reducers: {
        activityChanged: (state, action) => {
            state.activity = action.payload;
        },
        MFALoaded: (state, action) => {
            state.mfa = action.payload;
        },
    }
})

export const { activityChanged, MFALoaded } = accountSlice.actions;

const newActivity = async (dispatch, type, activity) => {
    dispatch(activityChanged(type));
    try {
        await activity();
        dispatch(activityChanged("Done"));
    } catch (error) {
        dispatch(activityChanged("Error"));
    }
}

export const getMFADataThunk = () => async (dispatch, getState) => {
    newActivity(dispatch, "Loading", () => {
        return new Promise(async (resolve, reject) => {
            PostCall({
                api: '/safeAPI/getMFAData',
            }).then(async data => {
                debugLog(debugOn, data);
                if (data.status === 'ok') {
                    dispatch(MFALoaded({ mfa_qr: data.image_data, mfaEnabled: data.mfaEnabled }));
                    resolve();
                } else {
                    debugLog(debugOn, "getMFADataThunk failed: ", data.error);
                    reject(data.error);
                }
            }).catch(error => {
                debugLog(debugOn, "getMFADataThunk failed: ", error)
                reject("getMFADataThunk failed!");
            })
        });
    });
}

export const deleteExtraMFA =  ()=>{
    return new Promise((resolve, reject) => {
        PostCall({
            api: '/safeAPI/deleteExtraMFA',
        }).then(data => {
            debugLog(debugOn, data);
            if (data.status === 'ok') {
                resolve()
            } else {
                debugLog(debugOn, "woo... verifyMFASetupToken failed: ", data.error);
                reject()
            }
        }).catch(error => {
            debugLog(debugOn, "woo... verifyMFASetupToken failed.")
        });
    })
}

export const verifyMFASetupToken = (token)=>{
    return new Promise((resolve, reject) => {
        PostCall({
            api: '/safeAPI/verifyMFASetupToken',
            body: { token }
        }).then(data => {
            debugLog(debugOn, data);
            if (data.status === 'ok') {
                resolve();
            } else {
                debugLog(debugOn, "woo... verifyMFASetupToken failed: ", data.err);
                reject(data.err);
            }
        }).catch(error => {
            debugLog(debugOn, "woo... verifyMFASetupToken failed.")
        })
        
    })
}

export const verifyMFAToken = (token)=>{
    return new Promise((resolve, reject) => {
        PostCall({
            api: '/safeAPI/verifyMFAToken',
            body: { token }
        }).then(data => {
            debugLog(debugOn, data);
            if (data.status === 'ok') {
                resolve();
            } else {
                debugLog(debugOn, "woo... verifyMFAToken failed: ", data.err);
                reject(data.err);
            }
        }).catch(error => {
            debugLog(debugOn, "woo... verifyMFAToken failed.")
        })
        
    })
}

export const accountReducer = accountSlice.reducer;

export default accountSlice;


