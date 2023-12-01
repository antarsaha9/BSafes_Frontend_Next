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
    braintreeClientToken: null,
    storageUsage: 0,
    totoalStorage50GBRequired: 0,
    nextDueTime:null,
    monthlyPrice: 0,
    dues: [],
    planOptions: null,
    transactions: [],
    mfa: null
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
        invoiceLoaded: (state, action) => {
            state.storageUsage = action.payload.storageUsage;
            state.totoalStorage50GBRequired = action.payload.totoalStorage50GBRequired;
            state.nextDueTime = action.payload.nextDueTime;
            state.monthlyPrice = action.payload.monthlyPrice;
            state.dues = action.payload.dues;
            state.planOptions = action.payload.planOptions;
        },
        transactionsLoaded: (state, action) => {
            state.transactions = action.payload.hits.map((transaction, i)=>{
                return transaction._source;
            })
        },
        MFALoaded: (state, action) => {
            state.mfa = action.payload;
        },
    }
});

export const {cleanAccountSlice, activityStart, activityDone, activityError, showApiActivity, hideApiActivity, incrementAPICount, setAccountState, clientTokenLoaded, invoiceLoaded, transactionsLoaded, MFALoaded} = accountSlice.actions;

const newActivity = async (dispatch, type, activity) => {
    dispatch(activityStart(type));
    try {
        await activity();
        dispatch(activityDone(type));
    } catch(error) {
        dispatch(activityError({type, error}));
    }
}

export const getMFADataThunk = () => async (dispatch, getState) => {
    newActivity(dispatch, accountActivity.GetMFAData, () => {
        return new Promise(async (resolve, reject) => {
            PostCall({
                api: '/memberAPI/getMFAData',
            }).then(async data => {
                debugLog(debugOn, data);
                if (data.status === 'ok') {
                    dispatch(MFALoaded({ otpAuthUrl: data.otpAuthUrl, mfaEnabled: data.mfaEnabled }));
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

export const verifyMFASetupTokenThunk = (data) => async (dispatch, getState) => {
    newActivity(dispatch, accountActivity.VerifyMFASetupToken, () => {
        return new Promise((resolve, reject) => {
            const token = data.token;
            PostCall({
                api: '/memberAPI/verifyMFASetupToken',
                body: { token }
            }).then(data => {
                debugLog(debugOn, data);
                if (data.status === 'ok') {
                    dispatch(MFALoaded({ mfaEnabled: true }));
                    resolve();
                } else {
                    debugLog(debugOn, "woo... verifyMFASetupToken failed: ", data.error);
                    reject(data.error);
                }
            }).catch(error => {
                debugLog(debugOn, "woo... verifyMFASetupToken failed.")
            })   
        })
    });
}

export const deleteMFAThunk = (data) => async (dispatch, getState) => {
    newActivity(dispatch, accountActivity.DeleteMFA, () => {
        return new Promise((resolve, reject) => {
            PostCall({
                api: '/memberAPI/deleteMFA',
            }).then(data => {
                debugLog(debugOn, data);
                if (data.status === 'ok') {
                    dispatch(MFALoaded({mfaEnabled: false}));
                    resolve()
                } else {
                    debugLog(debugOn, "woo... deleteMFA failed: ", data.error);
                    reject()
                }
            }).catch(error => {
                debugLog(debugOn, "woo... deleteMFA failed.")
            });
        })
    });
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
                    dispatch(invoiceLoaded(data.invoice));
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
                plan: data.plan,
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
                    const hits = data.hits.hits;
                    dispatch(transactionsLoaded({hits}))
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

 