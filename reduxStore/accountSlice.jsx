import { createSlice } from '@reduxjs/toolkit';

import { debugLog, PostCall, getTimeZoneOffset } from '../lib/helper'
import { accountActivity } from '../lib/activities';

const debugOn = false;

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
            state.activity |= accountActivity.apiCall;
        },
        hideApiActivity: (state, action) => {
            state.activity &= ~accountActivity.apiCall;
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
        }
    }
});

export const { cleanAccountSlice, activityStart, activityDone, activityError, setNewAccountCreated, showApiActivity, hideApiActivity, incrementAPICount, setAccountState, invoiceLoaded, setCheckoutPlan, transactionsLoaded, setAccountHashVerified, setDataCenterModal, MFALoaded, dataCentersLoaded, setCurrentDataCenter, setPaymentIntentData } = accountSlice.actions;

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

export const accountReducer = accountSlice.reducer;

export default accountSlice;

