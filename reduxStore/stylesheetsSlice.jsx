import { createSlice } from '@reduxjs/toolkit';

const stylesheets = [
    {id: "font-awesome.min.css",
     src: "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.4.0/css/font-awesome.min.css",
     loaded: false,
    },
    {id: "froala_editor.min.css",
     src: "https://cdnjs.cloudflare.com/ajax/libs/froala-editor/2.6.5/css/froala_editor.min.css",
     loaded: false,
    },
    {id: "froala_style.min.css",
     src: "https://cdnjs.cloudflare.com/ajax/libs/froala-editor/2.6.5/css/froala_style.min.css",
     loaded: false,
    },
    {id: "codemirror.min.css",
     src: "https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.3.0/codemirror.min.css",
     loaded: false,
    },
    {id: "char_counter.min.css",
     src: "https://cdnjs.cloudflare.com/ajax/libs/froala-editor/2.6.5/css/plugins/char_counter.min.css",
     loaded: false,
    },
    {id: "code_view.min.css",
     src: "https://cdnjs.cloudflare.com/ajax/libs/froala-editor/2.6.5/css/plugins/code_view.min.css",
     loaded: false,
    },
    {id: "colors.min.css",
     src: "https://cdnjs.cloudflare.com/ajax/libs/froala-editor/2.6.5/css/plugins/colors.min.css",
     loaded: false,
    },
    {id: "emoticons.min.css",
     src: "https://cdnjs.cloudflare.com/ajax/libs/froala-editor/2.6.5/css/plugins/emoticons.min.css",
     loaded: false,
    },
    {id: "file.min.css",
     src: "https://cdnjs.cloudflare.com/ajax/libs/froala-editor/2.6.5/css/plugins/file.min.css",
     loaded: false,
    },
    {id: "fullscreen.min.css",
     src: "https://cdnjs.cloudflare.com/ajax/libs/froala-editor/2.6.5/css/plugins/fullscreen.min.css",
     loaded: false,
    },
    {id: "image.min.css",
     src: "https://cdnjs.cloudflare.com/ajax/libs/froala-editor/2.6.5/css/plugins/image.min.css",
     loaded: false,
    },
    {id: "image_manager.min.css",
     src: "https://cdnjs.cloudflare.com/ajax/libs/froala-editor/2.6.5/css/plugins/image_manager.min.css",
     loaded: false,
    },
    {id: "line_breaker.min.css",
     src: "https://cdnjs.cloudflare.com/ajax/libs/froala-editor/2.6.5/css/plugins/line_breaker.min.css",
     loaded: false
    },
    {id: "line_breaker.min.css",
     src: "https://cdnjs.cloudflare.com/ajax/libs/froala-editor/2.6.5/css/plugins/line_breaker.min.css",
     loaded: false
    },
    {id: "quick_insert.min.css",
     src: "https://cdnjs.cloudflare.com/ajax/libs/froala-editor/2.6.5/css/plugins/quick_insert.min.css",
     loaded: false
    },
    {id: "table.min.css",
     src: "https://cdnjs.cloudflare.com/ajax/libs/froala-editor/2.6.5/css/plugins/table.min.css",
     loaded: false
    }
];

const initialState = {
    stylesheets: stylesheets,
    count: stylesheets.length,
    done: false,
}

const stylesheetsSlice = createSlice({
    name: 'stylesheets',
    initialState,
    reducers:{
        loaded: (state, action) => {
            stylesheets[action.payload].loaded = true;
            state.count--;
            console.log(action.payload + ' loaded. current count:' + state.count);
            if(state.count === 0) { 
                state.done = true;
            }
        },
    }
})


export const { loaded } = stylesheetsSlice.actions;
export const stylesheetsReducer = stylesheetsSlice.reducer;

export default stylesheetsSlice;