import { createSlice } from '@reduxjs/toolkit';
const forge = require('node-forge');

import { debugLog, PostCall, getTimeZoneOffset } from '../lib/helper'
import { calculateCredentials, saveLocalCredentials, createAccountRecoveryCode, decryptBinaryString, readLocalCredentials, clearLocalCredentials} from '../lib/crypto'
import { authActivity } from '../lib/activities';

import { cleanAccountSlice, setNewAccountCreated, setAccountState } from './accountSlice';
import { cleanV1AccountSlice, setNextAuthStep, setKeyMeta } from './v1AccountSlice';
import { cleanContainerSlice } from './containerSlice';
import { cleanPageSlice } from './pageSlice';
import { cleanTeamSlice } from './teamSlice';

const debugOn = false;

const initialState = {
    activity: 0,  
    activityErrors: 0,
    activityErrorCodes: {},
    error: null,
    contextId:null,
    challengeState: false,
    preflightReady: false,
    localSessionState: null,
    accountVersion:'',
    memberId: null,
    displayName: null,
    isLoggedIn: false,
    keySalt: null,
    expandedKey: null,
    publicKey: null,
    privateKey: null,
    searchKey: null,
    searchIV: null,
    clientEncryptionKey: null,
    froalaLicenseKey: null,
    stripePublishableKey: null,
    v2NextAuthStep: null,
    mfa: null
}

const authSlice = createSlice({
    name: "auth",
    initialState: initialState,
    reducers: {
        cleanAuthSlice: (state, action) => {
            const stateKeys = Object.keys(initialState);
            for(let i=0; i<stateKeys.length; i++) {
                let key = stateKeys[i];
                state[key] = initialState[key];
            }
        },
        activityStart: (state, action) => {
            state.activityErrors &= ~action.payload;
            state.activityErrorCodes[action.payload]='';
            state.activity |= action.payload;
        },
        activityDone: (state, action) => {
            state.activity &= ~action.payload;
        },
        activityError: (state, action) => {
            state.activity &= ~action.payload.type;
            state.activityErrors |= action.payload.type;
            state.activityErrorCodes[action.payload.type] = action.payload.error;
        },
        setContextId:(state, action) => {
            state.contextId = action.payload;
        },
        setChallengeState: (state, action) => {
            state.challengeState = action.payload;
        },
        setPreflightReady: (state, action) => {
            state.preflightReady = action.payload;
        },
        setLocalSessionState: (state, action) => {
            state.localSessionState = action.payload;
        },
        setDisplayName: (state, action) => {
            state.displayName = action.payload;
        },
        loggedIn: (state, action) => {   
            let credentials = readLocalCredentials(action.payload.sessionKey, action.payload.sessionIV);
            if(!credentials) return;
            state.activityErrors = 0;
            state.activityErrorCodes = {};
            state.isLoggedIn = true;
            state.accountVersion = credentials.accountVersion;
            state.memberId = credentials.memberId;
            state.displayName = credentials.displayName;
            state.keySalt = credentials.secret.keySalt;
            state.expandedKey = credentials.secret.expandedKey;
            state.publicKey = credentials.keyPack.publicKey;
            state.privateKey = credentials.secret.privateKey;
            state.searchKey = credentials.secret.searchKey;
            if(state.accountVersion === 'v2') {
                state.searchIV = credentials.secret.searchIV;
            }
            state.froalaLicenseKey = action.payload.froalaLicenseKey;
            state.stripePublishableKey = action.payload.stripePublishableKey;
        },
        loggedOut: (state, action) => {
            state.isLoggedIn = false;
            state.expandedKey = null;
            state.publicKey = null;
            state.privateKey = null;
            state.searchKey = null;
            state.searchIV = null;
            state.froalaLicenseKey = null;
            state.stripePublishableKey = null;
        },
        setAccountVersion: (state, action) => {
            state.accountVersion = action.payload;
        },
        setV2NextAuthStep: (state, action) => {
            state.v2NextAuthStep = action.payload;
        },
        setClientEncryptionKey: (state, action) => {
            state.clientEncryptionKey = action.payload;
        },
        setMfa: (state, action) => {
            state.mfa = action.payload;
        }
    }
});

export const {cleanAuthSlice, activityStart, activityDone, activityError, setContextId, setChallengeState, setPreflightReady, setLocalSessionState, setDisplayName, loggedIn, loggedOut, setAccountVersion, setV2NextAuthStep, setClientEncryptionKey, setMfa} = authSlice.actions;

const newActivity = async (dispatch, type, activity) => {
    dispatch(activityStart(type));
    try {
        await activity();
        dispatch(activityDone(type));
    } catch(error) {
        dispatch(activityError({type, error}));
    }
}
export const keySetupAsyncThunk = (data) => async (dispatch, getState) => {
    newActivity(dispatch, authActivity.KeySetup, () => {
        return new Promise(async (resolve, reject) => {
            const credentials = await calculateCredentials(data.nickname, data.keyPassword);
            const nickname = data.nickname;
            const keyPassword = data.keyPassword;
            if(credentials) {
                debugLog(debugOn, "credentials: ", credentials);
                const myTimeZoneOffset = getTimeZoneOffset(Intl.DateTimeFormat().resolvedOptions().timeZone);
                PostCall({
                    api:'/keySetup',
                    body: {...credentials.keyPack, myTimeZoneOffset},
                    dispatch
                }).then( data => {
                    debugLog(debugOn, data);
                    if(data.status === 'ok') {
                        let auth = getState().auth;
                        const accountRecoveryPhrase = createAccountRecoveryCode(nickname, keyPassword, auth.clientEncryptionKey);
                        localStorage.setItem("authToken", data.authToken);
                        credentials.memberId = data.memberId;
                        credentials.displayName = data.displayName;
                        saveLocalCredentials(credentials, data.sessionKey, data.sessionIV);      
                        localStorage.setItem("authState", "Unlocked"); 
                        dispatch(setNewAccountCreated({accountRecoveryPhrase}));
                        dispatch(setAccountVersion('v2'));
                        dispatch(loggedIn({sessionKey: data.sessionKey, sessionIV: data.sessionIV}));
                        resolve();
                    } else {
                        debugLog(debugOn, "woo... failed to create an account:", data.error);
                        reject("10");
                    }
                }).catch( error => {
                    debugLog(debugOn, "woo... failed to create an account.")
                    reject("12");
                })
            }
        });
    });
}

export const logInAsyncThunk = (data) => async (dispatch, getState) => {
    newActivity(dispatch, authActivity.LogIn, () => {
        return new Promise(async (resolve, reject) => {
            const credentials = await calculateCredentials(data.nickname, data.keyPassword, true);
            if(credentials) {
                debugLog(debugOn, "credentials: ", credentials);
    
                PostCall({
                    api:'/logIn',
                    body: credentials.keyPack,
                    dispatch
                }).then( data => {
                    debugLog(debugOn, data);
                    if(data.status !== 'ok') {
                        debugLog(debugOn, "woo... failed to login.")
                        reject("102");
                        return;
                    }
                    dispatch(setChallengeState(true));
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
                            dispatch
                        }).then( data => {

                            if(data.status == "ok") {
                                credentials.memberId = data.memberId;
                                credentials.displayName = data.displayName;
                                dispatch(setAccountVersion('v2'));
                                if(data.nextStep) {
                                    saveLocalCredentials(credentials, data.sessionKey, data.sessionIV);
                                    localStorage.setItem("authState", data.nextStep.step);      
                                    dispatch(setV2NextAuthStep(data.nextStep));
                                    resolve();
                                } else {
                                    saveLocalCredentials(credentials, data.sessionKey, data.sessionIV);
                                    debugLog(debugOn, "Logged in.");
                                    localStorage.setItem("authState", "Unlocked");  
                                    dispatch(loggedIn({sessionKey: data.sessionKey, sessionIV: data.sessionIV}));
                                    debugLog(debugOn, "loggedIn dispatched.");
                                    resolve();                       
                                }
                            } else {
                                debugLog(debugOn, "Error: ", data.error);
                                reject("104");
                            }
                        }).catch( error => {
                            debugLog(debugOn, "woo... failed to verify challenge.");
                            reject("106");
                        }).finally(()=>{
                            dispatch(setChallengeState(false));
                            debugLog(debugOn, "setChallengeState(false)");
                        })
                        
                    } 
                        
                    verifyChallenge();
    
                }).catch( error => {
                    debugLog(debugOn, "woo... failed to login.")
                    reject("108");
                })
            }
        })
    });
}

export const verifyMFATokenThunk = (data) => async (dispatch, getState) => {
    newActivity(dispatch, authActivity.VerifyMFAToken, () => {
        return new Promise((resolve, reject) => {
            const token = data.token;
            PostCall({
                api: '/memberAPI/verifyMFAToken',
                body: { token }
            }).then(data => {
                debugLog(debugOn, data);
                if (data.status === 'ok') {
                    debugLog(debugOn, "Logged in.");
                    localStorage.setItem("authState", "Unlocked");
                    resolve();
                    dispatch(loggedIn({sessionKey: data.sessionKey, sessionIV: data.sessionIV}));
                    debugLog(debugOn, "loggedIn dispatched.");
                } else {
                    debugLog(debugOn, "woo... verifyMFAToken failed: ", data.error);
                    dispatch(setMfa({passed:false}));
                    reject("112");
                }
            }).catch(error => {
                debugLog(debugOn, "woo... verifyMFAToken failed.")
                reject("114");
            })   
        })
    });
}

export const recoverMFAThunk = (data) => async (dispatch, getState) => {
    newActivity(dispatch, authActivity.RecoverMFA, () => {
        return new Promise((resolve, reject) => {
            const recoveryWords = data.recoveryWords;
            PostCall({
                api: '/memberAPI/recoverMFA',
                body: { recoveryWords }
            }).then(data => {
                debugLog(debugOn, data);
                if (data.status === 'ok') {
                    debugLog(debugOn, "Logged in.");
                    localStorage.setItem("authState", "Unlocked");
                    resolve();
                    dispatch(loggedIn({sessionKey: data.sessionKey, sessionIV: data.sessionIV}));
                    debugLog(debugOn, "loggedIn dispatched.");
                } else {
                    debugLog(debugOn, "woo... recoverMFAThunk failed: ", data.error);
                    dispatch(setMfa({passed:false}));
                    reject(114);
                }
            }).catch(error => {
                debugLog(debugOn, "woo... recoverMFAThunk failed.")
                reject(data.error);
            })   
        })
    });
}

export const logOutAsyncThunk = (data) => async (dispatch, getState) => {
    newActivity(dispatch, authActivity.LogOut, () => {
        return new Promise(async (resolve, reject) => {
            
            PostCall({
                api:'/memberAPI/logOut',
                dispatch
            }).then( data => {
                debugLog(debugOn, data);
                if(data.status === 'ok') {
                    resolve();
                } else {
                    debugLog(debugOn, "woo... failed to log out: ", data.error)
                    reject("Failed to log out.");
                } 
            }).catch( error => {
                debugLog(debugOn, "woo... failed to log out.")
                reject("Failed to log out.");
            })
            localStorage.clear();
            dispatch(loggedOut());
            dispatch(cleanMemoryThunk());
            
        });
    });
}

export const preflightAsyncThunk = (data) => async (dispatch, getState) => {
    newActivity(dispatch, authActivity.Preflight, () => {
        return new Promise(async (resolve, reject) => {
            if(getState().auth.challengeState) return;
            dispatch(setNextAuthStep(null));
            const params = {
                api:'/memberAPI/preflight',
                dispatch
            };
            if(data && data.action) params.body= {action: data.action};
            PostCall(params).then( data => {
                debugLog(debugOn, data);
                if(data.status === 'ok') {
                    dispatch(setAccountVersion(data.accountVersion));
                    if(data.nextStep) {
                        localStorage.setItem("authState", data.nextStep.step);
                        if(data.nextStep.keyMeta){
                            dispatch(setDisplayName(data.nextStep.keyMeta.displayName));
                            dispatch(setKeyMeta(data.nextStep.keyMeta));
                        }
                        if(data.idleTimeout) {
                            if(data.accountVersion === 'v1'){
                                clearLocalCredentials('v1');
                            } else {
                                localStorage.clear();
                                dispatch(loggedOut());
                            
                            }
                            dispatch(setNextAuthStep(data.nextStep))
                        } 
                    } else {
                        dispatch(loggedIn({sessionKey: data.sessionKey, sessionIV: data.sessionIV, froalaLicenseKey:data.froalaLicenseKey, stripePublishableKey:data.stripePublishableKey}));
                        dispatch(setAccountState(data.accountState));
                    }
                } else { 
                    if(data.error === 'SessionNotExisted'){
                        localStorage.clear();
                        dispatch(loggedOut);
                    }
                } 
                dispatch(setClientEncryptionKey(data.clientEncryptionKey));
                dispatch(setPreflightReady(true));
                resolve();
            }).catch( error => {
                debugLog(debugOn, "woo... preflight failed.");
                dispatch(setPreflightReady(true));
                reject("110");
            })
        });
    });  
}

export const createCheckSessionIntervalThunk = () => (dispatch, getState) => {
    const checkLocalSession = () => {
        const authToken = localStorage.getItem('authToken');
        const encodedGold = localStorage.getItem("encodedGold");
        const authState = localStorage.getItem("authState");
        return {sessionExists:authToken?true:false, authState, unlocked:(authState === 'Unlocked')};
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
            //debugLog(debugOn, "Check session state");.
            const state = checkLocalSession();
            dispatch(setLocalSessionState(state));
        }, 1000);
        localStorage.setItem(intervalId, thisInterval)
        debugLog(debugOn, "Creating new timer: ", thisInterval)
    }
}

export const cleanMemoryThunk = () => (dispatch, getState) => {
    dispatch(cleanAccountSlice());
    dispatch(cleanAuthSlice());
    dispatch(cleanContainerSlice());
    dispatch(cleanPageSlice());
    dispatch(cleanTeamSlice());
    dispatch(cleanV1AccountSlice());
}

export const authReducer = authSlice.reducer;

export default authSlice;
