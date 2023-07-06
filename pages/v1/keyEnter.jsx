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
import { verifyKeyHashAsyncThunk } from '../../reduxStore/v1AccountSlice';

import ContentPageLayout from '../../components/layouts/contentPageLayout';

export default function KeyEnter() {
    const debugOn = true;

    const dispatch = useDispatch();
    const router = useRouter();

    const nextAuthStep = useSelector(state=> state.v1Account.nextAuthStep);
    const accountVersion = useSelector( state=> state.auth.accountVersion);
    const isLoggedIn = useSelector(state=>state.auth.isLoggedIn);
    
    const keyHint = nextAuthStep && nextAuthStep.keyHint;

    const [key, setKey] = useState('');

    const handleKey = (e) => {
        setKey(e.target.value);
    }

    const handleGo = (e) => {
        dispatch(verifyKeyHashAsyncThunk({key}));
    }

    useEffect(()=> {
        if(isLoggedIn) {
            router.push('/teams');
        }
    }, [isLoggedIn])

    return (
        <div className={BSafesStyle.managedMemberLoginBackground}>
            <ContentPageLayout showNavbarMenu={accountVersion === 'v1'} showPathRow={false}> 
                <Container className="mt-5">
                    <br />
                    <br />   
                    <Row>
                        <Col xs={{span:10, offset:1}} sm={{span:10, offset:1}} md={{span:8, offset:2}} lg={{span:6, offset:3}}>
                            <Form className="text-center" style={{backgroundColor:'white'}}>
                                <br />
                                <h1 className="display-3"><i className="fa fa-2x fa-lock" aria-hidden="true"></i></h1>
                                <p>{keyHint}</p>
                                <p>Enter Your Key</p>
                                <Row>
                                    <Col xs={{span:10, offset:1}} sm={{span:8, offset:2}} md={{span:6, offset:3}} lg={{span:6, offset:3}}>
                                        <InputGroup className="mb-3">
                                            <Form.Control className="py-2"
                                                type="password"
                                                placeholder=""
                                                aria-label="Recipient's username"
                                                aria-describedby="basic-addon2"
                                                value={key}
                                                onChange={handleKey}
                                            />
                                            <Button variant="primary" id="button-addon2" className="py-0" onClick={handleGo}>
                                                Go
                                            </Button>
                                        </InputGroup>
                                    </Col>
                                </Row>
                                <p>Key verification would take a few seconds...</p>
                                <br />
                            </Form>                      
                        </Col>
                    </Row>
                </Container>
            </ContentPageLayout>
        </div>
    )
}