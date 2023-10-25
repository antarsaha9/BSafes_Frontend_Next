import { useEffect, useState, useRef } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import {useRouter} from "next/router";

import Container from 'react-bootstrap/Container'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Form from 'react-bootstrap/Form'
import Button from 'react-bootstrap/Button'
import Table from 'react-bootstrap/Table'

import format from "date-fns/format";
const dropin = require('braintree-web-drop-in');

import ContentPageLayout from '../components/layouts/contentPageLayout';



import { getInvoiceThunk, getPaymentClientTokenThunk, payThunk, getTransactionsThunk } from '../reduxStore/accountSlice';

import { debugLog } from '../lib/helper'

export default function Payment() {
    const debugOn = false;
    const router = useRouter();
    const dispatch = useDispatch();

    const [plan, setPlan] = useState('yearly');
    const braintreeInstanceRef = useRef(null);

    const storageUsage = useSelector(state=>state.account.storageUsage);
    const totoalStorage50GBRequired = useSelector(state=>state.account.totoalStorage50GBRequired);
    const monthlyPrice = useSelector(state=>state.account.monthlyPrice);
    let dues = useSelector(state=>state.account.dues);
    const planOptions = useSelector(state=>state.account.planOptions);
    
    let monthlyDuesDuration, yearlyDuesDuration, storageRequired;
    if(planOptions){
        if(planOptions.monthly.firstDue === planOptions.monthly.lastDue){
            monthlyDuesDuration = format(new Date(planOptions.monthly.firstDue), 'MM/dd/yyyy');
        } else {
            monthlyDuesDuration = `${format(new Date(planOptions.monthly.firstDue), 'MM/dd/yyyy')} ... ${format(new Date(planOptions.monthly.lastDue), 'MM/dd/yyyy')}`
        }
        yearlyDuesDuration = `${format(new Date(planOptions.yearly.firstDue), 'MM/dd/yyyy')} ... ${format(new Date(planOptions.yearly.lastDue), 'MM/dd/yyyy')}`
    }
    
    const dueItems = (dues.length !==0 ) && dues.toReversed().map((item, i)=> 
        <tr key={i}>
            <td>{format(new Date(item.newDueTime), 'MM/dd/yyyy')}</td>
            <td>{item.totoalStorage50GBRequired}</td>
            <td>${item.monthlyPrice}</td>
        </tr>
    )

    const isLoggedIn = useSelector(state => state.auth.isLoggedIn);
    const braintreeClientToken = useSelector(state => state.account.braintreeClientToken)
    const changePlan = (e) => {
        setPlan(e.target.value);
    }
    
    const handlePay = (e)=>[
        braintreeInstanceRef.current.requestPaymentMethod().then((payload) => {
            debugLog(debugOn, 'Payment method nonce:', payload.nonce)
            dispatch(payThunk({plan, paymentMethodNonce: payload.nonce}))
        })
    ]

    useEffect(()=>{
        if(isLoggedIn) {
            dispatch(getInvoiceThunk());
            dispatch(getPaymentClientTokenThunk());
            dispatch(getTransactionsThunk());
        }
    }, [isLoggedIn])

    useEffect(()=>{
        if(braintreeClientToken) {
            dropin.create({
                authorization: braintreeClientToken,
                container: '#dropin-container',
            }).then(res => {
                braintreeInstanceRef.current = res;
            })
        }
    }, [braintreeClientToken])

    return (
        <ContentPageLayout> 
            <Container>
                <br />
                <br />
                <Row>
                    <Col sm={{span:8, offset:2}}>
                        <h1>Invoice</h1>
                        <p>Your current storage usage is {(storageUsage/1000000000).toFixed(3)} GB. </p>
                        <p> {totoalStorage50GBRequired}GB storage is required.</p>
                        <h5>Dues:</h5>
                        <Table>
                            <thead>
                                <tr>
                                    <th>Date</th>
                                    <th>Storage(GB)</th>
                                    <th>Due(USD)</th>
                                </tr>
                            </thead>
                            <tbody>
                                {dueItems}
                            </tbody>
                        </Table>
                        <hr />
                    </Col>                  
                </Row>
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
                                    value='monthly'  
                                    onChange = {changePlan}
                                    checked={plan==='monthly'}
                                />
                                {planOptions && `$${planOptions.monthly.totalDues} USD. For ${monthlyDuesDuration}. Next due date:  ${format(new Date(planOptions.monthly.nextDueTime), 'MM/dd/yyyy')}`}
                                <hr />
                                <Form.Check
                                    type='radio'
                                    id='payYearly'
                                    label='Pay Yearly, get 2 months free.'
                                    value='yearly'
                                    onChange = {changePlan}
                                    checked={plan==='yearly'}
                                />
                                {planOptions && `$${planOptions.yearly.totalDues} USD. For ${yearlyDuesDuration}. Next due date:  ${format(new Date(planOptions.yearly.nextDueTime), 'MM/dd/yyyy')}`}
                            </Form.Group>
                        </Form>
                        <hr />
                    </Col>
                </Row>
                <Row>
                    <Col sm={{span:8, offset:2}}>
                        <div id="dropin-container"></div>
                        <Button className='pull-right' onClick={handlePay}>Pay</Button>
                    </Col>
                </Row>

                <Row>
                    <Col sm={{span:8, offset:2}}>
                        <h1>Transactions</h1>     
                        <hr />
                    </Col>                  
                </Row>
            </Container>
        </ContentPageLayout>
    )
}