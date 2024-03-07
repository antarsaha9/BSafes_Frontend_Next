import { useEffect, useState, useRef } from 'react'
import { useSelector, useDispatch } from 'react-redux'

import Container from 'react-bootstrap/Container'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Form from 'react-bootstrap/Form'
import Button from 'react-bootstrap/Button'
import Table from 'react-bootstrap/Table'

import { loadStripe } from '@stripe/stripe-js';
import {Elements} from '@stripe/react-stripe-js';

import format from "date-fns/format";

import ContentPageLayout from '../../components/layouts/contentPageLayout';
import LoadStripe from '../../components/loadStripe'
import CheckoutForm from '../../components/checkoutForm'

import { getInvoiceThunk, getTransactionsThunk, createPaymentIntentThunk } from '../../reduxStore/accountSlice';

import { debugLog } from '../../lib/helper'

export default function Payment() {
    const debugOn = false;

    const dispatch = useDispatch();

    const [stripePromise, setStripePromise] = useState(null);
    const [plan, setPlan] = useState('yearly');

    const isLoggedIn = useSelector(state => state.auth.isLoggedIn);
    const storageUsage = useSelector(state => state.account.storageUsage);
    const totoalStorage50GBRequired = useSelector(state => state.account.totoalStorage50GBRequired);
    const nextDueTime = useSelector(state => state.account.nextDueTime);
    const monthlyPrice = useSelector(state => state.account.monthlyPrice);
    const dues = useSelector(state => state.account.dues);
    const stripeClientSecret = useSelector(state => state.account.stripeClientSecret);
    const planOptions = useSelector(state => state.account.planOptions);
    const transactions = useSelector(state => state.account.transactions);

    let storageUsageString;
    if (storageUsage < 1000000) {
        storageUsageString = (storageUsage / (1000000)).toFixed(3) + ' MB';
    } else {
        storageUsageString = (storageUsage / (1000000000)).toFixed(3) + ' GB';
    }

    let monthlyDuesDuration, yearlyDuesDuration, storageRequired;
    if (planOptions) {
        if (planOptions.monthly.firstDue === planOptions.monthly.lastDue) {
            monthlyDuesDuration = format(new Date(planOptions.monthly.firstDue), 'MM/dd/yyyy');
        } else {
            monthlyDuesDuration = `${format(new Date(planOptions.monthly.firstDue), 'MM/dd/yyyy')} ... ${format(new Date(planOptions.monthly.lastDue), 'MM/dd/yyyy')}`
        }
        yearlyDuesDuration = `${format(new Date(planOptions.yearly.firstDue), 'MM/dd/yyyy')} ... ${format(new Date(planOptions.yearly.lastDue), 'MM/dd/yyyy')}`
    }

    const dueItems = (dues.length !== 0) && dues.toReversed().map((item, i) =>
        <tr key={i}>
            <td>{format(new Date(item.newDueTime), 'MM/dd/yyyy')}</td>
            <td>{item.totoalStorage50GBRequired}</td>
            <td>${item.monthlyPrice}</td>
        </tr>
    )

    const transactionItems = (transactions.length !== 0) && transactions.map((item, i) =>
        <tr key={i}>
            <td>{format(new Date(item.time), 'MM/dd/yyyy')}</td>
            <td>${item.totalDues}</td>
            <td>{item.plan}</td>
            <td>{item.firstDue === item.lastDue ? format(new Date(item.firstDue), 'MM/dd/yyyy') : `${format(new Date(item.firstDue), 'MM/dd/yyyy')} - ${format(new Date(item.lastDue), 'MM/dd/yyyy')}`}</td>
        </tr>
    )

    const changePlan = (e) => {
        setPlan(e.target.value);
    }

    const handlePay = (e) => [

    ]

    useEffect(() => {
        if (isLoggedIn) {
            dispatch(getInvoiceThunk());
            dispatch(createPaymentIntentThunk());
            dispatch(getTransactionsThunk());
        }
    }, [isLoggedIn])

    return (
        <ContentPageLayout>
            <Container>
                <br />
                <br />
                <Row>
                    <Col sm={{ span: 8, offset: 2 }}>
                        <p>Your current storage usage is {storageUsageString}. </p>
                        <p> {totoalStorage50GBRequired}GB storage is required, ${monthlyPrice} USD per month.</p>
                        {(dues.length === 0) &&
                            <p>Next due date is {format(new Date(nextDueTime), 'MM/dd/yyyy')}</p>
                        }
                    </Col>
                </Row>
                <Row>
                    {stripeClientSecret && stripePromise && (
                        <Elements stripe={stripePromise} options={{ clientSecret: stripeClientSecret, }}>
                            <CheckoutForm />
                        </Elements>
                    )}
                </Row>
                {(dues.length !== 0) &&
                    <Row>
                        <Col sm={{ span: 8, offset: 2 }}>
                            <hr />
                            <h1>Invoice</h1>
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
                }
                {(dues.length !== 0) && <>
                    <Row>
                        <Col sm={{ span: 8, offset: 2 }}>
                            <h1>Payment</h1>
                        </Col>
                    </Row>

                    <Row>
                        <Col sm={{ span: 8, offset: 2 }}>
                            <Form>
                                <Form.Group controlId='plan'>
                                    <hr />
                                    <Form.Check
                                        type='radio'
                                        id='payYearly'
                                        label='Pay Yearly, get 2 months free.'
                                        value='yearly'
                                        onChange={changePlan}
                                        checked={plan === 'yearly'}
                                    />
                                    {planOptions && `$${planOptions.yearly.totalDues} USD. For ${yearlyDuesDuration}. Next due date:  ${format(new Date(planOptions.yearly.nextDueTime), 'MM/dd/yyyy')}`}
                                    <hr />
                                    <Form.Check
                                        type='radio'
                                        id='payMonthly'
                                        label='Pay Monthly'
                                        value='monthly'
                                        onChange={changePlan}
                                        checked={plan === 'monthly'}
                                    />
                                    {planOptions && `$${planOptions.monthly.totalDues} USD. For ${monthlyDuesDuration}. Next due date:  ${format(new Date(planOptions.monthly.nextDueTime), 'MM/dd/yyyy')}`}
                                    <hr />
                                </Form.Group>
                            </Form>

                        </Col>
                    </Row>
                    <Row>
                        <Col sm={{ span: 8, offset: 2 }}>
                            <Button className='pull-right' onClick={handlePay}>Pay</Button>
                        </Col>
                    </Row>
                </>}

                <Row>
                    <Col sm={{ span: 8, offset: 2 }}>
                        <hr />
                        <h1>Transactions</h1>
                        <Table>
                            <thead>
                                <tr>
                                    <th>Date</th>
                                    <th>Amount</th>
                                    <th>Plan</th>
                                    <th>Paid Duration</th>
                                </tr>
                            </thead>
                            {(transactions.length !== 0) &&
                                <tbody>
                                    {
                                        transactionItems
                                    }
                                </tbody>
                            }
                        </Table>
                        {(transactions.length === 0) &&
                            <p>Empty</p>
                        }
                    </Col>
                </Row>
            </Container>
            <LoadStripe setStripePromise={setStripePromise}/>
        </ContentPageLayout>
    )
}