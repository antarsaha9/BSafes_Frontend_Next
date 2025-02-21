import { NotebookDemo } from "./productID";
const demoOwner = "1029200110080094";
const demoNotebook = `/notebookDemo/n:1029200110080094:3:1739503470913`

export const setupDemo = () => {
    //set up demo only if authToken does not exist
    const authToken = localStorage.getItem('authToken');
    let demoMode = false;
    if (!authToken) {
        console.log("Set up demo.")
        localStorage.setItem("demoMode", "on");
        const demoWorkspace = `d:${demoOwner}:${Date.now()}`
        localStorage.setItem("demoWorkspace", demoWorkspace);
        const demoWorkspaceKey = "ABCDEFGHIJKLMNOPQRSTUVWXYZ123456";
        localStorage.setItem("demoWorkspaceKey", demoWorkspaceKey);
        const demoWorkspaceSearchKey = "abcdefGHIJKLMNOPQRSTUVWXYZ987654";
        localStorage.setItem("demoWorkspaceSearchKey", demoWorkspaceSearchKey);
        const demoWorkspaceSearchIV = "ABCDEFghijklmnoPQRSTUVWXYZ432109";
        localStorage.setItem("demoWorkspaceSearchIV", demoWorkspaceSearchIV);
        const demoWorkspaceName = "Demo";
        localStorage.setItem("demoWorkspaceName", demoWorkspaceName);
        demoMode = true;
    }
    return demoMode;
}

export const clearDemo = () => {
    localStorage.removeItem("demoMode");
    localStorage.removeItem("demoWorkspace");
    localStorage.removeItem("demoWorkspaceKey");
    localStorage.removeItem("demoWorkspaceSearchKey");
    localStorage.removeItem("demoWorkspaceSearchIV");
    localStorage.removeItem("demoWorkspaceName");
}

export const isDemoMode = () => {
    const demoMode = localStorage.getItem('demoMode');
    return (demoMode === 'on')
}

export const getDemoWorkspaceInfo = () => {
    const demoWorkspace = localStorage.getItem('demoWorkspace');
    const demoWorkspaceKey = localStorage.getItem('demoWorkspaceKey');
    const demoWorkspaceName = localStorage.getItem('demoWorkspaceName');
    const demoWorkspaceSearchKey = localStorage.getItem('demoWorkspaceSearchKey');
    const demoWorkspaceSearchIV = localStorage.getItem('demoWorkspaceSearchIV');
    return {demoWorkspace, demoWorkspaceName, demoWorkspaceKey, demoWorkspaceSearchKey, demoWorkspaceSearchIV}
}