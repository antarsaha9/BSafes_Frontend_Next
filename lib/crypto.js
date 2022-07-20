const forge = require('node-forge');
const argon2 = require('argon2-browser');

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
    credentials.keyPack = {};
    const startTime = Date.now();

    // Deriving the salt from nickname
    const md = forge.md.sha256.create();
    md.update(nickname);      
    const result = forge.util.hexToBytes(md.digest().toHex())
    const keySalt = result.substring(0, 16);
    debugLog(debugOn,  "keySalt:", keySalt.length);
    credentials.secret.keySalt = keySalt;
    credentials.secret.keySalt64 = encode64Custom(keySalt);

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
        
        md = forge.md.sha256.create();
        md.update(expandedKey);
        result = md.digest();
        const goldenKeyHash = result.toHex();
        credentials.keyPack.goldenKeyHash = goldenKeyHash;
        const keyHash64 = encode64Custom(result.getBytes());
        credentials.keyPack.keyHash64 = keyHash64;
        
        const keySaltIV = ";)H{BP_f@)QhrJqy";
        const encryptedKeySalt = encryptBinaryStringCBC(keySalt, credentials.secret.expandedKey, keySaltIV);
        const encryptedKeySalt64 = encode64Custom(encryptedKeySalt).substring(0, 20);

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