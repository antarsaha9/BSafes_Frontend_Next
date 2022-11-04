import { createSlice } from '@reduxjs/toolkit';

import { debugLog } from '../lib/helper';

const debugOn = false;

const scripts = [
    {id: "bsafesAPIHooks.js",
     src:"/js/froalaEditorJS/bsafesAPIHooks.js",
     loaded: false
    },
    {id: "froalaEditor.js",
     src:"/js/froalaEditorJS/froala_editor.js",
     loaded: false
    },
    {id: "codemirror.min.js",
     src: "https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.3.0/codemirror.min.js",
     loaded: false,
    },
    {id: "xml.min.js",
     src: "https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.3.0/mode/xml/xml.min.js",
     loaded: false,
    },
    {id: "align.min.js",
     src: "https://cdnjs.cloudflare.com/ajax/libs/froala-editor/2.6.5/js/plugins/align.min.js",
     loaded: false,
    },
    {id: "char_counter.min.js",
     src: "https://cdnjs.cloudflare.com/ajax/libs/froala-editor/2.6.5/js/plugins/char_counter.min.js",
     loaded: false,
    },
    {id: "code_beautifier.min.js",
     src: "https://cdnjs.cloudflare.com/ajax/libs/froala-editor/2.6.5/js/plugins/code_beautifier.min.js",
     loaded: false,
    },
    {id: "code_view.min.js",
     src: "https://cdnjs.cloudflare.com/ajax/libs/froala-editor/2.6.5/js/plugins/code_view.min.js",
     loaded: false,
    },
    {id: "colors.min.js",
     src: "https://cdnjs.cloudflare.com/ajax/libs/froala-editor/2.6.5/js/plugins/colors.min.js",
     loaded: false,
    },
    {id: "emoticons.min.js",
     src: "https://cdnjs.cloudflare.com/ajax/libs/froala-editor/2.6.5/js/plugins/emoticons.min.js",
     loaded: false,
    },
    {id: "entities.min.js",
     src: "https://cdnjs.cloudflare.com/ajax/libs/froala-editor/2.6.5/js/plugins/entities.min.js",
     loaded: false,
    },
    {id: "file.min.js",
     src: "https://cdnjs.cloudflare.com/ajax/libs/froala-editor/2.6.5/js/plugins/file.min.js",
     loaded: false,
    },
    {id: "font_family.min.js",
     src: "https://cdnjs.cloudflare.com/ajax/libs/froala-editor/2.6.5/js/plugins/font_family.min.js",
     loaded: false,
    },
    {id: "font_size.min.js",
     src: "https://cdnjs.cloudflare.com/ajax/libs/froala-editor/2.6.5/js/plugins/font_size.min.js",
     loaded: false
    },
    {id: "froalaEncryptImage.js",
     src:"/js/froalaEditorJS/froalaEncryptImage.js",
     loaded: false
    },
    {id: "froalaEncryptVideo.js",
     src:"/js/froalaEditorJS/froalaEncryptVideo.js",
     loaded: false
    },
    {id: "photoswipe.min.js",
     src: "https://cdnjs.cloudflare.com/ajax/libs/photoswipe/4.1.2/photoswipe.min.js",         
     loaded: false
    },
    {id: "photoswipe-ui-default.min.js",
     src: "https://cdnjs.cloudflare.com/ajax/libs/photoswipe/4.1.2/photoswipe-ui-default.min.js",
     loaded: false
    }
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