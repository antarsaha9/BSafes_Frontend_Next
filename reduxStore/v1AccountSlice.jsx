import { createSlice } from '@reduxjs/toolkit';

import { debugLog, PostCall } from '../lib/helper'

const debugOn = true;

const initialState = {
    activity: "Done",
    masterId: "",
    displayMasterId: "",
    nextAuthStep: null
}

const v1AccountSlice = createSlice({
    name: "v1Account",
    initialState: initialState,
    reducers: {
        activityChanged: (state, action) => {
            state.activity = action.payload;
        },
        nicknameResolved: (state, action) => {
            state.masterId = action.payload.masterId;
            state.displayMasterId = action.payload.displayMasterId;
        },
        setNextAuthStep: (state, action) => {
            state.nextAuthStep = action.payload;
        }
    }
});

export const { activityChanged, nicknameResolved, setNextAuthStep } = v1AccountSlice.actions;

const newActivity = async (dispatch, type, activity) => {
    dispatch(activityChanged(type));
    try {
        await activity();
        dispatch(activityChanged("Done"));
    } catch(error) {
        if(error === "Aborted") return;
        dispatch(activityChanged(error));
    }
}

export const v1AccountReducer = v1AccountSlice.reducer;

export const nicknameSignInAsyncThunk = (data) => async (dispatch, getState) => {
    newActivity(dispatch, "NicknameSignIn", () => {
        return new Promise(async (resolve, reject) => {
            const nickname = data.nickname;
            PostCall({
                api:'/nicknameSignIn',
                body: {nickname},
            }).then( data => {
                debugLog(debugOn, data);
                if(data.status !== 'ok') {
                    debugLog(debugOn, "woo... failed to resolve nickname.")
                    reject("NicknameSignInError");
                    return;
                }    
                const masterId = data.masterId;
                const displayMasterId = data.displayMasterId;
                dispatch(nicknameResolved({masterId, displayMasterId}));
                resolve();
            }).catch( error => {
                debugLog(debugOn, "nicknameSignIn failed: ", error)
                reject("NicknameSignInError");
            })
        });s
    })
}

export const authenticateManagedMemberAsyncThunk = (data) => async (dispatch, getState) => {
    newActivity(dispatch, "AuthenticateManagedMember", () => {
        return new Promise(async (resolve, reject) => {
            const masterId = data.masterId;
            const memberName = data.memberName;
            const password = data.password;

            const username = 'm' + ':' + masterId + ':' + memberName;

            PostCall({
                api:'/authenticateManagedMember',
                body: {
                    masterId,
                    username,
                    password
                },
            }).then( data => {
                debugLog(debugOn, data);
                if(data.status !== 'ok') {
                    debugLog(debugOn, "woo... failed to login.")
                    reject('InvalidMember');
                    return;
                }    
                
                localStorage.setItem("authToken", data.authToken);
                dispatch(setNextAuthStep(data.nextStep)); 
                resolve();
            }).catch( error => {
                debugLog(debugOn, "AuthenticateManagedMember failed: ", error)
                reject('InvalidMember');
            })
        });
    });
}

export const verifyMFAAsyncThunk = (data) => async (dispatch, getState) => {
    newActivity(dispatch, "VerifyMFA", () => {
        return new Promise(async (resolve, reject) => {
            const token = data.MFAToken;

            PostCall({
                api:'/verifyMFAToken',
                body: {
                    token
                },
            }).then( data => {
                debugLog(debugOn, data);
                if(data.status !== 'ok') {
                    debugLog(debugOn, "woo... failed to verify MFA.")
                    reject('InvalidMFA');
                    return;
                }    
                
                dispatch(setNextAuthStep(data.nextStep)); 
                resolve();
            }).catch( error => {
                debugLog(debugOn, "verifyMFAToken failed: ", error)
                reject('InvalidMFA');
            })
        })
    });
}

export default v1AccountSlice;