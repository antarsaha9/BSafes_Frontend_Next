import { configureStore } from '@reduxjs/toolkit'
import { createWrapper } from 'next-redux-wrapper'
import scriptsSlice, { scriptsReducer } from './scriptsSlice';
import stylesheetsSlice, { stylesheetsReducer } from './stylesheetsSlice';

const reduxStore = configureStore({
    reducer: {
        [stylesheetsSlice.name]: stylesheetsReducer,
        [scriptsSlice.name]: scriptsReducer,
    },
    devTools: true,
})

const createStore = () => reduxStore;

export const reduxWrapper = createWrapper(createStore);

export default reduxStore;