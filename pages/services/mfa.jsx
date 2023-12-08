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

    const tokenRef = useRef(null);
    const wordsRef = useRef(null);

    const isLoggedIn = useSelector(state=>state.auth.isLoggedIn);

    const handleVerify = () => {
        try {
            dispatch(verifyMFATokenThunk({token}));
            setToken('');
        } catch (error) {
            alert(error);
        }
    }

    const handleRecover = () => {
        setLostMFA(false);
        setRecoveryWords('');
        dispatch(recoverMFAThunk({recoveryWords}));
    }

    useEffect(()=> {
        tokenRef.current.focus();
    }, []);

    useEffect(()=> {
        if(isLoggedIn) {
            router.push('/safe');
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
                        <Row>
                            <Col>
                                <Button size='sm' className='pull-left' variant="link" onClick={()=>setLostMFA(true)}>lost ?</Button>
                            </Col>
                        </Row>
                        <Modal show={lostMFA} fullscreen={true} onHide={() => setLostMFA(false)}>
                            <Modal.Header closeButton>
                                <Modal.Title>2FA Recovery Words</Modal.Title>
                            </Modal.Header>
                            <Modal.Body>
                                <p>Please enter your recovery words. Using recovery words is the only way to pass the 2FA step.</p>
                            
                                <Row>
                                    <Col>
                                        <Form.Control ref={wordsRef} className={BSafesStyle.inputBox} size="lg" type="text" placeholder="" value={recoveryWords} onChange={e => setRecoveryWords(e.target.value)} />
                                    </Col>
                                </Row>
                                <br />
                                <Row>
                                    <Col>
                                        <Button className='pull-right' variant="primary" onClick={handleRecover}>Recover</Button>
                                    </Col>
                                </Row>
                            
                            </Modal.Body>
                        </Modal>
                    </Card>
                </div>
            </Container>
        </ContentPageLayout>    
    )
}