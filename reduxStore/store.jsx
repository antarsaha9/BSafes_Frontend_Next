import { configureStore } from '@reduxjs/toolkit'
import { createWrapper } from 'next-redux-wrapper'

import scriptsSlice, { scriptsReducer } from './scriptsSlice';
import stylesheetsSlice, { stylesheetsReducer } from './stylesheetsSlice';
import authSlice, {authReducer} from './auth';
import containerSlice, {containerReducer} from './containerSlice';
import pageSlice, {pageReducer} from './pageSlice';

const reduxStore = configureStore({
    reducer: {
        [stylesheetsSlice.name]: stylesheetsReducer,
        [scriptsSlice.name]: scriptsReducer,
        [authSlice.name]: authReducer,
        [containerSlice.name]: containerReducer,
        [pageSlice.name]: pageReducer,
    },
    devTools: true,
    middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types
        ignoredActions: ['page/addImages', 'page/imageUploaded'],
        // Ignore these field paths in all actions
        ignoredActionPaths: ['payload.files', 'payload.img', 'payload.buffer'],
        // Ignore these paths in the state
        ignoredPaths: ['page.imageUploadQueue', 'page.imagePanels'],
      },
    }),
})

const createStore = () => reduxStore;

export const reduxWrapper = createWrapper(createStore);

export default reduxStore;