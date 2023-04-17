import { createSlice } from '@reduxjs/toolkit';

const forge = require('node-forge');

import { encryptBinaryString, encryptBinaryStringCBC, decryptBinaryStringCBC, ECBDecryptBinaryString } from '../lib/crypto';
import { debugLog, PostCall } from '../lib/helper'

const debugOn = true;

const initialState = {
    activity: "Done", // Done, Loading, Searching
    activityResult:null,
    error: null,
    teams: [],
    teamName: 'Personal',
    teamData: null,
    pageNumber: 1,
    itemsPerPage: 20,
    total:0,
    memberSearchValue:'',
    memberSearchResult:null,
    teamMembers: [],
    teamMembersTotal:0,
};

const teamSlice = createSlice({
    name: "team",
    initialState: initialState,
    reducers: {
        activityChanged: (state, action) => {
            state.activity = action.payload;
        },
        setActivityResult: (state, action) => {
            state.activityResult = action.payload;
        },
        teamsLoaded: (state, action) => {
            state.teams = action.payload.hits;
            state.total = action.payload.total;
            state.pageNumber = action.payload.pageNumber;
        },
        newTeamAddedOnTop: (state, action) => {
            state.teams.unshift(action.payload);
        },
        newTeamAddedBefore: (state, action) => {
            state.teams.splice(action.payload.targetIndex, 0, action.payload.team);
        },
        newTeamAddedAfter: (state, action) => {
            state.teams.splice(action.payload.targetIndex+1, 0, action.payload.team);
        },
        setTeamName: (state, action) => {
            state.teamName = action.payload.teamName;
        },
        setTeamData: (state, action) => {
            state.teamData = action.payload.teamData;
        },
        clearMemberSearchResult: (state, action) => {
            state.memberSearchResult = null;
        },
        setMemberSearchValue: (state, action) => {
            state.memberSearchValue = action.payload;
        },
        setMemberSearchResult: (state, action) => {
            state.memberSearchResult = action.payload;
        },
        setTeamMembers: (state, action) => {
            const hits = action.payload;
            state.teamMembersTotal = hits.total;
            state.teamMembers = hits.hits.map((member)=>member._source);
        },
        newTeamMemberAdded: (state, action) => {
            const teamMember = action.payload;
            state.teamMembers = [teamMember].concat(state.teamMembers);
        },
        teamMemberDeleted: (state, action) => {
            const member = action.payload;
            let teamMembers = state.teamMembers.filter((teamMember)=> {return (teamMember.memberId !== member.memberId)})
            state.teamMembers = teamMembers;
        },
        clearTeamMembers: (state, action) => {
            state.teamMembers = [];
        }
    }
})

export const { activityChanged, setActivityResult, teamsLoaded, newTeamAddedOnTop, newTeamAddedBefore, newTeamAddedAfter, setTeamName, setTeamData, clearMemberSearchResult, setMemberSearchValue, setMemberSearchResult, setTeamMembers, newTeamMemberAdded, teamMemberDeleted, clearTeamMembers } = teamSlice.actions;

const newActivity = async (dispatch, type, activity) => {
    dispatch(activityChanged(type));
    dispatch(setActivityResult(null));
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
            let i, state, auth, hits=[], decryptedTeam, team, privateKeyFromPem, encodedTeamName, teamName, cachedTeamName, pageNumber;
            state = getState().team;
            auth = getState().auth;
            hits = [];
            pageNumber = data.pageNumber;
            PostCall({
                api: '/memberAPI/listTeams',
                body: {
                    from: (pageNumber -1 ) * state.itemsPerPage,
                    size: state.itemsPerPage
                }
            }).then(async data => {
                debugLog(debugOn, data);
                if (data.status === 'ok') {
                    privateKeyFromPem = forge.pki.privateKeyFromPem(auth.privateKey);
                    for( i=0; i<data.hits.hits.length; i++) {
                         team = data.hits.hits[i];
                        if (team._source.encryptedTeamName) {
                            if (team._source.cachedTeamName && team._source.cachedTeamName !== 'NULL') {
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
                   
                    dispatch(teamsLoaded({ pageNumber ,total: data.hits.total, hits }));
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

export const createANewTeamThunk = (data) => async (dispatch, getState) => {
    newActivity(dispatch, "CreatingANewTeam", () => {
        return new Promise(async (resolve, reject) => {
            const teamName = data.title;
            const publicKeyPem = data.publicKeyPem;
            const addAction = data.addAction;
            const targetIndex = data.targetIndex;
            const targetTeam = data.targetTeam;
            const targetPosition = data.targetPosition;
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
                        let team = {
                            title: teamName,
                            id: result.team.id,
                            position: result.team.position
                        }
                        switch(addAction) {
                            case 'addATeamOnTop':
                                dispatch(newTeamAddedOnTop(team));
                                break;
                            case 'addATeamBefore':
                                dispatch(newTeamAddedBefore({team, targetIndex}));
                                break;
                            case 'addATeamAfter':
                                dispatch(newTeamAddedAfter({team, targetIndex}));
                                break;
                            default:
                        }
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
    });
}

export const findMemberByIdThunk = (data) => async (dispatch, getState) => {
    newActivity(dispatch, "searchingForAMember", () => {
        return new Promise(async (resolve, reject) => {
            PostCall({
                api: '/memberAPI/findMemberById',
                body: {
                    id: data.id
                }
            }).then(data => {
                if (data.status === 'ok') {
                    dispatch(setMemberSearchResult(data.member));
                    resolve();
                } else {
                    dispatch(setMemberSearchResult({}));
                    reject(data.error);
                }
            }).catch(error => {
                debugLog(debugOn, "findMemberById failed: ", error)
                reject("findMemberById failed!");
            })
        });
    });
}

export const listTeamMembersThunk = (data) => async (dispatch, getState) => {
    debugLog(debugOn, 'listTeamMembersThunk');
    newActivity(dispatch, "listingTeamMembers", () => {
        return new Promise(async (resolve, reject) => {
            const teamId = data.teamId;
            let state = getState().team;
            PostCall({
                api: '/memberAPI/listTeamMembers',
                body: {
                    teamId,
                    size: state.itemsPerPage,
                    from: (data.pageNumber - 1) * state.itemsPerPage
                }
            }).then(data => {
                if (data.status === 'ok') {
                    dispatch(setTeamMembers(data.hits));
                    resolve();
                } else {
                    reject(data.error);
                }
            }).catch(error => {
                debugLog(debugOn, "listTeamMembers failed: ", error)
                reject("listTeamMembers failed!");
            })
        })
    })
}

export const addAMemberToTeamThunk = (data) => async (dispatch, getState) => {
    newActivity(dispatch, "addingAMemberToTeam", () => {
        return new Promise(async (resolve, reject) => {
            let pki, teamId, teamKey,teamName, publicKeyFromPem, encodedTeamKey, encodedTeamName, encryptedTeamKey, encryptedTeamName, teamMember;
            const member = data.member;
            const memberId = member.id;
            const containerState = getState().container;
            
            if(!containerState.workspaceKeyReady){
                reject("Workspace key not ready!");
                return;
            }
            pki = forge.pki;
            teamId = containerState.workspace;
            teamKey = containerState.workspaceKey;
            teamName = containerState.workspaceName;
            publicKeyFromPem = pki.publicKeyFromPem(forge.util.decode64(member.publicKey));
            encodedTeamKey = forge.util.encodeUtf8(teamKey);
            encryptedTeamKey = publicKeyFromPem.encrypt(encodedTeamKey);
            encryptedTeamKey = forge.util.encode64(encryptedTeamKey);
            encodedTeamName = forge.util.encodeUtf8(teamName);
            encryptedTeamName = publicKeyFromPem.encrypt(encodedTeamName);
            encryptedTeamName = forge.util.encode64(encryptedTeamName);
            teamMember = {
                teamId,
                memberId,
                encryptedTeamName,
                teamKeyEnvelope: encryptedTeamKey,
            }
            PostCall({
                api: '/memberAPI/addATeamMember',
                body: teamMember
            }).then(data => {
                if (data.status === 'ok') {
                    dispatch(setActivityResult('Added'));
                    dispatch(setMemberSearchValue(''));
                    dispatch(newTeamMemberAdded(teamMember));
                    resolve();
                } else {
                    dispatch(setActivityResult(data.error));
                    dispatch(setMemberSearchValue(''));
                    reject(data.error);
                }
            }).catch(error => {
                debugLog(debugOn, "addAMemberToTeamThunk failed: ", error)
                reject("error");
            })

        });
    });
}

export const deleteATeamMemberThunk = (data) => async (dispatch, getState) => {
    newActivity(dispatch, "addingAMemberToTeam", () => {
        return new Promise(async (resolve, reject) => {
            const member = data.member;
            const teamId = member.teamId;
            const memberId = member.memberId;

            PostCall({
                api: '/memberAPI/deleteATeamMember',
                body: {
                    teamId,
                    memberId
                }
            }).then(data => {
                if (data.status === 'ok') {
                    dispatch(teamMemberDeleted(member));
                    resolve();
                } else {
                    
                    reject(data.error);
                }
            }).catch(error => {
                debugLog(debugOn, "deleteATeamMemberThunk failed: ", error)
                reject("error");
            })
            
        })
    });
}

export const teamReducer = teamSlice.reducer;

export default teamSlice;


