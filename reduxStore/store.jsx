import { configureStore } from '@reduxjs/toolkit'
import { createWrapper } from 'next-redux-wrapper'

import scriptsSlice, { scriptsReducer } from './scriptsSlice';
import stylesheetsSlice, { stylesheetsReducer } from './stylesheetsSlice';
import authSlice, {authReducer} from './auth';
import pageSlice, {pageReducer} from './pageSlice';

const reduxStore = configureStore({
    reducer: {
        [stylesheetsSlice.name]: stylesheetsReducer,
        [scriptsSlice.name]: scriptsReducer,
        [authSlice.name]: authReducer,
        [pageSlice.name]: pageReducer,
    },
    devTools: true,
    middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types
        ignoredActions: ['page/addImages'],
        // Ignore these field paths in all actions
        ignoredActionPaths: ['payload.files'],
        // Ignore these paths in the state
        ignoredPaths: ['page.imageUploadQueue'],
      },
    }),
})

const createStore = () => reduxStore;

export const reduxWrapper = createWrapper(createStore);

export default reduxStore;