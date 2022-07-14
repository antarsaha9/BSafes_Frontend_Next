const forge = require('node-forge');
const argon2 = require('argon2-browser')

// For debugging messages
export function debugLog(on, msg, value="") {
    if(on) {
        console.log(msg, value);
    }
}

// API related helper functions
export function PostCall({ api, body }) {
    return new Promise((resolve, reject) => {
        const domain = 'https://la19lsux40.execute-api.us-east-1.amazonaws.com';
        const url = `${domain}/${api}`
        fetch(url, {
            body: JSON.stringify(body),
            headers: {
                'Content-Type': 'application/json'
            },
            method: "POST"
        })
        .then(res => res.json())
        .then(response => {
            resolve(response.data);
        })
        .catch(error =>{
            reject(error);
        })
    });
}

// Crypto related helper functions

export async function calculateExpandedKey(nickname, password) {
        // Deriving the salt from nickname
        let md = forge.md.sha256.create();
        md.update(nickname);      
        let result = forge.util.hexToBytes(md.digest().toHex())
        let keySalt = result.substring(0, 16);
        console.log("keySalt:", keySalt.length);
                
        try {
            const result= await argon2.hash({
                pass: password, 
                salt: keySalt,
                time: 2,
                mem: 100 * 1024,
                hashLen: 32,
                parallelism: 2,
                type: argon2.ArgonType.Argon2id
            })
            console.log(result.hashHex);

            const expandedKey = forge.util.hexToBytes(result.hashHex);
            console.log(expandedKey);
        } catch (e) {
            console.error(e);
        }
}