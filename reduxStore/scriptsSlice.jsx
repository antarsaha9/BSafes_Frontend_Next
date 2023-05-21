import { createSlice } from '@reduxjs/toolkit';

import { debugLog } from '../lib/helper';

const debugOn = false;

const scripts = [
];

const initialState = {
    scripts: scripts.length>0?[scripts[0]]:[],
    index: 0,
    done: true,
}

const scriptsSlice = createSlice({
    name: 'scripts',
    initialState,
    reducers:{
        loaded: (state, action) => {
            state.scripts[action.payload].loaded = true;
            if(action.payload === scripts.length - 1) { 
                state.done = true;
            } else {
                state.index ++;
                state.scripts.push(scripts[state.index]);
                debugLog(debugOn, action.payload + ' loaded. current count:' + state.index);
            }
        },
    }
})


export const { loaded } = scriptsSlice.actions;
export const scriptsReducer = scriptsSlice.reducer;

export default scriptsSlice;