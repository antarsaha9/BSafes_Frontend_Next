import { createSlice } from '@reduxjs/toolkit';

import { debugLog } from '../lib/helper'

const debugOn = true;

const initialState = {
    apiCount: 0
}

const accountSlice = createSlice({
    name: "account",
    initialState: initialState,
    reducers: {
        incrementAPICount: (state, action) => {
            state.apiCount ++;
        },
    }
});

export const {incrementAPICount}  = accountSlice.actions;

export const accountReducer = accountSlice.reducer;

export default accountSlice;

 