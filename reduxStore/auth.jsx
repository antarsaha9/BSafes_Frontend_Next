import { createSlice, current } from '@reduxjs/toolkit';
const forge = require('node-forge');

import { debugLog, PostCall } from '../lib/helper'
import { calculateCredentials, saveLocalCredentials, decryptBinaryString, readLocalCredentials} from '../lib/crypto'
const debugOn = true;

const initialState = {
    memberId: null,
    displayName: null,
    isLoggedIn: false,
    expandedKey: null,
    publicKey: null,
    privateKey: null,
    searchKey: null,
    searchIV: null
}

const authSlice = createSlice({
    name: "auth",
    initialState: initialState,
    reducers: {
        loggedIn: (state, action) => {
            state.isLoggedIn = true;
            let credentials = readLocalCredentials(action.payload.sessionKey, action.payload.sessionIV);
            state.memberId = credentials.memberId;
            state.displayName = credentials.displayName;
            state.expandedKey = credentials.secret.expandedKey;
            state.publicKey = credentials.keyPack.publicKey;
            state.privateKey = credentials.secret.privateKey;
            state.searchKey = credentials.secret.searchKey;
            state.searchIV = credentials.secret.searchIV;
        },
        loggedOut: (state, action) => {
            state.isLoggedIn = false;
        }
    }
});

export const { loggedIn, loggedOut} = authSlice.actions;

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
                    return;
                }
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
                        } else {
                            debugLog(debugOn, "Error: ", data.error);
                        }
                    }).catch( error => {
                        debugLog(debugOn, "woo... failed to verify challenge.");
                    })
                } 
                    
                verifyChallenge();

            }).catch( error => {
                debugLog(debugOn, "woo... failed to login.")
            })
        }

}

export const logOutAsyncThunk = (data) => async (dispatch, getState) => {
    localStorage.clear();

    PostCall({
        api:'/memberAPI/logOut'
    }).then( data => {
        debugLog(debugOn, data);
        if(data.status === 'ok') {
            dispatch(loggedOut());
        } else {
            debugLog(debugOn, "woo... failed to log out: ", data.error)
        } 
    }).catch( error => {
        debugLog(debugOn, "woo... failed to log out.")
    })
}

export const preflightAsyncThunk = () => async (dispatch, getState) => {
    await new Promise(resolve => {

        PostCall({
            api:'/memberAPI/preflight'
        }).then( data => {
            debugLog(debugOn, data);
            if(data.status === 'ok') {
                dispatch(loggedIn({sessionKey: data.sessionKey, sessionIV: data.sessionIV}));
            } else {
                debugLog(debugOn, "woo... preflight failed: ", data.error)
            } 
        }).catch( error => {
            debugLog(debugOn, "woo... preflight failed.")
        })

    });
    
}


export const authReducer = authSlice.reducer;

export default authSlice;
