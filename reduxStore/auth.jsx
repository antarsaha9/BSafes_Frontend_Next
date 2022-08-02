import { createSlice, current } from '@reduxjs/toolkit';

const initialState = {
    isLoggedIn: false,
}

const authSlice = createSlice({
    name: "auth",
    initialState: initialState,
    reducers: {
        loggedIn: (state, action) => {
            state.isLoggedIn = true;
        },
        loggedOut: (state, action) => {
            state.isLoggedIn = false;
        }
    }
});

export const { loggedIn, loggedOut} = authSlice.actions;

export const logInAsyncThunk = (data) => async (dispatch, getState) => {

}

export const preflightAsyncThunk = () => async (dispatch, getState) => {
    await new Promise(resolve => {
        setTimeout(()=>{
            dispatch(loggedIn());
        }, 1000);
    });
    
}

export const logOutAsyncThunk = (data) => async (dispatch, getState) => {

}

export const authReducer = authSlice.reducer;

export default authSlice;
