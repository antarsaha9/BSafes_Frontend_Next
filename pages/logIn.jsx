import { useEffect, useRef, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'

import Container from 'react-bootstrap/Container'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Form from 'react-bootstrap/Form'
import Button from 'react-bootstrap/Button'

import jquery from "jquery"

import { debugLog, PostCall } from '../lib/helper'

import ContentPageLayout from '../components/layouts/contentPageLayout';
import Scripts from '../components/scripts'
import KeyInput from "../components/keyInput";

import { logInAsyncThunk } from '../reduxStore/auth'

export default function LogIn() {
    const debugOn = true;
    const dispatch = useDispatch();
    
    const [keyPassword, setKeyPassword] = useState("");

    const nicknameRef = useRef(null);

    const scriptsLoaded = useSelector(state => state.scripts.done);

    const keyPasswordChanged = ( password ) => {
        debugLog(debugOn, "keyPassword: ", password);
        setKeyPassword(password);
    }

    const handleSubmit = async e => { 
        debugLog(debugOn,  "handleSubmit");
        
        dispatch(logInAsyncThunk({nickname: nicknameRef.current.value, keyPassword: keyPassword }));
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
                            
                        </Form>
                    </Col>           
                </Row>
            </Container>
            <Scripts />
        </ContentPageLayout>
    )
}