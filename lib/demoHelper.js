export const setupDemo = () => {
    //set up demo only if authToken does not exist
    const authToken = localStorage.getItem('authToken');
    if(!authToken) {
        console.log("Set up demo.")
        localStorage.setItem("demoMode", "on");
        const demoMode = localStorage.getItem("demoMode");
        console.log("demoMode: ", demoMode)
    }
}