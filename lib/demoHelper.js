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
        const demoWorkspaceKey = forge.random.getBytesSync(32);
        localStorage.setItem("demoWorkspaceKey", demoWorkspaceKey);
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
    return {demoWorkspace, demoWorkspaceKey}
}