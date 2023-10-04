import { createSlice } from '@reduxjs/toolkit';

import { debugLog } from '../lib/helper'
import { accountActivity } from '../lib/activities';

const debugOn = true;

const initialState = {
    apiCount: 0,
    activity: 0,
    accountState: null,
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
        }
    }
});

export const {cleanAccountSlice, showApiActivity, hideApiActivity, incrementAPICount, setAccountState}  = accountSlice.actions;

export const accountReducer = accountSlice.reducer;

export default accountSlice;

 