import { createSlice } from '@reduxjs/toolkit';

import { debugLog } from '../lib/helper';

const debugOn = false;

const scripts = [
    {id: "line_height.min.js",
     src:"https://cdnjs.cloudflare.com/ajax/libs/froala-editor/2.9.8/js/plugins/line_height.min.js",
     loaded: false
    },
    // {id: "ponyfill.min.js",
    //  src: "https://cdn.jsdelivr.net/npm/web-streams-polyfill@2.0.2/dist/ponyfill.min.js",
    //  loaded: false
    // },
    {id: "Blob.js",
     src: "https://cdn.jsdelivr.net/gh/eligrey/Blob.js/Blob.js",
     loaded: false
    },
];

const initialState = {
    scripts: [scripts[0]],
    index: 0,
    done: false,
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