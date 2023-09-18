import { createSlice } from '@reduxjs/toolkit';

import { debugLog } from '../lib/helper'
import { accountActivity } from '../lib/activities';

const debugOn = true;

const initialState = {
    apiCount: 0,
    activity: 0
}

const accountSlice = createSlice({
    name: "account",
    initialState: initialState,
    reducers: {
        showApiActivity: (state, action) => {
            state.activity |= accountActivity.apiCall;
        },
        hideApiActivity: (state, action) => {
            state.activity &= ~accountActivity.apiCall;
        },
        incrementAPICount: (state, action) => {
            state.apiCount ++;
        },
    }
});

export const {showApiActivity, hideApiActivity, incrementAPICount}  = accountSlice.actions;

export const accountReducer = accountSlice.reducer;

export default accountSlice;

 