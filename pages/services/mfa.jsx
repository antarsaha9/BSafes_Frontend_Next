import { useEffect, useState, useRef } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useRouter } from 'next/router'

import Container from 'react-bootstrap/Container'
import Card from 'react-bootstrap/Card'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button'
import Modal from "react-bootstrap/Modal";

import BSafesStyle from '../../styles/BSafes.module.css'
import ContentPageLayout from "../../components/layouts/contentPageLayout";

import { verifyMFATokenThunk, recoverMFAThunk } from '../../reduxStore/auth'

import { debugLog } from '../../lib/helper'

export default function MFA() {
    const debugOn = false;

    const router = useRouter();
    const dispatch = useDispatch();

    const [token, setToken] = useState('');
    const [lostMFA, setLostMFA] = useState(false);
    const [recoveryWords, setRecoveryWords] = useState('');
    const recoveryFileInputRef = useRef(null);

    const tokenRef = useRef(null);
    const wordsRef = useRef(null);

    const dataCenterSelected = !!useSelector(state=>state.auth.dataCenterKey);
    const mfa = useSelector(state => state.auth.mfa);
    const isLoggedIn = useSelector(state => state.auth.isLoggedIn);

    const handleVerify = () => {
        try {
            dispatch(verifyMFATokenThunk({ token }));
            setToken('');
        } catch (error) {
            alert(error);
        }
    }

    const handleRecover = () => {
        setLostMFA(false);
        setRecoveryWords('');
        dispatch(recoverMFAThunk({ recoveryWords }));
    }

    const handleRecoveryFile = (e) => {
        e.preventDefault();
        debugLog(debugOn, "handleRecoveryFile: ", e.target.id);
        const file = e.target.files[0];
        const reader = new FileReader();

        reader.addEventListener(
            "load",
            () => {
                // this will then display a text file
                dispatch(recoverMFAThunk({ recoveryWords: reader.result}));
            },
            false,
        );

        if (file) {
            reader.readAsText(file);
        }
    }

    const handleRecoveryFileButton = (e) => {
        debugLog(debugOn, "handleRecoveryFile");
        e.preventDefault();
        recoveryFileInputRef.current.value = null;
        recoveryFileInputRef.current?.click();
    };

    useEffect(() => {
        tokenRef.current.focus();
    }, []);

    useEffect(()=> {
        if(isLoggedIn) {
            if (dataCenterSelected)
                router.push('/safe');
            else
               router.push('/services/dataCenterSetup');
        }
    }, [isLoggedIn]);

    return (
        <ContentPageLayout>
            <Container>
                <div className='m-3'>
                    <br />
                    <br />
                    <Card className='p-3'>
                        <Row>
                            <h1>Second-Factor Authentication (2FA)</h1>
                            <h6>Please enter the token</h6>
                        </Row>
                        <Row>
                            <Col xs={4} md={3}>
                                <Form.Control ref={tokenRef} className={BSafesStyle.inputBox} size="lg" type="text" placeholder="" value={token} onChange={e => setToken(e.target.value)} />
                            </Col>
                            <Col xs={8} md={9}>
                                <Button variant="primary" onClick={handleVerify}>Verify</Button>
                            </Col>
                        </Row>
                        {(mfa && !mfa.passed) &&
                            <Row>
                                <Col>
                                    <p style={{ color: 'red' }}>Authentication failed!</p>
                                </Col>
                            </Row>}
                        <Row>
                            <Col>
                                <Button size='sm' className='pull-left' variant="link" onClick={() => setLostMFA(true)}>lost ?</Button>
                            </Col>
                        </Row>
                        <Modal show={lostMFA} fullscreen={true} onHide={() => setLostMFA(false)}>
                            <Modal.Header closeButton>
                                <Modal.Title>2FA Recovery Words</Modal.Title>
                            </Modal.Header>
                            <Modal.Body>
                                <p>If you lose your 2FA authenticator account, using recovery words is the only way to pass the 2FA step.</p>
                                <p>You can either enter your account recovery words below</p>
                                <Row>
                                    <Col>
                                        <Form.Control ref={wordsRef} className={BSafesStyle.inputBox} size="lg" type="text" placeholder="" value={recoveryWords} onChange={e => setRecoveryWords(e.target.value)} />
                                    </Col>
                                </Row>
                                <br />
                                <Row>
                                    <Col className='text-center'>
                                        <Button variant="primary" onClick={handleRecover}>Recover</Button>
                                    </Col>
                                </Row>
                                <br />
                                <p>or open your 2FA recovery file.</p>
                                <div className="recoveryFile">
                                    <input ref={recoveryFileInputRef} onChange={handleRecoveryFile} type="file" id="recoveryFile" className="d-none editControl" />
                                    <Row>
                                        <Col id="recoveryFile" sm={{ span: 10, offset: 1 }} md={{ span: 8, offset: 2 }} className={`text-center`}>
                                            <Button id="recoveryFile" onClick={handleRecoveryFileButton} variant="link" className="text-dark btn btn-labeled">
                                                <h4><i id="recoveryFile" className="fa fa-paperclip fa-lg" aria-hidden="true"></i></h4>
                                            </Button>
                                        </Col>
                                    </Row>
                                </div>
                            </Modal.Body>
                        </Modal>
                    </Card>
                </div>
            </Container>
        </ContentPageLayout>
    )
}