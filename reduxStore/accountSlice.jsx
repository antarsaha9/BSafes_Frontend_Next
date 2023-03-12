import { createSlice } from '@reduxjs/toolkit';

import { debugLog, PostCall } from '../lib/helper'

const debugOn = false;

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
        dashboardLoaded: (state, action) => {
            state.dashboard = action.payload.dashboard;
        },
    }
})

export const { activityChanged, dashboardLoaded } = accountSlice.actions;

const newActivity = async (dispatch, type, activity) => {
    dispatch(activityChanged(type));
    try {
        await activity();
        dispatch(activityChanged("Done"));
    } catch (error) {
        dispatch(activityChanged("Error"));
    }
}

export const getDashboardDataThunk = () => async (dispatch, getState) => {
    newActivity(dispatch, "Loading", () => {
        return new Promise(async (resolve, reject) => {
            PostCall({
                api: '/memberAPI/getDashboardData',
            }).then(async data => {
                debugLog(debugOn, data);
                if (data.status === 'ok') {
                    dispatch(dashboardLoaded({ dashboard: data.data }));
                    resolve();
                } else {
                    debugLog(debugOn, "getDashboardData failed: ", data.error);
                    reject(data.error);
                }
            }).catch(error => {
                debugLog(debugOn, "getDashboardData failed: ", error)
                reject("getDashboardData failed!");
            })
        });
    });
}

export const getQuotasHistory = (LastEvaluatedKey) => {
    return new Promise(async (resolve, reject) => {
        PostCall({
            api: '/memberAPI/getQuotasHistory',
            body: {
                LastEvaluatedKey: JSON.stringify(LastEvaluatedKey)
            }
        }).then(data => {
            debugLog(debugOn, data);
            if (data.status === 'ok') {
                resolve({ items: data.items, LastEvaluatedKey: data.LastEvaluatedKey });
            } else {
                debugLog(debugOn, "getTeamData failed: ", data.error);
                reject(data.error);
            }
        }).catch(error => {
            debugLog(debugOn, "getTeamData failed: ", error)
            reject("getTeamData failed!");
        })
    });
}

export const getPaymentsHistory = () => {
    return new Promise(async (resolve, reject) => {
        PostCall({
            api: '/memberAPI/getPaymentsHistory',
        }).then(data => {
            debugLog(debugOn, data);
            if (data.status === 'ok') {
                resolve({ items: data.items });
            } else {
                debugLog(debugOn, "getTeamData failed: ", data.error);
                reject(data.error);
            }
        }).catch(error => {
            debugLog(debugOn, "getTeamData failed: ", error)
            reject("getTeamData failed!");
        })
    });
}

export const accountReducer = accountSlice.reducer;

export default accountSlice;


