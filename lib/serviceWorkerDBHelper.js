import { debugLog } from "./helper";
const debugOn = false;

export const writeDataToServiceWorkerDBTable = (params) => {
    return new Promise(async (resolve, reject) => {
        let messageChannel;
        debugLog(debugOn, "writeDataToServiceWorkerDB");
        navigator.serviceWorker.getRegistration("/").then((registration) => {
            debugLog(debugOn, "registration: ", registration);
            if (registration) {
                messageChannel = new MessageChannel();
                registration.active.postMessage({
                    type: 'WRITE_TO_DB_TABLE',
                    ...params
                }, [messageChannel.port2]);

                messageChannel.port1.onmessage = async (event) => {
                    // Print the result
                    debugLog(debugOn, event.data);
                    if (event.data) {
                        if (event.data) {
                            switch (event.data.type) {
                                case 'WRITE_RESULT':
                                    resolve(event.data.data);
                                    messageChannel.port1.onmessage = null
                                    messageChannel.port1.close();
                                    messageChannel.port2.close();
                                    messageChannel = null;
                                    break;
                                default:
                            }
                        }
                    }
                };
            } else {
                debugLog(debugOn, "serviceWorker.getRegistration error");
                reject("serviceWorker.getRegistration error")
            }
        })
    })
}

export const readDataFromServiceWorkerDBTable = (params) => {
    return new Promise(async (resolve, reject) => {
        debugLog(debugOn, "getDataFromServiceWorker");
        navigator.serviceWorker.getRegistration("/").then((registration) => {
            debugLog(debugOn, "registration: ", registration);
            if (registration) {
                let messageChannel = new MessageChannel();
                registration.active.postMessage({
                    type: 'READ_FROM_DB_TABLE',
                    ...params
                }, [messageChannel.port2]);

                messageChannel.port1.onmessage = async (event) => {
                    // Print the result
                    debugLog(debugOn, event.data);
                    if (event.data) {
                        switch (event.data.type) {
                            case 'DATA':
                                resolve(event.data.data);
                                messageChannel.port1.onmessage = null
                                messageChannel.port1.close();
                                messageChannel.port2.close();
                                messageChannel = null;
                                break;
                            default:
                        }
                    }
                };
            } else {
                debugLog(debugOn, "serviceWorker.getRegistration error");
                reject("serviceWorker.getRegistration error")
            }
        })
    })
}

export const readDataFromServiceWorkerDB = (params) => {
    return new Promise(async (resolve, reject) => {
        debugLog(debugOn, "getDataFromServiceWorker");
        navigator.serviceWorker.getRegistration("/").then((registration) => {
            debugLog(debugOn, "registration: ", registration);
            if (registration) {
                let messageChannel = new MessageChannel();
                registration.active.postMessage({
                    type: 'READ_FROM_DB',
                    ...params
                }, [messageChannel.port2]);

                messageChannel.port1.onmessage = async (event) => {
                    // Print the result
                    debugLog(debugOn, event.data);
                    if (event.data) {
                        switch (event.data.type) {
                            case 'DATA':
                                resolve(event.data.data);
                                messageChannel.port1.onmessage = null
                                messageChannel.port1.close();
                                messageChannel.port2.close();
                                messageChannel = null;
                                break;
                            default:
                        }
                    }
                };
            } else {
                debugLog(debugOn, "serviceWorker.getRegistration error");
                reject("serviceWorker.getRegistration error")
            }
        })
    })
}