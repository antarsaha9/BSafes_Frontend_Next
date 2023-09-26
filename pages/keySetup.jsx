import { useRef, useState } from 'react'
import { useDispatch } from 'react-redux'

import Container from 'react-bootstrap/Container'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Form from 'react-bootstrap/Form'
import Button from 'react-bootstrap/Button'

import { debugLog } from '../lib/helper'

import ContentPageLayout from '../components/layouts/contentPageLayout';
import Scripts from '../components/scripts'

import KeyInput from "../components/keyInput";

import { keySetupAsyncThunk } from '../reduxStore/auth'

export default function KeySetup() {
    const debugOn = false;
    const dispatch = useDispatch();

    const [keyPassword, setKeyPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const nicknameRef = useRef(null);

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
        dispatch(keySetupAsyncThunk({nickname: nicknameRef.current.value, keyPassword: keyPassword}));
    }

    return (
        <ContentPageLayout showNavbarMenu={false} showPathRow={false}> 
            <Container className="mt-5 d-flex justify-content-center" style={{height:'80vh', backgroundColor: "white"}}>     
                <Row>
                    <Col>
                        <h1>Create Your Key</h1>
                        <hr></hr>
                        <Form>
                            <Form.Group className="mb-3" controlId="Nickname">
                                <Form.Label>Nickname</Form.Label>
                                <Form.Control ref={nicknameRef} size="lg" type="text" placeholder='Plase choose a nickname' />
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
                        </Form>
                    </Col>           
                </Row>
            </Container>
            <Scripts />
        </ContentPageLayout>
    )
}