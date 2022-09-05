const forge = require('node-forge');
const argon2 = require('argon2-browser');
const bcrypt = require('bcryptjs');

import { debugLog, encode64Custom } from './helper'

const debugOn = false;

const GCMTag = "%GCM371%";
const __GCMOverhead = 8 + 12 + 16; //header + IV + tag 

// Crypto related helper functions
export function encryptBinaryStringCBC(binaryString, key, iv) {
    let thisBuffer = forge.util.createBuffer();
    thisBuffer.putBytes(binaryString);
    let cipher = forge.cipher.createCipher('AES-CBC', key);
    cipher.start({
      iv: iv
    });
    cipher.update(thisBuffer);
    cipher.finish();
    const encryptedBinaryString = cipher.output.data;
    return encryptedBinaryString
}

export function decryptBinaryStringCBC(binaryString, key, iv) {
    let thisBuffer = forge.util.createBuffer();
    thisBuffer.putBytes(binaryString);
    let decipher = forge.cipher.createDecipher('AES-CBC', key);
    decipher.start({
      iv: iv
    });
    decipher.update(thisBuffer);
    decipher.finish();
    const decryptedBinaryString = decipher.output.data;
    return decryptedBinaryString;
};
  
export function encryptBinaryStringGCM(binaryString, key) {
    const thisBuffer = forge.util.createBuffer();
    thisBuffer.putBytes(binaryString);
  
    const uniqueIV = forge.random.getBytesSync(12);
    const cipher = forge.cipher.createCipher('AES-GCM', key);
    cipher.start({
      iv: uniqueIV, // should be a 12-byte binary-encoded string or byte buffer
      tagLength: 128 // optional, defaults to 128 bits
    });
    cipher.update(forge.util.createBuffer(binaryString));
    cipher.finish();
    const encrypted = cipher.output;
    const tag = cipher.mode.tag;
  
    const encryptedBinaryString = GCMTag + uniqueIV + cipher.mode.tag.data + cipher.output.data;
    return encryptedBinaryString
}

export function decryptBinaryStringGCM(binaryString, key) {
    let thisBuffer = forge.util.createBuffer();
    thisBuffer.putBytes(binaryString.slice(__GCMOverhead));
    let uniqueIV = binaryString.slice(8, 20);
    let tag = forge.util.createBuffer();
    tag.putBytes(binaryString.slice(20, __GCMOverhead));
  
    let decipher = forge.cipher.createDecipher('AES-GCM', key);
    decipher.start({
      iv: uniqueIV,
      tagLength: 128, // optional, defaults to 128 bits
      tag: tag // authentication tag from encryption
    });
    decipher.update(thisBuffer);
    let pass = decipher.finish();
    // pass is false if there was a failure (eg: authentication tag didn't match)
    let decryptedBinaryString = null;
    if(pass) {
        // outputs decrypted hex
        decryptedBinaryString = decipher.output.data;
    } else {
        console.log("corrupted data.");
    }
    return decryptedBinaryString;
  };
  
  
export function encryptBinaryString(binaryString, key) {
    return encryptBinaryStringGCM(binaryString, key);
}

export function decryptBinaryString(binaryString, key, iv) {
    let header = binaryString.slice(0,8);
    if(header === GCMTag) {
        return decryptBinaryStringGCM(binaryString, key);
    }   else {
        return decryptBinaryStringCBC(binaryString, key, iv);
    }
};

export function stringToEncryptedTokens(str, searchKey, searchIV) {
    var thisStr = str.toLowerCase();
    var re = /\s*[\s,.;!?]\s*/;
    var slices = thisStr.split(re);
    var encryptedTokens = [];
  
    for (var i = 0; i < slices.length; i++) {
      if (slices[i].length) {
        var encodedSlice = forge.util.encodeUtf8(slices[i]);
        var encryptedToken = encryptBinaryStringCBC(encodedSlice, searchKey, searchIV);
        var base64Token = forge.util.encode64(encryptedToken);
        encryptedTokens.push(base64Token);
      }
    }
    return encryptedTokens;
};

export async function calculateCredentials(nickname, password, logInOnly = false) {
    let credentials = {};
    credentials.secret = {};
    credentials.keyPack = { schemeVersion: 2 };
    const startTime = Date.now();

    // Deriving the salt from nickname
    let md = forge.md.sha256.create();
    md.update(nickname);      
    let result = forge.util.hexToBytes(md.digest().toHex());
    md = forge.md.sha256.create();
    md.update(result);
    result = forge.util.hexToBytes(md.digest().toHex());

    const keySalt = result.substring(0, 16);
    debugLog(debugOn,  "keySalt:", keySalt.length);
    credentials.secret.keySalt = keySalt;
    credentials.secret.keySalt64 = encode64Custom(keySalt);

    const idSalt = result.substring(16, 32);

    try {
        let md, result;
        result= await argon2.hash({
            pass: password, 
            salt: keySalt,
            time: 2,
            mem: 100 * 1024,
            hashLen: 32,
            parallelism: 2,
            type: argon2.ArgonType.Argon2id
        })
        debugLog(debugOn,  result.hashHex);
        credentials.secret.expandedKeyHex = result.hashHex;

        const expandedKey = forge.util.hexToBytes(result.hashHex);
        debugLog(debugOn,  expandedKey);
        credentials.secret.expandedKey = expandedKey;

        const expandedKey64 = encode64Custom(expandedKey);
        credentials.secret.expandedKey64 = expandedKey64;
                
        const keySaltIV = ";)H{BP_f@)QhrJqy";
        const encryptedKeySalt = encryptBinaryStringCBC(keySalt, credentials.secret.expandedKey, keySaltIV);
        const encryptedKeySalt64 = encode64Custom(encryptedKeySalt).substring(0, 20);
 
        const idSaltIV = "q_f7^HQy{jdhrJ@)";
        const encryptedIdSalt = encryptBinaryStringCBC(idSalt, credentials.secret.expandedKey, idSaltIV);
        let newBytes = forge.util.encode64(encryptedIdSalt);
        newBytes = newBytes.replace(/\+/g, '0');
        credentials.keyPack.idSalt = "$2a$10$" + newBytes;

        result = await new Promise ((resolve, reject) => {
            
            bcrypt.hash(expandedKey, credentials.keyPack.idSalt, function(err, hash) {
                if(err) {
                        reject(null);
                } else {
                        let keyHash = hash.substring(28, hash.length)
                        resolve(keyHash);
                }
            });
            
        });
        const keyHash64 = encode64Custom(result);

        credentials.keyPack.id = encryptedKeySalt64 + keyHash64;

        const generateRSAKeyPair = async () => {
            return new Promise ((resolve, reject) => {
                const pki = forge.pki;
                const rsa = forge.pki.rsa;
                rsa.generateKeyPair({
                bits: 2048,
                workers: 2
                }, function(err, keypair) {
                    if(err) {
                        reject(null);
                    } else {
                        const publicKey = keypair.publicKey;
                        const privateKey = keypair.privateKey;
                        const publicKeyPem = pki.publicKeyToPem(publicKey);          
                        const privatePem = pki.privateKeyToPem(privateKey);
                        resolve({publicKey: publicKeyPem, privateKey: privatePem});
                    }   
                });
            });
        };

        if(!logInOnly) {
            const keyPair = await generateRSAKeyPair();
            credentials.secret.keyPair = keyPair;

            // Calculating encrypted privateKey
            const privateKeyEnvelope = encryptBinaryString(keyPair.privateKey, credentials.secret.expandedKey);
            const encodedPrivateKeyEnvelope = forge.util.encode64(privateKeyEnvelope);
            credentials.keyPack.publicKey = forge.util.encode64(credentials.secret.keyPair.publicKey);
            credentials.keyPack.privateKeyEnvelope = encodedPrivateKeyEnvelope;
        
            // Calculating search key
            const salt = forge.random.getBytesSync(32);
            const randomKey = forge.random.getBytesSync(32);
            const searchKey = forge.pkcs5.pbkdf2(randomKey, salt, 10000, 32);
            const searchKeyEnvelope = encryptBinaryString(searchKey, expandedKey);
            const encodedSearchKeyEnvelope = forge.util.encode64(searchKeyEnvelope);
            credentials.keyPack.searchKeyEnvelope = encodedSearchKeyEnvelope;
            const searchIV = forge.random.getBytesSync(16);;
            const searchIVEnvelope = encryptBinaryString(searchIV, expandedKey);
            const encodedSearchIVEnvelope = forge.util.encode64(searchIVEnvelope);
            credentials.keyPack.searchIVEnvelope = encodedSearchIVEnvelope;
        }
        const endTime = Date.now();

        credentials.calculationTime = endTime - startTime;
        
        return credentials;
    } catch (e) {
        console.error(e);
        return null;
    }
}

export function saveLocalCredentials(credentials, sessionKey, sessionIV) {
    const cipher = forge.cipher.createCipher('AES-GCM', sessionKey);
    cipher.start({
      iv: sessionIV, // should be a 12-byte binary-encoded string or byte buffer
      tagLength: 128 // optional, defaults to 128 bits
    });
    cipher.update(forge.util.createBuffer(credentials.secret.expandedKey));
    cipher.finish();
    const encrypted = cipher.output;
    const tag = cipher.mode.tag;

    let encodedGold = forge.util.encode64(cipher.mode.tag.data + cipher.output.data);
    localStorage.setItem("memberId", credentials.memberId);
    localStorage.setItem("encodedGold", encodedGold);
    localStorage.setItem("publicKey", credentials.keyPack.publicKey);
    localStorage.setItem("encodedPrivateKeyEnvelope", credentials.keyPack.privateKeyEnvelope);
    localStorage.setItem("encodedSearchKeyEnvelope", credentials.keyPack.searchKeyEnvelope);
    localStorage.setItem("encodedSearchIVEnvelope", credentials.keyPack.searchIVEnvelope);
}

export function readLocalCredentials(sessionKey, sessionIV) {
    let credentials = {secret:{}, keyPack:{}};
    
    credentials.memberId = localStorage.getItem("memberId");
    let thisDiscovery = localStorage.getItem("encodedGold");
    let decoded = forge.util.decode64(thisDiscovery);

    let thisBuffer = forge.util.createBuffer();
    thisBuffer.putBytes(decoded.slice(16/*tag bytes*/)); 
    let tag = forge.util.createBuffer();
    tag.putBytes(decoded.slice(0, 16));
  
    let decipher = forge.cipher.createDecipher('AES-GCM', sessionKey);
    decipher.start({
      iv: sessionIV,
      tagLength: 128, // optional, defaults to 128 bits
      tag: tag // authentication tag from encryption
    });
    decipher.update(thisBuffer);
    let pass = decipher.finish();
    // pass is false if there was a failure (eg: authentication tag didn't match)
    let decryptedBinaryString = null;
    if(pass) {
        // outputs decrypted hex
        decryptedBinaryString = decipher.output.data;
    } else {
        console.log("corrupted data.");
    }
    credentials.secret.expandedKey = decryptedBinaryString;
    credentials.keyPack.publicKey = forge.util.decode64(localStorage.getItem("publicKey"));
    
    let encodedPrivateKeyEnvelope = localStorage.getItem("encodedPrivateKeyEnvelope");
    let privateKeyEnvelope = forge.util.decode64(encodedPrivateKeyEnvelope);
    credentials.secret.privateKey = decryptBinaryString(privateKeyEnvelope, credentials.secret.expandedKey);
    
    let encodedSearchKeyEnvelope = localStorage.getItem("encodedSearchKeyEnvelope");
    let searchKeyEnvelope = forge.util.decode64(encodedSearchKeyEnvelope);
    credentials.secret.searchKey = decryptBinaryString(searchKeyEnvelope, credentials.secret.expandedKey);

    let encodedSearchIVEnvelope = localStorage.getItem("encodedSearchIVEnvelope");
    let searchIVEnvelope = forge.util.decode64(encodedSearchIVEnvelope);
    credentials.secret.searchIV = decryptBinaryString(searchIVEnvelope, credentials.secret.expandedKey);
    return credentials;
}
