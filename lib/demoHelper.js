export const setupDemo = () => {
    //set up demo only if authToken does not exist
    const authToken = localStorage.getItem('authToken');
    let demoMode = false;
    if(!authToken) {
        console.log("Set up demo.")
        localStorage.setItem("demoMode", "on");
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