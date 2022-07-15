const forge = require('node-forge');
const argon2 = require('argon2-browser')

import { debugLog, encode64Custom } from './helper';

const debugOn = false;

const GCMTag = "%GCM371%";

// Crypto related helper functions
export function encryptBinaryStringGCM(binaryString, key, iv) {
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
  
export function encryptBinaryString(binaryString, key, iv) {
    return encryptBinaryStringGCM(binaryString, key, iv);
}

export async function calculateCredentials(nickname, password) {
    let credentials = {};
    const startTime = Date.now();

    // Deriving the salt from nickname
    const md = forge.md.sha256.create();
    md.update(nickname);      
    const result = forge.util.hexToBytes(md.digest().toHex())
    const keySalt = result.substring(0, 16);
    debugLog(debugOn,  "keySalt:", keySalt.length);
    credentials.keySalt = keySalt;
    credentials.keySalt64 = encode64Custom(keySalt);

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
        credentials.expandedKeyHex = result.hashHex;

        const expandedKey = forge.util.hexToBytes(result.hashHex);
        debugLog(debugOn,  expandedKey);
        credentials.expandedKey = expandedKey;

        const expandedKey64 = encode64Custom(expandedKey);
        credentials.expandedKey64 = expandedKey64;
        
        // Calcuating SHA-256 of expandedKey
        
        md = forge.md.sha256.create();
        md.update(expandedKey);
        result = md.digest();
        const goldenKeyHash = result.toHex();
        credentials.goldenKeyHash = goldenKeyHash;
        const keyHash64 = encode64Custom(result.getBytes());
        credentials.keyHash64 = keyHash64;
        
        credentials.id = credentials.keySalt64 + keyHash64;

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
        credentials.keyPair = keyPair;

        // Calculating encrypted privateKey
        const privateKeyEnvelopeIV = forge.random.getBytesSync(16);
        const privateKeyEnvelope = encryptBinaryString(keyPair.privateKey, credentials.expandedKey, privateKeyEnvelopeIV);
        const encodedPrivateKeyEnvelope = forge.util.encode64(privateKeyEnvelope);
        const encodedPrivateKeyEnvelopeIV = forge.util.encode64(privateKeyEnvelopeIV);
        credentials.encodedPrivateKeyEnvelope = encodedPrivateKeyEnvelope;
        credentials.encodedPrivateKeyEnvelopeIV = encodedPrivateKeyEnvelopeIV;
        
        // Calculating search key
        const salt = forge.random.getBytesSync(32);
        const randomKey = forge.random.getBytesSync(32);
        const searchKey = forge.pkcs5.pbkdf2(randomKey, salt, 10000, 32);
        const searchKeyIV = forge.random.getBytesSync(16);
        const searchKeyEnvelope = encryptBinaryString(searchKey, expandedKey, searchKeyIV);
        const encodedSearchKeyEnvelope = forge.util.encode64(searchKeyEnvelope);
        const encodedSearchKeyEnvelopeIV = forge.util.encode64(searchKeyIV);
        credentials.encodedSearchKeyEnvelope = encodedSearchKeyEnvelope;
        credentials.encodedSearchKeyEnvelopeIV = encodedSearchKeyEnvelopeIV;

        const endTime = Date.now();

        credentials.calculationTime = endTime - startTime;
        
        return credentials;
    } catch (e) {
        console.error(e);
        return null;
    }
}