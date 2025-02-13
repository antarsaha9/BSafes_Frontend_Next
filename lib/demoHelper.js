const forge = require('node-forge');

export const setupDemo = () => {
    //set up demo only if authToken does not exist
    const authToken = localStorage.getItem('authToken');
    let demoMode = false;
    if (!authToken) {
        console.log("Set up demo.")
        localStorage.setItem("demoMode", "on");
        const demoWorkspace = `d:1029200110080094:${Date.now()}`
        localStorage.setItem("demoWorkspace", demoWorkspace);
        const demoWorkspaceKey = "ABCDEFGHIJKLMNOPQRSTUVWXYZ123456";
        localStorage.setItem("demoWorkspaceKey", demoWorkspaceKey);
        const demoWorkspaceName = "Demo";
        localStorage.setItem("demoWorkspaceName", demoWorkspaceName);
        demoMode = true;
    }
    return demoMode;
}

export const clearDemo = () => {
    localStorage.removeItem("demoMode");
}

export const isDemoMode = () => {
    const demoMode = localStorage.getItem('demoMode');
    return (demoMode === 'on')
}

export const getDemoWorkspaceInfo = () => {
    const demoWorkspace = localStorage.getItem('demoWorkspace');
    const demoWorkspaceKey = localStorage.getItem('demoWorkspaceKey');
    const demoWorkspaceName = localStorage.getItem('demoWorkspaceName');
    const demoWorkspaceSearchKey = "";
    const demoWorkspaceSearchIV = "";
    return {demoWorkspace, demoWorkspaceName, demoWorkspaceKey, demoWorkspaceSearchKey, demoWorkspaceSearchIV}
}