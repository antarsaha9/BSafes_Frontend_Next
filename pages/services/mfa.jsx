import { useEffect, useState, useRef } from 'react'
import { useSelector, useDispatch } from 'react-redux'

import Container from 'react-bootstrap/Container'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button'

import BSafesStyle from '../../styles/BSafes.module.css'
import ContentPageLayout from "../../components/layouts/contentPageLayout";

export default function MFA() {
    
    const isLoggedIn = useSelector(state => state.auth.isLoggedIn);

    useEffect(()=>{
        if(isLoggedIn) {
            dispatch(getInvoiceThunk());
            dispatch(getPaymentClientTokenThunk());
            dispatch(getTransactionsThunk());
        }
    }, [isLoggedIn]);

    return (
        <ContentPageLayout> 
            <Container>
                <br />
                <br />
                {true ?
                <>
                    <Row>
                        <h1>Turn On MFA</h1>
                    </Row>
                    <Row>
                        <h4>Step 1. Open your MFA authenticator app., or download one if you don&#39t have any;</h4>
                    </Row>
                    <Row>
                        <h4>Step 2. Add an account by scanning the following QR code;</h4>
                    </Row>
                    <Row>
                        <h4>Step 3. Enter the token displayed on your app, then verify.</h4>
                    </Row>
                    <Row>
                        <Col xx={6}>
                            <Form.Control className={BSafesStyle.inputBox} size="lg" type="text" placeholder="" />
                        </Col>  
                        <Col xs={6}>
                            <Button variant="primary">Verify</Button>
                        </Col>             
                    </Row>
                    <Row>
                        <h4>Step 4. Store your recovery phrase in a secure location. You would need the recovery phrase if you lost your MFA account.</h4>
                    </Row>
                </> :
                <>
                    Turn Off MFA
                </>
                }
            </Container>
        </ContentPageLayout> 
    );
}