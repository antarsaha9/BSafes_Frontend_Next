import { createSlice } from '@reduxjs/toolkit';

import { debugLog, PostCall, getTimeZoneOffset } from '../lib/helper'
import { accountActivity } from '../lib/activities';

const debugOn = true;
const minimumPaymentWaitingTime = 3000;

const initialState = {
    activity: 0,
    activityErrors: 0,
    activityErrorMessages: {},
    newAccountCreated: null,
    accountState: null,
    apiCount: 0,
    invoice: null,
    checkoutPlan: null,
    checkoutItem:null,
    transactions: [],
    accountHashVerified: null,
    mfa: null,
    dataCenterModal: false,
    currentDataCenter: null,
    dataCenters: null,
    nearestDataCenter: null,
    stripeClientSecret: null,
    lastPaymentIntentTime: null,
    appleClientSecret: null,
    androidClientSecret: null
}

const accountSlice = createSlice({
    name: "account",
    initialState: initialState,
    reducers: {
        cleanAccountSlice: (state, action) => {
            const stateKeys = Object.keys(initialState);
            for (let i = 0; i < stateKeys.length; i++) {
                let key = stateKeys[i];
                state[key] = initialState[key];
            }
        },
        resetAccountActivity: (state, action) => {
            state.activity = 0,
            state.activityErrors = 0,
            state.activityErrorCodes = { };
        },
        activityStart: (state, action) => {
            state.activityErrors &= ~action.payload;
            state.activityErrorMessages[action.payload] = '';
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
        setNewAccountCreated: (state, action) => {
            state.newAccountCreated = action.payload;
        },
        showApiActivity: (state, action) => {
            state.activity |= accountActivity.ApiCall;
        },
        hideApiActivity: (state, action) => {
            state.activity &= ~accountActivity.ApiCall;
        },
        incrementAPICount: (state, action) => {
            state.apiCount++;
        },
        setAccountState: (state, action) => {
            state.accountState = action.payload.accountState;
            state.nextDueTime = action.payload.nextDueTime;
        },
        invoiceLoaded: (state, action) => {
            state.invoice = action.payload;
        },
        setCheckoutPlan: (state, action) => {
            state.checkoutPlan = action.payload;
        },
        transactionsLoaded: (state, action) => {
            state.transactions = action.payload.hits.map((transaction, i) => {
                return transaction._source;
            })
        },
        setAccountHashVerified: (state, action) => {
            state.accountHashVerified = action.payload;
        },
        MFALoaded: (state, action) => {
            state.mfa = action.payload;
        },
        setDataCenterModal: (state, action) => {
            state.dataCenterModal = action.payload;
        },
        dataCentersLoaded: (state, action) => {
            state.currentDataCenter = action.payload.currentDataCenter;
            state.dataCenters = action.payload.dataCenters;
            state.nearestDataCenter = action.payload.nearestDataCenter;
        },
        setCurrentDataCenter: (state, action) => {
            state.currentDataCenter = action.payload;
        },
        setPaymentIntentData: (state, action) => {
            state.stripeClientSecret = action.payload.stripeClientSecret;
            state.checkoutItem = action.payload.checkoutItem;
        },
        setLastPaymentIntentTime: (state, action) => {
            state.lastPaymentIntentTime = action.payload;
        },
        setApplePaymentIntentData: (state, action) => {
            state.appleClientSecret = action.payload.appleClientSecret;
            state.checkoutItem = action.payload.checkoutItem;
        },
        clearAppleClientSecret: (state, action) => {
            state.appleClientSecret = null;
        },
        setAndroidPaymentIntentData: (state, action) => {
            state.androidClientSecret = action.payload.androidClientSecret;
            state.checkoutItem = action.payload.checkoutItem;
        },
        clearAndroidClientSecret: (state, action) => {
            state.androidClientSecret = null;
        }
    }
});

export const { cleanAccountSlice, resetAccountActivity, activityStart, activityDone, activityError, setNewAccountCreated, showApiActivity, hideApiActivity, incrementAPICount, setAccountState, invoiceLoaded, setCheckoutPlan, transactionsLoaded, setAccountHashVerified, setDataCenterModal, MFALoaded, dataCentersLoaded, setCurrentDataCenter, setPaymentIntentData, setLastPaymentIntentTime, setApplePaymentIntentData, clearAppleClientSecret, setAndroidPaymentIntentData, clearAndroidClientSecret } = accountSlice.actions;

const newActivity = async (dispatch, type, activity) => {
    dispatch(activityStart(type));
    try {
        await activity();
        dispatch(activityDone(type));
    } catch (error) {
        dispatch(activityError({ type, error }));
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
                    dispatch(MFALoaded({ otpAuthUrl: data.otpAuthUrl, key:data.key, mfaEnabled: data.mfaEnabled }));
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

export const verifyAccountHashThunk = (data) => async (dispatch, getState) => {
    newActivity(dispatch, accountActivity.VerifyAccountHash, () => {
        return new Promise((resolve, reject) => {
            const accountHash = data.accountHash;
            PostCall({
                api: '/memberAPI/verifyAccountHash',
                body: { accountHash }
            }).then(data => {
                debugLog(debugOn, data);
                if (data.status === 'ok') {
                    dispatch(setAccountHashVerified({ verified: true, accountHash }));
                    resolve();
                } else {
                    dispatch(setAccountHashVerified({ verified: false }));
                    debugLog(debugOn, "woo... verifyAccountHash failed: ", data.error);
                    reject(data.error);
                }
            }).catch(error => {
                debugLog(debugOn, "woo... verifyAccountHash failed.")
            })
        });
    })
}

export const verifyMFASetupTokenThunk = (data) => async (dispatch, getState) => {
    newActivity(dispatch, accountActivity.VerifyMFASetupToken, () => {
        return new Promise((resolve, reject) => {
            const token = data.token;
            const accountHash = data.accountHash;
            PostCall({
                api: '/memberAPI/verifyMFASetupToken',
                body: { token, accountHash }
            }).then(data => {
                debugLog(debugOn, data);
                if (data.status === 'ok') {
                    dispatch(MFALoaded({ mfaSetup: true, recoveryWords: data.recoveryWords, mfaEnabled: true }));
                    resolve();
                } else {
                    dispatch(MFALoaded({ mfaSetup: false, error: data.error }));
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
            const accountHash = data.accountHash;
            PostCall({
                api: '/memberAPI/deleteMFA',
                body: { accountHash }
            }).then(data => {
                debugLog(debugOn, data);
                if (data.status === 'ok') {
                    dispatch(MFALoaded({ mfaEnabled: false }));
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
    newActivity(dispatch, accountActivity.GetInvoice, () => {
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

export const getTransactionsThunk = () => async (dispatch, getState) => {
    newActivity(dispatch, accountActivity.GetTransactions, () => {
        return new Promise(async (resolve, reject) => {
            PostCall({
                api: '/memberAPI/getTransactions',
            }).then(async data => {
                debugLog(debugOn, data);
                if (data.status === 'ok') {
                    debugLog(debugOn, "getTransactionsThunk ok. ");
                    const hits = data.hits.hits;
                    dispatch(transactionsLoaded({ hits }))
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

export const getDataCentersThunk = (data) => async (dispatch, getState) => {
    newActivity(dispatch, accountActivity.GetDataCenters, () => {
        return new Promise(async (resolve, reject) => {
            const myTimeZoneOffset = getTimeZoneOffset(Intl.DateTimeFormat().resolvedOptions().timeZone);
            PostCall({
                api: '/memberAPI/getDataCenters',
                body: { myTimeZoneOffset }
            }).then(async data => {
                debugLog(debugOn, data);
                if (data.status === 'ok') {
                    dispatch(dataCentersLoaded({ currentDataCenter: data.currentDataCenter, dataCenters: data.dataCenters, nearestDataCenter: data.nearestDataCenter }));
                    resolve();
                } else {
                    debugLog(debugOn, "getDataCentersThunk failed: ", data.error);
                    reject(data.error);
                }
            }).catch(error => {
                debugLog(debugOn, "getDataCentersThunk failed: ", error)
                reject("getDataCentersThunk failed!");
            })
        });
    });
}
export const changeDataCenterThunk = (data) => async (dispatch, getState) => {
    newActivity(dispatch, accountActivity.ChangeDataCenter, () => {
        const dataCenter = data.dataCenter;
        return new Promise((resolve, reject) => {
            PostCall({
                api: '/memberAPI/changeDataCenter',
                body: { dataCenterId: data.dataCenter.id }
            }).then(data => {
                debugLog(debugOn, data);
                if (data.status === 'ok') {
                    dispatch(setCurrentDataCenter(dataCenter))
                    resolve();
                } else {
                    debugLog(debugOn, "woo... change data center failed: ", data.error);
                    reject();
                }
            }).catch(error => {
                debugLog(debugOn, "woo... change data center failed.", error)
            });
        })
    });
}

export const createPaymentIntentThunk = (data) => async (dispatch, getState) => {
    newActivity(dispatch, accountActivity.CreatePaymentIntent, () => {
        return new Promise((resolve, reject) => {
            const accountState = getState().account;
            const currentTime = Date.now();
            const timeDiff = currentTime - (accountState.lastPaymentIntentTime || 0);
            if(accountState.lastPaymentIntentTime && timeDiff <10000 ) {
                resolve();
                return;
            }
            dispatch(setLastPaymentIntentTime(currentTime));
            PostCall({
                api: '/memberAPI/createPaymentIntent',
                body: {
                    checkoutPlan:data.checkoutPlan
                }
            }).then(data => {
                debugLog(debugOn, data);
                if (data.status === 'ok') {
                    dispatch(setPaymentIntentData({stripeClientSecret: data.client_secret, checkoutItem:data.checkoutItem}));
                    resolve();
                } else {
                    debugLog(debugOn, "woo... create payment intent failed: ", data.error);
                    reject();
                }
            }).catch(error => {
                debugLog(debugOn, "woo... create payment intent failed.", error)
            });
        })
    });
}

export const paymentCompletedThunk = (data) => async (dispatch, getState) => {
    PostCall({
        api: '/memberAPI/paymentCompleted',
    }).then(data => {
        debugLog(debugOn, data);
        if (data.status === 'ok') {
            dispatch(setAccountState({accountState: data.accountState, nextDueTime: data.nextDueTime}));
            resolve();
        } else {
            debugLog(debugOn, "woo... payment completed failed: ", data.error);
            reject();
        }
    }).catch(error => {
        debugLog(debugOn, "woo... payment completed failed.", error)
    });
}

export const createApplePaymentIntentThunk = (data) => async (dispatch, getState) => {
    newActivity(dispatch, accountActivity.CreateApplePaymentIntent, () => {
        return new Promise((resolve, reject) => {
            const accountState = getState().account;
            const currentTime = Date.now();
            const timeDiff = currentTime - (accountState.lastPaymentIntentTime || 0);
            if(accountState.lastPaymentIntentTime && timeDiff < minimumPaymentWaitingTime ) {
                debugLog(debugOn, 'duplicated createApplePaymentIntentThunk')
                resolve();
                return;
            }
            dispatch(setLastPaymentIntentTime(currentTime));
            dispatch(setApplePaymentIntentData({appleClientSecret: null, checkoutItem:null}))
            PostCall({
                api: '/memberAPI/createApplePaymentIntent',
                body: {
                    checkoutPlan:data.checkoutPlan
                }
            }).then(data => {
                debugLog(debugOn, data);
                if (data.status === 'ok') {
                    dispatch(setApplePaymentIntentData({appleClientSecret: data.client_secret, checkoutItem:data.checkoutItem}));
                    resolve();
                } else {
                    debugLog(debugOn, "woo... create Apple payment intent failed: ", data.error);
                    reject();
                }
            }).catch(error => {
                debugLog(debugOn, "woo... create Apple payment intent failed.", error)
            });
        })
    });
}

export const reportAnAppleTransactionThunk = (data) => async (dispatch, getState) => {
    newActivity(dispatch, accountActivity.ReportAnAppleTransaction, () => {
        return new Promise((resolve, reject) => {
            debugLog(debugOn, "reportAnAppleTransactionThunk, transaction: ", data.transaction)
            const reportAnAppleTransactionCallback = data.callback;
            PostCall({
                api: '/memberAPI/reportAnAppleTransaction',
                body: {
                    transaction: data.transaction
                }
            }).then(data => {
                debugLog(debugOn, 'reportAnAppleTransaction: ', data);
                if (data.status === 'ok') {
                    reportAnAppleTransactionCallback({status:'ok'});
                    resolve();
                } else {
                    debugLog(debugOn, "woo... reportAnAppleTransaction failed: ", data.error);
                    reportAnAppleTransactionCallback({status:'error', error:data.error});
                    reject();
                }
            }).catch(error => {
                debugLog(debugOn, "woo... reportAnAppleTransaction failed.", error)
                reportAnAppleTransactionCallback({status:'error', error:'Network Error.'});
                reject();
            });
        })
    });    
}

export const createAndroidPaymentIntentThunk = (data) => async (dispatch, getState) => {
    newActivity(dispatch, accountActivity.CreateAndroidPaymentIntent, () => {
        return new Promise((resolve, reject) => {
            const accountState = getState().account;
            const currentTime = Date.now();
            const timeDiff = currentTime - (accountState.lastPaymentIntentTime || 0);
            if(accountState.lastPaymentIntentTime && timeDiff < minimumPaymentWaitingTime ) {
                debugLog(debugOn, 'duplicated createAndroidPaymentIntentThunk')
                resolve();
                return;
            }
            dispatch(setLastPaymentIntentTime(currentTime));
            dispatch(setAndroidPaymentIntentData({androidClientSecret: null, checkoutItem:null}))
            PostCall({
                api: '/memberAPI/createAndroidPaymentIntent',
                body: {
                    checkoutPlan:data.checkoutPlan
                }
            }).then(data => {
                debugLog(debugOn, data);
                if (data.status === 'ok') {
                    dispatch(setAndroidPaymentIntentData({androidClientSecret: data.client_secret, checkoutItem:data.checkoutItem}));
                    resolve();
                } else {
                    debugLog(debugOn, "woo... create Android payment intent failed: ", data.error);
                    reject();
                }
            }).catch(error => {
                debugLog(debugOn, "woo... create Android payment intent failed.", error)
            });
        })
    });
}

export const reportAnAndroidPurchaseThunk = (data) => async (dispatch, getState) => {
    newActivity(dispatch, accountActivity.ReportAnAndroidPurchase, () => {
        return new Promise((resolve, reject) => {
            debugLog(debugOn, "reportAnAndroidPurchaseThunk, purchase: ", data.purchase)
            const reportAnAndroidPurchaseCallback = data.callback;
            PostCall({
                api: '/memberAPI/reportAnAndroidPurchase',
                body: {
                    purchase: data.purchase
                }
            }).then(data => {
                debugLog(debugOn, 'reportAnAndroidPurchase: ', data);
                if (data.status === 'ok') {
                    reportAnAndroidPurchaseCallback({status:'ok'});
                    resolve();
                } else {
                    debugLog(debugOn, "woo... reportAnAndroidPurchase failed: ", data.error);
                    reportAnAndroidPurchaseCallback({status:'error', error:data.error});
                    reject();
                }
            }).catch(error => {
                debugLog(debugOn, "woo... reportAnAndroidPurchase failed.", error)
                reportAnAndroidPurchaseCallback({status:'error', error:'Network Error.'});
                reject();
            });
        })
    });    
}

export const accountReducer = accountSlice.reducer;

export default accountSlice;

