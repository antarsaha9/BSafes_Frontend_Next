import { useEffect, useRef, useState } from 'react'
import { useDispatch } from 'react-redux'

import Container from 'react-bootstrap/Container'
import Card from 'react-bootstrap/Card'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Form from 'react-bootstrap/Form'
import Button from 'react-bootstrap/Button'
import ProgressBar from 'react-bootstrap/ProgressBar'

import BSafesStyle from '../styles/BSafes.module.css'

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
    const [keyStrength, setKeyStrength] = useState('');
    const [keyStrengthColor, setKeyStrengthColor] = useState('danger');
    const [keyStrengthProgress, setKeyStrengthProgress] = useState();
    const [keyReady, setKeyReady] = useState(false);
    const nicknameRef = useRef(null);

    function checkKeyStrength(key) {
        debugLog(debugOn, "Checking key strength:", key.length);

        const strongRegex = new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[, !@#\$%\^&\*])(?=.{8,})");
        const mediumRegex = new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.{8,})"); ; //new RegExp("^(((?=.*[a-z])(?=.*[A-Z]))|((?=.*[a-z])(?=.*[0-9]))|((?=.*[A-Z])(?=.*[0-9])))(?=.{8,})");
        const isMedium = mediumRegex.test(key);
        let thisKeyStrength, thisKeyStrengthColor;
        if(key.length === 0) {
            thisKeyStrength = '';
        } else if(key.length >32) {
            thisKeyStrength = 'Invalid';
            thisKeyStrengthColor = 'danger';
        } else {
            thisKeyStrength = 'Invalid';
            thisKeyStrengthColor = 'danger';
            if (isMedium) {
                thisKeyStrength = 'Weak';  
                thisKeyStrengthColor = 'warning';
                const isStrong = (key.length > 15) ; //strongRegex.test(key);
                if (isStrong) {
                    thisKeyStrength = 'Strong';
                    thisKeyStrengthColor = 'success';
                }
            }
        }
        const strengthProgress = key.length / 16 * 100;
        setKeyStrength(thisKeyStrength);
        setKeyStrengthColor(thisKeyStrengthColor);
        setKeyStrengthProgress(strengthProgress); 
    }

    const keyPasswordChanged = ( password ) => {
        debugLog(debugOn, "keyPassword: ", password);
        setKeyPassword(password);
        checkKeyStrength(password);
    }

    const confirmPasswordChanged = ( password) => {
        debugLog(debugOn, "confirmPassword: ", password);
        setConfirmPassword(password);
    }

    const handleSubmit = async e => { 
        debugLog(debugOn,  "handleSubmit");
        dispatch(keySetupAsyncThunk({nickname: nicknameRef.current.value, keyPassword: keyPassword}));
    }

    useEffect(()=>{
        if((keyPassword === confirmPassword) && (keyStrength === 'Weak' || keyStrength === 'Strong')){
            setKeyReady(true);
        } else {
            setKeyReady(false);
        }
    }, [keyStrength, keyPassword, confirmPassword]);

    return (
        <div className={`${BSafesStyle.metalBackground} ${BSafesStyle.minHeight100Percent}`}>
        <ContentPageLayout showNaveBar={false} showNavbarMenu={false} showPathRow={false}> 
            <Container>
                <br />
                <br />
                <br />  
                <Row>
                    <Col sm={{ span:10, offset:1 }} lg={{ span: 6, offset: 3 }}>
                        <Card className='p-3'> 
                            <h1>Create Your BSafes</h1>
                            <hr></hr>
                            <Form>
                                <Form.Group className="mb-3" controlId="Nickname">
                                    <Form.Label>Nickname</Form.Label>
                                    <Form.Control ref={nicknameRef} size="lg" type="text" placeholder='Plase choose a nickname' />
                                </Form.Group>
                                <Form.Group key='keyPassword' className="mb-3" controlId="keyPassword">
                                    <Form.Label>Key Password</Form.Label>
                                    <KeyInput onKeyChanged={keyPasswordChanged}/>
                                    <ProgressBar variant={keyStrengthColor} now={keyStrengthProgress} />
                                    <p class={`text-${keyStrengthColor}`}>{keyStrength}</p>
                                    <Form.Text id="passwordHelpBlock" muted>
                                     . Your key must contain 8-32 characters, at least one number, one uppercase, one lowercase character; <br/>
                                     . It may contain space and special characters; <br />
                                     . Key of 16 or more characters in length is strong.
                                    </Form.Text>
                                </Form.Group>
                                
                                <Form.Group key='ConfirmkeyPassword' className="mb-3" controlId="ConfirmkeyPassword">
                                    <Form.Label>Please retype to confirm</Form.Label>
                                    <KeyInput onKeyChanged={confirmPasswordChanged}/>
                                </Form.Group>
                            </Form>
                            <br />
                            <Row>
                                <Col className='text-center'>
                                    <Button variant="dark" onClick={handleSubmit} disabled={!keyReady}>Submit</Button>
                                </Col>
                            </Row>
                        </Card>
                    </Col>           
                </Row>
                <br />
                <br />
                <br />
            </Container>
            <Scripts />
        </ContentPageLayout>
        </div>
    )
}