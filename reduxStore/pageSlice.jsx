import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    imagePanels:[]
}

const pageSlice = createSlice({
    name: "page",
    initialState: initialState,
    reducers: {
        addFiles: (state, action) => {
            state.imagePanels = action.payload;
        }
    }
})

export const { addFiles } = pageSlice.actions;

export const addFilesAsync = (data) => async (dispatch) => {
    setTimeout(()=>{
        console.log("Timeout");
        dispatch(addFiles(data));
    }, 100)
}


export const pageReducer = pageSlice.reducer;

export default pageSlice;