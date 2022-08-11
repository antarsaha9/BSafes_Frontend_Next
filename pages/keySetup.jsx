import { useEffect, useRef, useState } from 'react'
import { useSelector } from 'react-redux'

import Container from 'react-bootstrap/Container'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Form from 'react-bootstrap/Form'
import Button from 'react-bootstrap/Button'

import jquery from "jquery"

const forge = require('node-forge');
const argon2 = require('argon2-browser')

import { debugLog, PostCall } from '../lib/helper'
import { calculateCredentials, saveLocalCredentials } from '../lib/crypto'

import ContentPageLayout from '../components/layouts/contentPageLayout';
import Scripts from '../components/scripts'

import KeyInput from "../components/keyInput";

import { FormText } from 'react-bootstrap'

export default function CreateKey() {
    const debugOn = true;
    const [calcuationTime, setCalcuationTime] = useState(0);
    const [keyPassword, setKeyPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const nicknameRef = useRef(null);

    const scriptsLoaded = useSelector(state => state.scripts.done);

    const keyPasswordChanged = ( password ) => {
        debugLog(debugOn, "keyPassword: ", password);
        setKeyPassword(password);
    }

    const confirmPasswordChanged = ( password) => {
        debugLog(debugOn, "confirmPassword: ", password);
        setConfirmPassword(password);
    }

    const handleSubmit = async e => { 
        debugLog(debugOn,  "handleSubmit");

        const credentials = await calculateCredentials(nicknameRef.current.value, keyPassword);
        setCalcuationTime(credentials.calculationTime);
        if(credentials) {
            debugLog(debugOn, "credentials: ", credentials);

            PostCall({
                api:'createAnAccount',
                body: credentials.keyPack,
            }).then( data => {
                debugLog(debugOn, data);
                if(data.status === 'ok') {
                    saveLocalCredentials(credentials, data.sessionKey, data.sessionIV);
                } else {
                    debugLog(debugOn, "woo... failed to create an account:", data.error);
                }
            }).catch( error => {
                debugLog(debugOn, "woo... failed to create an account.")
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
                        <h1>Create Your Key</h1>
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
                            <Form.Group className="mb-3" controlId="ConfirmkeyPassword">
                                <Form.Label>Please retype to confirm</Form.Label>
                                <KeyInput onKeyChanged={confirmPasswordChanged}/>
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