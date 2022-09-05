import { useEffect, useRef, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'

import Container from 'react-bootstrap/Container'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Form from 'react-bootstrap/Form'
import Button from 'react-bootstrap/Button'

import jquery from "jquery"

import { debugLog } from '../lib/helper'

import ContentPageLayout from '../components/layouts/contentPageLayout';
import Scripts from '../components/scripts'

import { logOutAsyncThunk } from '../reduxStore/auth'

export default function LogOut() {
    const debugOn = true;
    const dispatch = useDispatch();

    const scriptsLoaded = useSelector(state => state.scripts.done);

    const handleSubmit = async e => { 
        debugLog(debugOn,  "handleSubmit");

        dispatch(logOutAsyncThunk());
        
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
                        <h1>Log Out</h1>
                        <hr></hr>
                        <Form>
                            <Button variant="dark" onClick={handleSubmit}>Submit</Button>
                        </Form>
                    </Col>           
                </Row>
            </Container>
            <Scripts />
        </ContentPageLayout>
    )
}