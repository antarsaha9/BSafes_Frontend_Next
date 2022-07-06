import { createSlice, current } from '@reduxjs/toolkit';

const initialState = {
    status: "idle",
    imagePanels:[],
    imagePanelsIndex:{},
    uploadQueue:[],
}

const pageSlice = createSlice({
    name: "page",
    initialState: initialState,
    reducers: {
        addImages: (state, action) => {
            switch (action.payload.where) {
                case "top":
                    state.imagePanels.unshift(...action.payload.newPanels)
                    break;
                case "bottom":
                    break;
                default:
            }
            let index = {};
            for(let i=0; i< state.imagePanels.length; i++) {
                let key = state.imagePanels[i].key;
                index[key] = i;
            }
            state.imagePanelsIndex = index;
            state.uploadQueue.push(...action.payload.newPanels);
        },
        uploadAnImage: (state, action) => {
            console.log("uploadAnImage");
            console.log("action payload: ", action.payload)
            console.log("imagePanelsIndex: ", current(state.imagePanelsIndex));
            let i = state.imagePanelsIndex[action.payload];
            console.log("index: ", i);
            console.log("imagePanels :", current(state.imagePanels));
            let thisPanel = state.imagePanels[i];
            console.log("This panel: ", current(thisPanel));
            state.imagePanels[i].status = "uploading";
        },
        doneUploadingAnImage: (state, action) => {
            console.log("doneUploadingAnImage");
            console.log("action payload: ", action.payload)
            console.log("imagePanelsIndex: ", current(state.imagePanelsIndex));
            let i = state.imagePanelsIndex[action.payload];
            console.log("index: ", i);
            console.log("imagePanels :", current(state.imagePanels));
            let thisPanel = state.imagePanels[i];
            console.log("This panel: ", current(thisPanel));
            state.uploadQueue.shift();
            console.log("uploadQueue: ", current(state.uploadQueue));
            state.imagePanels[i].status = "displayed";
        }
    }
})

export const { addImages, uploadAnImage, doneUploadingAnImage } = pageSlice.actions;

export const addImagesAsyncThunk = (data) => async (dispatch, getState) => {
    const state = getState();
    
    console.log("Timeout");
    let newPanels = data.files.map((file, index) => {
        return {file: file, 
        key: Date.now() + '-' + index,
        status: "waitingForUpload"}
    }) 
    dispatch(addImages({newPanels:newPanels, where: data.where}));

    const uploadAnImageAsync = async () => {
            await new Promise( resolve => setTimeout(resolve, 3000));
    }

    if(state.page.status === "idle") {
        console.log("Page status is idle");

        state = getState();

        while(state.page.uploadQueue.length !== 0) {
            let item = state.page.uploadQueue[0];
            dispatch(uploadAnImage(item.key));
            await uploadAnImageAsync();
            dispatch(doneUploadingAnImage(item.key));
            state = getState();
        } 
    }
}

export const pageReducer = pageSlice.reducer;

export default pageSlice;