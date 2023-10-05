import { useEffect, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import {useRouter} from "next/router";

import Container from 'react-bootstrap/Container'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Form from 'react-bootstrap/Form'
import Button from 'react-bootstrap/Button'
import Spinner from 'react-bootstrap/Spinner';

import { debugLog } from '../lib/helper'

import ContentPageLayout from '../components/layouts/contentPageLayout';

export default function Payment() {
    const debugOn = false;
    const router = useRouter();
    const dispatch = useDispatch();

    const [plan, setPlan] = useState('payYearly');

    const changePlan = (e) => {
        setPlan(e.target.value);
    }

    return (
        <ContentPageLayout> 
            <Container>
                <br />
                <br />     
                <Row>
                    <Col sm={{span:8, offset:2}}>
                        <h1>Payment</h1>     
                        <hr />
                    </Col>                  
                </Row>
                
                <Row>
                    <Col sm={{span:8, offset:2}}>
                        <Form>  
                            <Form.Group controlId='plan'>
                                <Form.Check
                                    type='radio'
                                    id='payMonthly'
                                    label='Pay Monthly'
                                    value='payMonthly'  
                                    onChange = {changePlan}
                                    checked={plan==='payMonthly'}
                                />
                                <p>2.95 USD for 50GB storage</p>
                                <hr />
                                <Form.Check
                                    type='radio'
                                    id='payYearly'
                                    label='Pay Yearly, get 2 months free.'
                                    value='payYearly'
                                    onChange = {changePlan}
                                    checked={plan==='payYearly'}
                                />
                                <p>29.50 USD for 50GB Storage</p>
                            </Form.Group>
                        </Form>
                        <hr />
                    </Col>
                </Row>
            </Container>
        </ContentPageLayout>
    )
}