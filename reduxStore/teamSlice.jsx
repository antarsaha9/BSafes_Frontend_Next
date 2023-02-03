import { createSlice } from '@reduxjs/toolkit';

const forge = require('node-forge');

import { debugLog, PostCall } from '../lib/helper'

const debugOn = false;

const initialState = {
    activity: "Done", // Done, Loading, Searching
    error: null,
    teams: [],
    teamName: 'Personal',
    teamData: null
};

const teamSlice = createSlice({
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

export const { activityChanged, teamLoaded, clearItems, setTeamName, setTeamData } = teamSlice.actions;

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

function generateTeamKey() {
    const salt = forge.random.getBytesSync(16);
    const randomKey = forge.random.getBytesSync(32);
    const teamKey = forge.pkcs5.pbkdf2(randomKey, salt, 10000, 32);

    return teamKey;
}
  
export function createANewTeam(teamName, addAction, targetTeam, targetPosition, publicKeyPem) {
    return new Promise(async (resolve, reject) => {
        const teamKey = generateTeamKey();
        const encodedTeamName = forge.util.encodeUtf8(teamName);
        const encryptedTeamName = encryptBinaryString(encodedTeamName, teamKey);
  
        const publicKeyFromPem = forge.pki.publicKeyFromPem(publicKeyPem);
        const encodedTeamKey = forge.util.encodeUtf8(teamKey);
        const encryptedTeamKey = publicKeyFromPem.encrypt(encodedTeamKey);
        const encryptedTeamNameByMemberPublic = publicKeyFromPem.encrypt(encodedTeamName);
  
        const salt = forge.random.getBytesSync(16);
        const randomKey = forge.random.getBytesSync(32);
        const searchKey = forge.pkcs5.pbkdf2(randomKey, salt, 10000, 32);
        const searchKeyEnvelope = encryptBinaryString(searchKey, teamKey);
  
        const searchIV = forge.random.getBytesSync(16);
        const searchIVEnvelope = encryptBinaryString(searchIV, teamKey);

        const addActionOptions = {
            name: forge.util.encode64(encryptedTeamName),
            teamKeyEnvelope: forge.util.encode64(encryptedTeamKey),
            searchKeyEnvelope: forge.util.encode64(searchKeyEnvelope),
            searchIVEnvelope: forge.util.encode64(searchIVEnvelope),
            encryptedTeamNameByMemberPublic: forge.util.encode64(encryptedTeamNameByMemberPublic),
            addAction: addAction,
        };
  
        if (addAction !== "addATeamOnTop") {
            addActionOptions.targetTeam = targetTeam;
            addActionOptions.targetPosition = targetPosition;
        }

        debugLog(debugOn, addActionOptions);

        PostCall({
            api: '/memberAPI/createANewTeam',
            body: addActionOptions
        }).then(result => {
            debugLog(debugOn, result);
  
            if (result.status === 'ok') {
                if (result.team) {
                    resolve(result.team);
                } else {
                    debugLog(debugOn, "woo... failed to create a team!", result.data.error);
                    reject("woo... failed to create a team!");
                }
            } else {
                debugLog(debugOn, "woo... failed to create a team!", result.data.error);
                reject("woo... failed to create a team!");
            }
      });
    });
  }

export const teamReducer = teamSlice.reducer;

export default teamSlice;


