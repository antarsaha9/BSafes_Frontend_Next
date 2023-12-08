export const accountActivity = {
    apiCall: 1,
    getInvoice: 2,
    getBraintreeClientToken: 4,
    pay: 8,
    getTransactions: 16,
    GetMFAData: 32,
    VerifyMFASetupToken: 64,
    DeleteMFA: 128,
}

export const authActivity = {
    KeySetup: 1,
    LogIn: 2,
    LogOut: 4,
    Preflight: 8,
    VerifyMFAToken: 16,
    RecoverMFA: 32,
}

export const v1AccountActivity = {
    NicknameSignIn: 1, 
    AuthenticateManagedMember: 2, 
    VerifyMFA: 4, 
    VerifyKeyHash: 8,
    Lock: 16, 
    SignOut: 32, 
}

export const teamsActivity = {
    ListTeams: 1,
    CreateANewTeam: 2, 
    AddAMemberToTeam: 4,
    DeleteATeamMember: 8,
    ListTeamMembers: 16,
    SearchForAMember: 32
}

export const containerActivity = {
    InitWorkspace: 1,
    ListItems: 2,
    SearchItems: 4,
    ListContainers: 8,
    CreateANewItem: 16,
    DropItems: 32,
    GetTrashBox: 64,
    TrashItems: 128,
    EmptyTrashBoxItems: 256,
    RestoreItemsFromTrash: 512,
    ListActivities: 1024,
}

export const pageActivity = {
    GetPageItem : 1,
    DecryptPageItem : 2,
    SaveTags : 4,
    SaveTitle : 8,
    SaveContent : 16,
    UploadImages : 32,
    DeleteAnImage : 64,
    UploadAttachments : 128,
    DeleteAnAttachment : 256,
    SaveImageWords : 512,
    SaveComment : 1 *1024,
    LoadComments : 2 *1024,
    GetVersionsHistory : 4 *1024,
    GetItemPath: 8 *1024,
    UploadVideos : 16 *1024,
    DeleteAVideo : 32 *1024,
    SaveVideoWords : 64 *1024,
} 

const errorMessagesMap = {
    10: 'Please try different nickname and key!',
    12: 'Creating BSafes API error!',
    102: 'Did you enter nickname and key correctly?',
    104: 'Challenge failed!',
    106: 'Challenge API error!',
    108: 'Authenticate API error!',
    110: 'Preflight error!',
    112: '2FA failed!',
    114: '2FA API failed',
}

export const getErrorMessages = (activityType, errors, errorCodes) => {
    const errorMessages = [];
    let activityMap;
    switch(activityType) {
        case 'Auth':
            activityMap = authActivity;
            break;
        default:
            return null;
    }
    const keys = Object.keys(activityMap); 
    for(let i=0; i<keys.length; i++) {
        const activityCode = activityMap[keys[i]];
        if(errors & activityCode) {
            const errorCode = errorCodes[activityCode];
            const errorMessage = errorMessagesMap[errorCode];
            errorMessages.push(errorMessage);
        }
    }
    return errorMessages;
}