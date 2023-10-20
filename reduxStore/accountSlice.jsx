import { createSlice } from '@reduxjs/toolkit';

import { debugLog, PostCall } from '../lib/helper'
import { accountActivity } from '../lib/activities';

const debugOn = true;

const initialState = {
    activity: 0,  
    activityErrors: 0,
    activityErrorMessages: {},
    accountState: null,
    apiCount: 0,
    braintreeClientToken: null
}

const accountSlice = createSlice({
    name: "account",
    initialState: initialState,
    reducers: {
        cleanAccountSlice: (state, action) => {
            const stateKeys = Object.keys(initialState);
            for(let i=0; i<stateKeys.length; i++) {
                let key = stateKeys[i];
                state[key] = initialState[key];
            }
        },
        activityStart: (state, action) => {
            state.activityErrors &= ~action.payload;
            state.activityErrorMessages[action.payload]='';
            state.activity |= action.payload;
        },
        activityDone: (state, action) => {
            state.activity &= ~action.payload;
        },
        activityError: (state, action) => {
            state.activity &= ~action.payload.type;
            state.activityErrors |= action.payload.type;
            state.activityErrorMessages[action.payload.type] = action.payload.error;
        },
        showApiActivity: (state, action) => {
            state.activity |= accountActivity.apiCall;
        },
        hideApiActivity: (state, action) => {
            state.activity &= ~accountActivity.apiCall;
        },
        incrementAPICount: (state, action) => {
            state.apiCount ++;
        },
        setAccountState: (state, action) => {
            state.accountState = action.payload;
        },
        clientTokenLoaded: (state, action) => {
            state.braintreeClientToken = action.payload.clientToken;
        },
    }
});

export const {cleanAccountSlice, activityStart, activityDone, activityError, showApiActivity, hideApiActivity, incrementAPICount, setAccountState, clientTokenLoaded}  = accountSlice.actions;

const newActivity = async (dispatch, type, activity) => {
    dispatch(activityStart(type));
    try {
        await activity();
        dispatch(activityDone(type));
    } catch(error) {
        dispatch(activityError({type, error}));
    }
}

export const getInvoiceThunk = () => async (dispatch, getState) => {
    newActivity(dispatch, accountActivity.getInvoice, () => {
        return new Promise(async (resolve, reject) => {
            PostCall({
                api: '/memberAPI/getInvoice',
            }).then(async data => {
                debugLog(debugOn, data);
                if (data.status === 'ok') {
                    debugLog(debugOn, "getInvoiceThunk ok. ");
                    resolve();
                } else {
                    debugLog(debugOn, "getInvoiceThunk failed: ", data.error);
                    reject("getInvoiceThunk failed.");
                }
            }).catch(error => {
                debugLog(debugOn, "getInvoiceThunk failed: ", error)
                reject("getInvoiceThunk failed!");
            })
        });
    });
}

export const getPaymentClientTokenThunk = () => async (dispatch, getState) => {
    newActivity(dispatch, accountActivity.getBraintreeClientToken, () => {
        return new Promise(async (resolve, reject) => {
            PostCall({
                api: '/memberAPI/getBraintreeClientToken',
            }).then(async data => {
                debugLog(debugOn, data);
                if (data.status === 'ok') {
                    dispatch(clientTokenLoaded({ clientToken: data.clientToken }));
                    resolve();
                } else {
                    debugLog(debugOn, "getPaymentClientTokenThunk failed: ", data.error);
                    reject("getPaymentClientTokenThunk failed.");
                }
            }).catch(error => {
                debugLog(debugOn, "getPaymentClientTokenThunk failed: ", error)
                reject("getPaymentClientTokenThunk failed!");
            })
        });
    });
}

export const payThunk = (data) => async (dispatch, getState) => {
    newActivity(dispatch, accountActivity.pay, () => {
        return new Promise(async (resolve, reject) => {
        PostCall({
            api: '/memberAPI/pay',
            body: {
                paymentMethodNonce: data.paymentMethodNonce
            }
        }).then(async data => {
            debugLog(debugOn, data);
            if (data.status === 'ok') {
                resolve();
            } else {
                debugLog(debugOn, "payThunk failed: ", data.error);
                reject("payThunk failed.");
            }
        }).catch(error => {
            debugLog(debugOn, "subscribe failed: ", error)
            reject("payThunk failed!");
        })
        });
    });
}

export const getTransactionsThunk = () => async (dispatch, getState) => {
    newActivity(dispatch, accountActivity.getTransactions, () => {
        return new Promise(async (resolve, reject) => {
            PostCall({
                api: '/memberAPI/getTransactions',
            }).then(async data => {
                debugLog(debugOn, data);
                if (data.status === 'ok') {
                    debugLog(debugOn, "getTransactionsThunk ok. ");
                    resolve();
                } else {
                    debugLog(debugOn, "getTransactionsThunk failed: ", data.error);
                    reject("getTransactionsThunk failed.");
                }
            }).catch(error => {
                debugLog(debugOn, "getTransactionsThunk failed: ", error)
                reject("getTransactionsThunk failed!");
            })
        });
    });
}
export const accountReducer = accountSlice.reducer;

export default accountSlice;

 