import { createSlice } from '@reduxjs/toolkit';

import { debugLog, PostCall } from '../lib/helper'
import { newResultItem } from '../lib/bSafesCommonUI';
const forge = require('node-forge');

const debugOn = false;

const initialState = {
    activity: "Done", // Done, Loading, Searching
    error: null,
    teams: [],
    teamName: 'Personal',
    teamData: null
};

const TeamSlice = createSlice({
    name: "team",
    initialState: initialState,
    reducers: {
        activityChanged: (state, action) => {
            state.activity = action.payload;
        },
        teamLoaded: (state, action) => {
            state.teams = action.payload.hits;
        },
        setTeamName: (state, action) => {
            state.teamName = action.payload.teamName;
        },
        setTeamData: (state, action) => {
            state.teamData = action.payload.teamData;
        },
    }
})

export const { activityChanged, teamLoaded, clearItems, setTeamName, setTeamData } = TeamSlice.actions;

const newActivity = async (dispatch, type, activity) => {
    dispatch(activityChanged(type));
    try {
        await activity();
        dispatch(activityChanged("Done"));
    } catch (error) {
        dispatch(activityChanged("Error"));
    }
}

export const listTeamsThunk = (data) => async (dispatch, getState) => {
    newActivity(dispatch, "Loading", () => {
        return new Promise(async (resolve, reject) => {
            let state, pageNumber;
            state = getState().team;
            const auth = getState().auth;
            PostCall({
                api: '/memberAPI/listTeams',
                body: {
                    from: 0,
                    size: 20
                }
            }).then(data => {
                debugLog(debugOn, data);
                if (data.status === 'ok') {
                    const privateKeyFromPem = forge.pki.privateKeyFromPem(auth.privateKey);
                    const hits = data.hits.map(team => {
                        const encodedTeamName = privateKeyFromPem.decrypt(forge.util.decode64(team._source.encryptedTeamName));
                        const teamName = "<h2>" + forge.util.decodeUtf8(encodedTeamName) + "</h2>";
                        return {
                            title: teamName,
                            id: team._source.teamId,
                            position: team._source.position
                        }
                    })
                    dispatch(teamLoaded({ pageNumber: 1, total: 0, hits }));
                    resolve();
                } else {
                    debugLog(debugOn, "listItems failed: ", data.error);
                    reject(data.error);
                }
            }).catch(error => {
                debugLog(debugOn, "listItems failed: ", error)
                reject("listItems failed!");
            })
        });
    });
}

export const getTeamDataThunk = (teamId) => async (dispatch, getState) => {
    return new Promise(async (resolve, reject) => {
        PostCall({
            api: '/memberAPI/getTeamData',
            body: { teamId }
        }).then(data => {
            debugLog(debugOn, data);
            if (data.status === 'ok') {
                const team = data.team;
                dispatch(setTeamData({ teamData: team }));
                resolve();
            } else {
                debugLog(debugOn, "getTeamDataThunk failed: ", data.error);
                reject(data.error);
            }
        }).catch(error => {
            debugLog(debugOn, "getTeamDataThunk failed: ", error)
            reject("getTeamDataThunk failed!");
        })
    });
}

export const teamReducer = TeamSlice.reducer;

export default TeamSlice;
