import { configureStore } from '@reduxjs/toolkit'
import { createWrapper } from 'next-redux-wrapper'

import scriptsSlice, { scriptsReducer } from './scriptsSlice';
import stylesheetsSlice, { stylesheetsReducer } from './stylesheetsSlice';
import authSlice, {authReducer} from './auth';
import containerSlice, {containerReducer} from './containerSlice';
import pageSlice, {pageReducer} from './pageSlice';
import teamSlice, {teamReducer} from './teamSlice';

const reduxStore = configureStore({
    reducer: {
        [stylesheetsSlice.name]: stylesheetsReducer,
        [scriptsSlice.name]: scriptsReducer,
        [authSlice.name]: authReducer,
        [containerSlice.name]: containerReducer,
        [pageSlice.name]: pageReducer,
        [teamSlice.name]: teamReducer
    },
    devTools: true,
    middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types
        ignoredActions: ['page/addImages', 'page/imageUploaded', 'page/setAbortController'],
        // Ignore these field paths in all actions
        ignoredActionPaths: ['payload.files', 'payload.img', 'payload.buffer', 'payload.xhr', 'payload.writer'],
        // Ignore these paths in the state
        ignoredPaths: ['page.imageUploadQueue', 'page.imagePanels', 'page.attachmentsUploadQueue', 'page.attachmentPanels', 'page.abortController', 'page.xhr', 'page.writer'],
      },
    }),
})

const createStore = () => reduxStore;

export const reduxWrapper = createWrapper(createStore);

export default reduxStore;