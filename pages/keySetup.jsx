import { useEffect, useRef, useState } from 'react'
import { useDispatch } from 'react-redux'
import Link from 'next/link';

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
import PrivacyPolicyModal from '../components/privacyPolicyModal';
import TermsOfServiceModal from '../components/termsOfServiceModal';
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
    const [showPrivacy, setShowPrivacy] = useState(false);
    const [showTerms, setShowTerms] = useState(false);
    const nicknameRef = useRef(null);

    function checkKeyStrength(key) {
        debugLog(debugOn, "Checking key strength:", key.length);

        const mediumRegex = new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[, !@#\$%\^&\*])(?=.{8,})");; //new RegExp("^(((?=.*[a-z])(?=.*[A-Z]))|((?=.*[a-z])(?=.*[0-9]))|((?=.*[A-Z])(?=.*[0-9])))(?=.{8,})");
        const isMedium = mediumRegex.test(key);
        let thisKeyStrength, thisKeyStrengthColor;
        if (key.length === 0) {
            thisKeyStrength = '';
        } else {
            thisKeyStrength = 'Invalid';
            thisKeyStrengthColor = 'danger';
            if (isMedium) {
                thisKeyStrength = 'Weak';
                thisKeyStrengthColor = 'warning';
                const isStrong = (key.length > 15); //strongRegex.test(key);
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

    const keyPasswordChanged = (password) => {
        debugLog(debugOn, "keyPassword: ", password);
        setKeyPassword(password);
        checkKeyStrength(password);
    }

    const confirmPasswordChanged = (password) => {
        debugLog(debugOn, "confirmPassword: ", password);
        setConfirmPassword(password);
    }

    const handlePrivacy = (e) => {
        e.preventDefault();
        setShowPrivacy(true);
    }

    const handlePrivacyCallback = () => {
        setShowPrivacy(false);
    }

    const handleTerms = (e) => {
        e.preventDefault();
        setShowTerms(true);
    }

    const handleTermsCallback = () => {
        setShowTerms(false);
    }

    const handleSubmit = async e => {
        debugLog(debugOn, "handleSubmit");
        dispatch(keySetupAsyncThunk({ nickname: nicknameRef.current.value, keyPassword: keyPassword }));
    }

    useEffect(() => {
        if ((keyPassword === confirmPassword) && (keyStrength === 'Weak' || keyStrength === 'Strong')) {
            setKeyReady(true);
        } else {
            setKeyReady(false);
        }
    }, [keyStrength, keyPassword, confirmPassword]);

    return (
        <div className={`${BSafesStyle.metalBackground} ${BSafesStyle.minHeight100Percent}`}>
            <ContentPageLayout showNaveBar={false} showNavbarMenu={false} showPathRow={false}>
                <Container>
                    <Row className={BSafesStyle.keyPanel}>
                        <Col sm={{ span: 10, offset: 1 }} lg={{ span: 6, offset: 3 }}>
                            <Card className='p-3'>
                                <h1>Own Your <span style={{ backgroundColor: '#990000', color: 'white', fontWeight: 'bold', padding: '7px' }}>BSafes</span></h1>
                                <hr></hr>
                                <Form>
                                    <Form.Group className="mb-3" controlId="Nickname">
                                        <Form.Label>Nickname</Form.Label>
                                        <Form.Control ref={nicknameRef} size="lg" type="text" placeholder='Please give it a nickname' />
                                    </Form.Group>
                                    <Form.Group key='keyPassword' className="mb-3" controlId="keyPassword">
                                        <Form.Label>Key Password</Form.Label>
                                        <KeyInput onKeyChanged={keyPasswordChanged} />
                                        <ProgressBar variant={keyStrengthColor} now={keyStrengthProgress} />
                                        <p className={`text-${keyStrengthColor}`}>{keyStrength}</p>
                                        <Form.Text id="passwordHelpBlock" muted>
                                            . Your password must be at least 8 characters long, with at least one number, one uppercase, one lowercase character, and one symbol; <br />
                                            . A key of 16 or more characters in length is better.
                                        </Form.Text>
                                    </Form.Group>

                                    <Form.Group key='ConfirmkeyPassword' className="mb-3" controlId="ConfirmkeyPassword">
                                        <Form.Label>Please retype to confirm</Form.Label>
                                        <KeyInput onKeyChanged={confirmPasswordChanged} />
                                    </Form.Group>
                                </Form>
                                <br />
                                <p className='text-cent'>You agree to our <Link onClick={handlePrivacy} href='/public/privacyPolicy' style={{textDecoration: 'none'}}>Privacy Policy</Link> and <Link onClick={handleTerms} href='/public/termsOfService' style={{textDecoration: 'none'}}>Terms of Service</Link> by clicking GO.</p>
                                <Row>
                                    <Col className='text-center'>
                                        <Button variant="dark" onClick={handleSubmit} disabled={!keyReady}>Go</Button>
                                    </Col>
                                </Row>
                                <Row>
                                    <Col className='text-end'>
                                        <Link href='/logIn' style={{textDecoration: 'none', fontSize:'0.8rem'}}>Open Your BSafes</Link>
                                    </Col>
                                </Row>
                                {showPrivacy && <PrivacyPolicyModal callback={handlePrivacyCallback} />}
                                {showTerms && <TermsOfServiceModal callback={handleTermsCallback} />}
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