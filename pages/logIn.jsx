import { useEffect, useRef, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import {useRouter} from "next/router";

import Container from 'react-bootstrap/Container'
import Card from 'react-bootstrap/Card'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Form from 'react-bootstrap/Form'
import Button from 'react-bootstrap/Button'

import BSafesStyle from '../styles/BSafes.module.css'

import { debugLog} from '../lib/helper'

import ContentPageLayout from '../components/layouts/contentPageLayout';
import KeyInput from "../components/keyInput";

import { logInAsyncThunk } from '../reduxStore/auth'

export default function LogIn() {
    const debugOn = false;
    const router = useRouter();
    const dispatch = useDispatch();
    
    const [keyPassword, setKeyPassword] = useState("");
    const nicknameRef = useRef(null);
    const activity = useSelector(state=>state.auth.activity);
    const isLoggedIn = useSelector(state=>state.auth.isLoggedIn);

    const keyPasswordChanged = ( password ) => {
        debugLog(debugOn, "keyPassword: ", password);
        setKeyPassword(password);
    }

    const handleSubmit = async e => { 
        debugLog(debugOn,  "handleSubmit");
        
        dispatch(logInAsyncThunk({nickname: nicknameRef.current.value, keyPassword: keyPassword }));
    }

    const handleCreate = () => {
        router.push('/keySetup');
    }

    useEffect(()=> {
        //nicknameRef.current.focus();
    }, []);

    useEffect(()=> {
        if(isLoggedIn) {
            router.push('/safe');
        }
    }, [isLoggedIn])

    return (
        <div className={BSafesStyle.safeBackground}>
        <ContentPageLayout showNavbarMenu={false} showPathRow={false}> 
            <Container >
                <br />
                <br />  
                <br />   
                <Row>
                    <Col sm={{ span:10, offset:1 }} lg={{ span: 6, offset: 3 }}>
                        <Card className='p-3'> 
                            <h1>Open your BSafes</h1>
                            <hr></hr>
                            <Form>
                                <Form.Group className="mb-3" controlId="Nickname">
                                    <Form.Label>Nickname</Form.Label>
                                    <Form.Control ref={nicknameRef} type="text" placeholder='' autoComplete="off" className={BSafesStyle.inputBox}/>
                                </Form.Group>
                                <Form.Group className="mb-3" controlId="keyPassword">
                                    <Form.Label>Key Password</Form.Label>
                                    <KeyInput onKeyChanged={keyPasswordChanged}/>
                                    <Form.Text id="passwordHelpBlock" muted>
                                        Your password must be longer than 8 characters, contain letters and numbers
                                    </Form.Text>
                                </Form.Group>
                            </Form>
                            <Row className='p-2'>
                                <Col className='text-center'>
                                    <Button variant="dark" onClick={handleSubmit} disabled={activity==="LoggingIn"}>
                                        Unlock
                                    </Button>
                                </Col>
                            </Row>
                            <Row className='p-2'>
                                <h4>New user ?
                                    <Button variant='link' onClick={handleCreate} disabled={activity==="LoggingIn"}>
                                    Create
                                    </Button>
                                </h4>
                            </Row>        
                        </Card>
                    </Col>           
                </Row>
                <br />
                <br />
                <br />
            </Container>
        </ContentPageLayout>
        </div>
    )
}