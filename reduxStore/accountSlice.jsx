import { createSlice } from '@reduxjs/toolkit';

import { debugLog, PostCall } from '../lib/helper'

const debugOn = true;

const initialState = {
    activity: "Done", // Done, Loading, Searching
    error: null,
    dashboard: {}
};

const accountSlice = createSlice({
    name: "account",
    initialState: initialState,
    reducers: {
        activityChanged: (state, action) => {
            state.activity = action.payload;
        },
        clientTokenLoaded: (state, action) => {
            state.clientToken = action.payload.clientToken;
        },
        paymentMethodInfoLoaded: (state, action) => {
            state.paymentMethodInfo = action.payload.paymentMethodInfo;
        },
    }
})

export const { activityChanged, clientTokenLoaded, paymentMethodInfoLoaded } = accountSlice.actions;

const newActivity = async (dispatch, type, activity) => {
    dispatch(activityChanged(type));
    try {
        await activity();
        dispatch(activityChanged("Done"));
    } catch (error) {
        dispatch(activityChanged("Error"));
    }
}

export const getClientTokenThunk = () => async (dispatch, getState) => {
    newActivity(dispatch, "Loading", () => {
        return new Promise(async (resolve, reject) => {
            PostCall({
                api: '/memberAPI/getClientToken',
            }).then(async data => {
                debugLog(debugOn, data);
                if (data.status === 'ok') {
                    dispatch(clientTokenLoaded({ clientToken: data.clientToken }));
                    resolve();
                } else {
                    debugLog(debugOn, "getClientToken failed: ", data.error);
                    reject(data.error);
                }
            }).catch(error => {
                debugLog(debugOn, "getClientToken failed: ", error)
                reject("getClientToken failed!");
            })
        });
    });
}

export const getPaymentMethodInfoThunk = () => async (dispatch, getState) => {
    newActivity(dispatch, "Loading", () => {
        return new Promise(async (resolve, reject) => {
            PostCall({
                api: '/memberAPI/getPaymentMethodInfo',
            }).then(async data => {
                debugLog(debugOn, data);
                if (data.status === 'ok') {
                    dispatch(paymentMethodInfoLoaded({ paymentMethodInfo: data.paymentMethodInfo }));
                    resolve();
                } else {
                    debugLog(debugOn, "getPaymentMethodInfo failed: ", data.error);
                    reject(data.error);
                }
            }).catch(error => {
                debugLog(debugOn, "getPaymentMethodInfo failed: ", error)
                reject("getPaymentMethodInfo failed!");
            })
        });
    });
}

export const subscribe = async (body) => {
    return new Promise(async (resolve, reject) => {
        PostCall({
            api: '/memberAPI/subscribe',
            body
        }).then(async data => {
            debugLog(debugOn, data);
            if (data.status === 'ok') {
                resolve(data);
            } else {
                debugLog(debugOn, "subscribe failed: ", data.error);
                reject(data.error);
            }
        }).catch(error => {
            debugLog(debugOn, "subscribe failed: ", error)
            reject("subscribe failed!");
        })
    });
}

export const buyingQuotas = async (body) => {
    return new Promise(async (resolve, reject) => {
        PostCall({
            api: '/memberAPI/buyingQuotas',
            body
        }).then(async data => {
            debugLog(debugOn, data);
            if (data.status === 'ok') {
                resolve(data);
            } else {
                debugLog(debugOn, "buyingQuotas failed: ", data.error);
                reject(data.error);
            }
        }).catch(error => {
            debugLog(debugOn, "buyingQuotas failed: ", error)
            reject("buyingQuotas failed!");
        })
    });
}
export const accountReducer = accountSlice.reducer;

export default accountSlice;


