import { createSlice } from '@reduxjs/toolkit';

const forge = require('node-forge');
const argon2 = require('argon2-browser');

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

export const verifyKeyHashAsync = (data) => async (dispatch, getState) => {
    newActivity(dispatch, "VerifyKeyHash", () => {
        return new Promise(async (resolve, reject) => {
        
            const goldenKey = data.key; 
            const state = getState().v1Account;
            const keySalt = forge.util.decode64(state.nextAuthStep.keySalt); 
            let expandedKey; 

            if(state.nextAuthStep.schemeVersion === '0') {
                expandedKey = forge.pkcs5.pbkdf2(goldenKey, keySalt, 10000, 32);
            } else {
                const result= await argon2.hash({
                    pass: goldenKey, 
                    salt: keySalt,
                    time: 2,
                    mem: 100 * 1024,
                    hashLen: 32,
                    parallelism: 2,
                    type: argon2.ArgonType.Argon2id
                })
                const expandedKeyHex = result.hashHex;
                expandedKey = forge.util.hexToBytes(expandedKeyHex); // ö¯¯ç?¤EíBñ]¸øä`âØálÈ%Ã7$
            }

            const md = forge.md.sha256.create();
            md.update(expandedKey);
            const keyHash = md.digest().toHex();
            PostCall({
                api:'/memberAPI/verifyKeyHash',
                body: {
                    keyHash
                },
            }).then( data => {
                debugLog(debugOn, data);
                if(data.status !== 'ok') {
                    debugLog(debugOn, "woo... failed to verify keyHash.")
                    reject('InvalidKeyHash');
                    return;
                }    
                
                dispatch(setNextAuthStep(data.nextStep)); 
                resolve();
            }).catch( error => {
                debugLog(debugOn, "verifyKeyHash failed: ", error)
                reject('InvalidKeyHash');
            })
        });
    });

}
export default v1AccountSlice;