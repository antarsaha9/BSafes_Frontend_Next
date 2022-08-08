const forge = require('node-forge');
const argon2 = require('argon2-browser');
const bcrypt = require('bcryptjs');

import { debugLog, encode64Custom } from './helper'

const debugOn = false;

const GCMTag = "%GCM371%";

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
  
export function encryptBinaryString(binaryString, key) {
    return encryptBinaryStringGCM(binaryString, key);
}

export async function calculateCredentials(nickname, password) {
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
        
        // Calcuating SHA-256 of expandedKey
        
        //Hash twice
        /*
        md = forge.md.sha256.create();
        md.update(expandedKey);
        result = md.digest();

        md = forge.md.sha256.create();
        md.update(result.getBytes());
        result = md.digest();
        */
        
        const keySaltIV = ";)H{BP_f@)QhrJqy";
        const encryptedKeySalt = encryptBinaryStringCBC(keySalt, credentials.secret.expandedKey, keySaltIV);
        const encryptedKeySalt64 = encode64Custom(encryptedKeySalt).substring(0, 20);
 
        const idSaltIV = "q_f7^HQy{jdhrJ@)";
        const encryptedIdSalt = encryptBinaryStringCBC(idSalt, credentials.secret.expandedKey, idSaltIV);
        credentials.keyPack.idSalt = "$2a$10$" + forge.util.encode64(encryptedIdSalt);

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

        const keyPair = await generateRSAKeyPair();
        credentials.secret.keyPair = keyPair;

        // Calculating encrypted privateKey
        const privateKeyEnvelope = encryptBinaryString(keyPair.privateKey, credentials.secret.expandedKey);
        const encodedPrivateKeyEnvelope = forge.util.encode64(privateKeyEnvelope);
        credentials.keyPack.publicKey = forge.util.encode64(credentials.secret.keyPair.publicKey);
        credentials.keyPack.encodedPrivateKeyEnvelope = encodedPrivateKeyEnvelope;
        
        // Calculating search key
        const salt = forge.random.getBytesSync(32);
        const randomKey = forge.random.getBytesSync(32);
        const searchKey = forge.pkcs5.pbkdf2(randomKey, salt, 10000, 32);
        const searchKeyEnvelope = encryptBinaryString(searchKey, expandedKey);
        const encodedSearchKeyEnvelope = forge.util.encode64(searchKeyEnvelope);
        credentials.keyPack.encodedSearchKeyEnvelope = encodedSearchKeyEnvelope;

        const endTime = Date.now();

        credentials.calculationTime = endTime - startTime;
        
        return credentials;
    } catch (e) {
        console.error(e);
        return null;
    }
}