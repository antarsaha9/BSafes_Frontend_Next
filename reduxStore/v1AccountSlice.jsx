import { createSlice } from '@reduxjs/toolkit';

const forge = require('node-forge');
const argon2 = require('argon2-browser');

import { debugLog, PostCall } from '../lib/helper'
import { decryptBinaryString, saveLocalCredentials, clearLocalCredentials } from '../lib/crypto';

import { loggedIn, loggedOut } from './auth';
import { nextSaturday } from 'date-fns';

const debugOn = true;

const initialState = {
    activity: "Done",
    nickname: "",
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
            state.nickname = action.payload.nickname;
            state.masterId = action.payload.masterId;
            state.displayMasterId = action.payload.displayMasterId;
        },
        setNextAuthStep: (state, action) => {
            state.nextAuthStep = action.payload;
        },
        signedOut: (state, action) => {
            const stateKeys = Object.keys(initialState);
            for(let i=0; i<stateKeys.length; i++) {
                let key = stateKeys[i];
                state[key] = initialState[key];
            }
        }
    }
});

export const { activityChanged, nicknameResolved, setNextAuthStep, signedOut } = v1AccountSlice.actions;

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
                debugLog(debugOn, "nickname resolved.")
                dispatch(nicknameResolved({nickname, masterId, displayMasterId}));
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

export const verifyKeyHashAsyncThunk = (data) => async (dispatch, getState) => {
    newActivity(dispatch, "VerifyKeyHash", () => {
        return new Promise(async (resolve, reject) => {
            const credentials = {
                secret:{},
                keyPack:{}
            };
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
                expandedKey = forge.util.hexToBytes(expandedKeyHex); 
            }
            credentials.secret.expandedKey = expandedKey;

            const md = forge.md.sha256.create();
            md.update(expandedKey);
            const keyHash = md.digest().toHex();
            PostCall({
                api:'/memberAPI/verifyV1KeyHash',
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
                
                function verifyV1Challenge() {
                    let randomMessage = data.randomMessage;
                    randomMessage = forge.util.encode64(randomMessage);
                    
                    credentials.keyPack.publicKey = forge.util.encode64(data.publicKey);
                    credentials.keyPack.privateKeyEnvelope = data.privateKeyEnvelope;
                    credentials.keyPack.envelopeIV = data.envelopeIV;
                    credentials.keyPack.searchKeyEnvelope = data.searchKeyEnvelope;
                    credentials.keyPack.searchKeyIV = data.searchKeyIV;

                    const envelopeIV = forge.util.decode64(data.envelopeIV);
                    let privateKey = forge.util.decode64(data.privateKeyEnvelope);
                    privateKey = decryptBinaryString(privateKey, expandedKey, envelopeIV);
                    
                    const pki = forge.pki;
                    const privateKeyFromPem = pki.privateKeyFromPem(privateKey);
                    const md = forge.md.sha1.create();
                    md.update(randomMessage, 'utf8');
                    let signature = privateKeyFromPem.sign(md);
                    signature = forge.util.encode64(signature);

                    PostCall({
                        api:'/memberAPI/verifyV1Challenge',
                        body: { signature },
                    }).then( data => {
                        if(data.status == "ok") {  
                            credentials.memberId = data.memberId;
                            credentials.displayName = data.displayName;
                            
                            saveLocalCredentials(credentials, data.sessionKey, data.sessionIV, 'v1');
                            dispatch(setNextAuthStep(null));
                            dispatch(loggedIn({sessionKey: data.sessionKey, sessionIV: data.sessionIV}))
                            resolve();
                        } else {
                            debugLog(debugOn, "woo... failed to verify challenge: ", data.error);
                            reject("FailedChallenge");
                        }
                    }).catch( error => {
                        debugLog(debugOn, "woo... failed to verify challenge.");
                        reject("FailedChallenge");
                    })
                } 
                    
                verifyV1Challenge();
            }).catch( error => {
                debugLog(debugOn, "verifyKeyHash failed: ", error)
                reject('InvalidKeyHash');
            })
        });
    });

}

export const lockAsyncThunk = (data) => async (dispatch, getState) => {
    newActivity(dispatch, "Lock", () => {
        return new Promise(async (resolve, reject) => {
            clearLocalCredentials('v1');
            dispatch(loggedOut());
            PostCall({
                api:'/memberAPI/lock'
            }).then( data => {
                if(data.status !== 'ok') {
                    debugLog(debugOn, "woo... failed to lock.")
                    reject('LockFailed');
                    return;
                }    
                
                dispatch(setNextAuthStep(data.nextStep));
                resolve();
            }).catch( error => {
                debugLog(debugOn, "lock failed: ", error)
                reject('LockFailed');
            }) 
        })
    })
}

export const signOutAsyncThunk = (data) => async (dispatch, getState) => {
    newActivity(dispatch, "SignOut", () => {
        return new Promise(async (resolve, reject) => {
            const nickname = getState().v1Account.nickname;

            localStorage.clear();
            dispatch(signedOut());
            dispatch(loggedOut());

            PostCall({
                api:'/memberAPI/signOut'
            }).then( data => {
                if(data.status !== 'ok') {
                    debugLog(debugOn, "woo... failed to signout.")
                    reject('SignOutFailed');
                    return;
                }    

                const nextStep = {
                    step: 'SignIn',
                    nickname
                }
                dispatch(setNextAuthStep(nextStep));
                resolve();
            }).catch( error => {
                debugLog(debugOn, "lock failed: ", error)
                reject('LockFailed');
            }) 
        })
    })
}

export default v1AccountSlice;