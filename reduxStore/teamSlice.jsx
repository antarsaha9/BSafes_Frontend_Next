import { createSlice } from '@reduxjs/toolkit';

const forge = require('node-forge');

import { encryptBinaryString, encryptBinaryStringCBC, decryptBinaryStringCBC, ECBDecryptBinaryString } from '../lib/crypto';
import { debugLog, PostCall } from '../lib/helper'

const debugOn = false;

const initialState = {
    activity: "Done", // Done, Loading, Searching
    error: null,
    teams: [],
    teamName: 'Personal',
    teamData: null,
    pageNumber: 1,
    itemsPerPage: 20,
    total:0
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
    function cacheTeamNameForTeamMember(teamId, cachedTeamName) {
        return new Promise(async (resolve, reject) => {
            PostCall({
                api: '/memberAPI/cacheTeamNameForTeamMember',
                body: {
                    teamId,
                    cachedTeamName: forge.util.encode64(cachedTeamName),
                }
            }).then(data => {
                debugLog(debugOn, data);
                if (data.status === 'ok') {
                    resolve();
                } else {
                    debugLog(debugOn, "cacheTeamNameForTeamMember failed: ", data.error);
                    reject(data.error);
                }
            }).catch(error => {
                debugLog(debugOn, "cacheTeamNameForTeamMember failed: ", error)
                reject("cacheTeamNameForTeamMember failed!");
            })

        });
    }
    
    newActivity(dispatch, "Loading", () => {
        return new Promise(async (resolve, reject) => {
            let i, state, auth, hits=[], decryptedTeam, team, privateKeyFromPem, encodedTeamName, teamName, cachedTeamName;
            state = getState().team;
            auth = getState().auth;
            hits = [];
            PostCall({
                api: '/memberAPI/listTeams',
                body: {
                    from: (state.pageNumber -1 ) * state.itemsPerPage,
                    size: state.itemsPerPage
                }
            }).then(async data => {
                debugLog(debugOn, data);
                if (data.status === 'ok') {
                    privateKeyFromPem = forge.pki.privateKeyFromPem(auth.privateKey);
                    for( i=0; i<data.hits.hits.length; i++) {
                         team = data.hits.hits[i];
                        if (team._source.encryptedTeamName) {
                            if (team._source.cachedTeamName) {
                                if(team._source.keyVersion === 3){
                                    encodedTeamName = decryptBinaryStringCBC(forge.util.decode64(team._source.cachedTeamName), auth.searchKey, auth.searchIV);
                                    teamName = "<h2>" + forge.util.decodeUtf8(encodedTeamName) + "</h2>";
                                    decryptedTeam = {
                                        title: teamName,
                                        id: team._source.teamId,
                                        position: team._source.position
                                    }
                                } else {
                                    encodedTeamName = ECBDecryptBinaryString(forge.util.decode64(team._source.cachedTeamName), auth.searchKey);
                                    teamName = "<h2>" + forge.util.decodeUtf8(encodedTeamName) + "</h2>";
                                    decryptedTeam = {
                                        title: teamName,
                                        id: team._source.teamId,
                                        position: team._source.position
                                    }     
                                }
                            } else {
                                encodedTeamName = privateKeyFromPem.decrypt(forge.util.decode64(team._source.encryptedTeamName));
                                teamName = "<h2>" + forge.util.decodeUtf8(encodedTeamName) + "</h2>";
                                try {
                                    cachedTeamName = encryptBinaryStringCBC(encodedTeamName, auth.searchKey, auth.searchIV);
                                    await cacheTeamNameForTeamMember(team._source.teamId, cachedTeamName);
                                } catch(error) {
                                    debugLog("cacheTeamName error");
                                }
                                decryptedTeam = {
                                    title: teamName,
                                    id: team._source.teamId,
                                    position: team._source.position
                                }
                            }
                        } else {
                            decryptedTeam = {
                                title: 'Error',
                                id: team._source.teamId,
                                position: team._source.position
                            }
                        }
                        
                        hits.push(decryptedTeam);
                    }
                   
                    dispatch(teamLoaded({ total: data.hits.total, hits }));
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

export const getTeamData = (teamId) => {
    return new Promise(async (resolve, reject) => {
        PostCall({
            api: '/memberAPI/getTeamData',
            body: { teamId }
        }).then(data => {
            debugLog(debugOn, data);
            if (data.status === 'ok') {
                const team = data.team;
                resolve(team);
            } else {
                debugLog(debugOn, "getTeamData failed: ", data.error);
                reject(data.error);
            }
        }).catch(error => {
            debugLog(debugOn, "getTeamData failed: ", error)
            reject("getTeamData failed!");
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
                    debugLog(debugOn, "woo... failed to create a team!", result.error);
                    reject("woo... failed to create a team!");
                }
            } else {
                debugLog(debugOn, "woo... failed to create a team!", result.error);
                reject("woo... failed to create a team!");
            }
      });
    });
  }

export const teamReducer = teamSlice.reducer;

export default teamSlice;


