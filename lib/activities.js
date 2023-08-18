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
} 