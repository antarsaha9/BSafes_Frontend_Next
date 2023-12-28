import { useEffect, useRef, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import {useRouter} from "next/router";

import Container from 'react-bootstrap/Container'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Form from 'react-bootstrap/Form'
import InputGroup from 'react-bootstrap/InputGroup';
import Button from 'react-bootstrap/Button'
import Spinner from 'react-bootstrap/Spinner';

import BSafesStyle from '../../styles/BSafes.module.css'

import { debugLog} from '../../lib/helper'

import ContentPageLayout from '../../components/layouts/contentPageLayout';
import KeyInput from "../../components/keyInput";

import { verifyMFAAsyncThunk } from '../../reduxStore/v1AccountSlice';

export default function ExtraMFA() {
    const debugOn = false;

    const dispatch = useDispatch();
    const router = useRouter();

    const [MFAToken, setMFAToken] = useState('');

    const activity = useSelector(state=>state.v1Account.activity);
    const nextAuthStep = useSelector(state=> state.v1Account.nextAuthStep);

    const handleMFAToken = (e) => {
        setMFAToken(e.target.value);    
    }

    const handleVerify = (e) => {
        dispatch(verifyMFAAsyncThunk({MFAToken}))
    }

    useEffect(()=>{
        if(!nextAuthStep) return;
        switch(nextAuthStep.step){
            case 'KeyRequired':
                router.push('/v1/keyEnter');
                break;
            default:
        }
    }, [nextAuthStep]);

    return (
        <div className={BSafesStyle.managedMemberLoginBackground}>
            <ContentPageLayout showNavbarMenu={false} showPathRow={false}> 
                <Container className="mt-5">
                    <Row className='text-center'>
                        <h1 className='display-5'>Multi-Factor Authentication</h1>
                    </Row>
                    <br />
                    <Row>
                        <Col xs={{span:6, offset:3}} sm={{span:6, offset:3}} md={{span:6, offset:3}} lg={{span:6, offset:3}}>
                            <Form.Group className="mb-3" controlId="MFA">
                                <Form.Label>Please enter the token</Form.Label>
                                <Form.Control className='py-2' type="text" value={MFAToken} onChange={handleMFAToken} placeholder='' autoComplete="off" />
                            </Form.Group>
                            <Button variant="primary" className="py-2" onClick={handleVerify}>
                                {activity === 'VerifyMFA'?
                                    <Spinner animation='border' />
                                    :
                                    'Verify'
                                }
                            </Button>
                            {activity === 'InvalidMFA' && 
                                <p className="text-danger">Invalid Token</p>
                            }
                        </Col>
                    </Row>
                </Container>
            </ContentPageLayout>
        </div>
    )
}