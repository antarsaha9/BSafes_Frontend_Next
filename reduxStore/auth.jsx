import { createSlice } from '@reduxjs/toolkit';
const forge = require('node-forge');

import { debugLog, PostCall } from '../lib/helper'
import { calculateCredentials, saveLocalCredentials, decryptBinaryString, readLocalCredentials, clearLocalCredentials} from '../lib/crypto'
import { setNextAuthStep, setKeyMeta } from './v1AccountSlice';

const debugOn = true;

const initialState = {
    activity: "Done",
    error: null,
    contextId:null,
    preflightReady: false,
    localSessionState: null,
    MFAPassed: false,
    accountVersion:'',
    memberId: null,
    displayName: null,
    isLoggedIn: false,
    expandedKey: null,
    publicKey: null,
    privateKey: null,
    searchKey: null,
    searchIV: null,
    froalaLicenseKey: null
}

const authSlice = createSlice({
    name: "auth",
    initialState: initialState,
    reducers: {
        activityChanged: (state, action) => {
            state.activity = action.payload;
        },
        setContextId:(state, action) => {
            state.contextId = action.payload;
        },
        setPreflightReady: (state, action) => {
            state.preflightReady = action.payload;
        },
        setLocalSessionState: (state, action) => {
            state.localSessionState = action.payload;
        },
        loggedIn: (state, action) => {
            state.isLoggedIn = true;
            let credentials = readLocalCredentials(action.payload.sessionKey, action.payload.sessionIV);
            state.accountVersion = credentials.accountVersion;
            state.memberId = credentials.memberId;
            state.displayName = credentials.displayName;
            state.expandedKey = credentials.secret.expandedKey;
            state.publicKey = credentials.keyPack.publicKey;
            state.privateKey = credentials.secret.privateKey;
            state.searchKey = credentials.secret.searchKey;
            if(state.accountVersion === 'v2') {
                state.searchIV = credentials.secret.searchIV;
            }
            state.froalaLicenseKey = action.payload.froalaLicenseKey;
        },
        loggedOut: (state, action) => {
            state.isLoggedIn = false;
            state.expandedKey = null;
            state.publicKey = null;
            state.privateKey = null;
            state.searchKey = null;
            state.searchIV = null;
            state.froalaLicenseKey = null;
        },
        setAccountVersion: (state, action) => {
            state.accountVersion = action.payload;
        }
    }
});

export const {activityChanged, setContextId, setPreflightReady, setLocalSessionState, loggedIn, loggedOut, setAccountVersion} = authSlice.actions;

const newActivity = async (dispatch, type, activity) => {
    dispatch(activityChanged(type));
    try {
        await activity();
        dispatch(activityChanged("Done"));
    } catch(error) {
        if(error === "Aborted") return;
        dispatch(activityChanged("Error"));
    }
}

export const keySetupAsyncThunk = (data) => async (dispatch, getState) => {

    const credentials = await calculateCredentials(data.nickname, data.keyPassword);
    
    if(credentials) {
        debugLog(debugOn, "credentials: ", credentials);

        PostCall({
            api:'/keySetup',
            body: credentials.keyPack,
        }).then( data => {
            debugLog(debugOn, data);
            if(data.status === 'ok') {
                localStorage.setItem("authToken", data.authToken);
                credentials.memberId = data.memberId;
                credentials.displayName = data.displayName;
                saveLocalCredentials(credentials, data.sessionKey, data.sessionIV);
                
                dispatch(loggedIn({sessionKey: data.sessionKey, sessionIV: data.sessionIV}));
            } else {
                debugLog(debugOn, "woo... failed to create an account:", data.error);
            }
        }).catch( error => {
            debugLog(debugOn, "woo... failed to create an account.")
        })
    }

}

export const logInAsyncThunk = (data) => async (dispatch, getState) => {
    newActivity(dispatch, "LoggingIn", () => {
        return new Promise(async (resolve, reject) => {
            const credentials = await calculateCredentials(data.nickname, data.keyPassword, true);
            if(credentials) {
                debugLog(debugOn, "credentials: ", credentials);
    
                PostCall({
                    api:'/logIn',
                    body: credentials.keyPack,
                }).then( data => {
                    debugLog(debugOn, data);
                    if(data.status !== 'ok') {
                        debugLog(debugOn, "woo... failed to login.")
                        reject();
                        return;
                    }

                    localStorage.setItem("authToken", data.authToken);

                    credentials.keyPack.privateKeyEnvelope = data.privateKeyEnvelope;
                    credentials.keyPack.searchKeyEnvelope = data.searchKeyEnvelope;
                    credentials.keyPack.searchIVEnvelope = data.searchIVEnvelope;
                    credentials.keyPack.publicKey = data.publicKey;
    
                    function verifyChallenge() {
                        let randomMessage = data.randomMessage;
                        randomMessage = forge.util.encode64(randomMessage);
                        
                        let privateKey = forge.util.decode64(data.privateKeyEnvelope);
                        privateKey = decryptBinaryString(privateKey, credentials.secret.expandedKey);
                        const pki = forge.pki;
                        let privateKeyFromPem = pki.privateKeyFromPem(privateKey);
                        const md = forge.md.sha1.create();
                        md.update(randomMessage, 'utf8');
                        let signature = privateKeyFromPem.sign(md);
                        signature = forge.util.encode64(signature);
    
    
                        PostCall({
                            api:'/memberAPI/verifyChallenge',
                            body: { signature },
                        }).then( data => {
                            if(data.status == "ok") {
                                debugLog(debugOn, "Logged in.");
                                credentials.memberId = data.memberId;
                                credentials.displayName = data.displayName;
                                saveLocalCredentials(credentials, data.sessionKey, data.sessionIV);
                                
                                dispatch(loggedIn({sessionKey: data.sessionKey, sessionIV: data.sessionIV}));
                                resolve();
                            } else {
                                debugLog(debugOn, "Error: ", data.error);
                                reject(error);
                            }
                        }).catch( error => {
                            debugLog(debugOn, "woo... failed to verify challenge.");
                            reject(error);
                        })
                    } 
                        
                    verifyChallenge();
    
                }).catch( error => {
                    debugLog(debugOn, "woo... failed to login.")
                    reject(error);
                })
            }
        })
    });
}

export const logOutAsyncThunk = (data) => async (dispatch, getState) => {
    newActivity(dispatch, "LoggingOut", () => {
        return new Promise(async (resolve, reject) => {
            localStorage.clear();
            dispatch(loggedOut());
            PostCall({
                api:'/memberAPI/logOut'
            }).then( data => {
                debugLog(debugOn, data);
                if(data.status === 'ok') {
                    resolve();
                } else {
                    debugLog(debugOn, "woo... failed to log out: ", data.error)
                    reject();
                } 
            }).catch( error => {
                debugLog(debugOn, "woo... failed to log out.")
                reject();
            })
            
        });
    });
}

export const preflightAsyncThunk = () => async (dispatch, getState) => {
    await new Promise(resolve => {
        const auth = getState().auth;
        dispatch(setNextAuthStep(null));
        PostCall({
            api:'/memberAPI/preflight'
        }).then( data => {
            debugLog(debugOn, data);
            if(data.status === 'ok') {
                if(data.nextStep) {
                    if(data.nextStep.keyMeta){
                        dispatch(setKeyMeta(data.nextStep.keyMeta));
                    }
                    if(data.idleTimeout) {
                        if(auth.accountVersion === 'v1'){
                            clearLocalCredentials('v1');
                        } else {
                            localStorage.clear();
                            dispatch(loggedOut());
                        }
                    } 
                    dispatch(setNextAuthStep(data.nextStep))
                } else {
                    dispatch(loggedIn({sessionKey: data.sessionKey, sessionIV: data.sessionIV, froalaLicenseKey:data.froalaLicenseKey}));
                }
            } else { 
                if(data.error === 'SessionNotExisted'){
                    localStorage.clear();
                    dispatch(loggedOut);
                }
            } 
            dispatch(setPreflightReady(true));
        }).catch( error => {
            debugLog(debugOn, "woo... preflight failed.")
        })

    });
    
}

export const createCheckSessionIntervalThunk = () => (dispatch, getState) => {
    const checkLocalSession = () => {
        const authToken = localStorage.getItem('authToken');
        const encodedGold = localStorage.getItem("encodedGold");
        const MFAPassed = localStorage.getItem("MFAPassed");
        return {sessionExists:authToken?true:false, MFAPassed:MFAPassed?true:false, unlocked:encodedGold?true:false};
    } 
    const state = getState().auth;
    let contextId = state.contextId;
    if(!contextId){
        contextId = Date.now();
        dispatch(setContextId(contextId));
    }
    const intervalId =  `checkSessionStateInterval-${contextId}`;
    let checkSessionStateInterval = localStorage.getItem(intervalId);
    
    if(!checkSessionStateInterval) {
        const thisInterval = setInterval(()=>{
            //debugLog(debugOn, "Check session state");
            const state = checkLocalSession();
            dispatch(setLocalSessionState(state));
        }, 1000);
        localStorage.setItem(intervalId, thisInterval)
        debugLog(debugOn, "Creating new timer: ", thisInterval)
    }
}

export const authReducer = authSlice.reducer;

export default authSlice;
