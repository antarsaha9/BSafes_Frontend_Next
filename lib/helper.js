const forge = require('node-forge');

// For debugging messages
export function debugLog(on, msg, value="") {
    if(on) {
        console.log(msg, value);
    }
}

// API related helper functions
export function PostCall({ api, body }) {
    return new Promise((resolve, reject) => {
        //const domain = 'https://hivqf9prf7.execute-api.us-east-1.amazonaws.com';
        const domain = 'http://localhost:3000';
        const url = `${domain}/${api}`
        
            fetch(url, {
                body: JSON.stringify(body),
                headers: {
                    'Content-Type': 'application/json'
                },
                method: "POST",
                credentials: "include",
            })
            .then(res => res.json())
            .then(response => {
                resolve(response.data);
            }).catch(error => {
                console.error(error);
                reject(error);
            })
        }
    )    
}

// String encoding functions
export function encode64Custom(bytes, char63='_') {
    let newBytes = forge.util.encode64(bytes);
    newBytes = newBytes.replace(/\//g, char63);

    return newBytes;
}