import { useEffect, useRef, useState } from 'react'
import { useSelector } from 'react-redux'

import Container from 'react-bootstrap/Container'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Form from 'react-bootstrap/Form'
import Button from 'react-bootstrap/Button'

import jquery from "jquery"
const forge = require('node-forge');



import { debugLog, PostCall } from '../lib/helper'
import { calculateCredentials, saveLocalCredentials, decryptBinaryString} from '../lib/crypto'

import ContentPageLayout from '../components/layouts/contentPageLayout';
import Scripts from '../components/scripts'

import KeyInput from "../components/keyInput";

import { FormText } from 'react-bootstrap'

export default function CreateKey() {
    const debugOn = true;
    const [calcuationTime, setCalcuationTime] = useState(0);
    const [keyPassword, setKeyPassword] = useState("");

    const nicknameRef = useRef(null);

    const scriptsLoaded = useSelector(state => state.scripts.done);

    const keyPasswordChanged = ( password ) => {
        debugLog(debugOn, "keyPassword: ", password);
        setKeyPassword(password);
    }

    const handleSubmit = async e => { 
        debugLog(debugOn,  "handleSubmit");

        const credentials = await calculateCredentials(nicknameRef.current.value, keyPassword, true);
        setCalcuationTime(credentials.calculationTime);
        if(credentials) {
            debugLog(debugOn, "credentials: ", credentials);

            PostCall({
                api:'logIn',
                body: credentials.keyPack,
            }).then( data => {
                debugLog(debugOn, data);
                credentials.keyPack.privateKeyEnvelope = data.privateKeyEnvelope;
                credentials.keyPack.searchKeyEnvelope = data.searchKeyEnvelope;
                credentials.keyPack.publicKey = data.publicKey;

                function verifyChallenge() {
                    let randomMessage = data.randomMessage;
                    randomMessage = forge.util.encode64(randomMessage);
                    
                    let privateKey = forge.util.decode64(data.privateKeyEnvelope);
                    privateKey = decryptBinaryString(privateKey, credentials.secret.expandedKey);
                    const pki = forge.pki;
                    let privateKeyFromPem = pki.privateKeyFromPem(privateKey);
                    const md = forge.md.sha1.create();
                    md.update(randomMessage, 'utf8');
                    let signature = privateKeyFromPem.sign(md);
                    signature = forge.util.encode64(signature);


                    PostCall({
                        api:'memberAPI/verifyChallenge',
                        body: { signature },
                    }).then( data => {
                        if(data.status == "ok") {
                            debugLog(debugOn, "Logged in.");
                           
                            saveLocalCredentials(credentials, data.sessionKey, data.sessionIV);
                          
                        } else {
                            debugLog(debugOn, "Error: ", data.error);
                        }
                    }).catch( error => {
                        debugLog(debugOn, "woo... failed to verify challenge.");
                    })
                } 
                    
                verifyChallenge();

            }).catch( error => {
                debugLog(debugOn, "woo... failed to login.")
            })
        }
    }

    useEffect(()=> {
        window.$ = window.jQuery = jquery;
        if(scriptsLoaded) {
            //argon2Functions.loadArgon2('native-wasm');
        }
    }, [scriptsLoaded]);


    return (
        <ContentPageLayout> 
            <Container className="mt-5 d-flex justify-content-center" style={{height:'80vh', backgroundColor: "white"}}>     
                <Row>
                    <Col>
                        <h1>Log In</h1>
                        <hr></hr>
                        <Form>
                            <Form.Group className="mb-3" controlId="Nickname">
                                <Form.Label>Nickname</Form.Label>
                                <Form.Control ref={nicknameRef} size="lg" type="text" placeholder='Enter a nickname' />
                            </Form.Group>
                            <Form.Group className="mb-3" controlId="keyPassword">
                                <Form.Label>Key Password</Form.Label>
                                <KeyInput onKeyChanged={keyPasswordChanged}/>
                                <Form.Text id="passwordHelpBlock" muted>
                Your password must be longer than 8 characters, contain letters and numbers
                                </Form.Text>
                            </Form.Group>
                            <Button variant="dark" onClick={handleSubmit}>Submit</Button>
                            <p> Calculation Time: {calcuationTime} ms</p>
                        </Form>
                    </Col>           
                </Row>
            </Container>
            <Scripts />
        </ContentPageLayout>
    )
}