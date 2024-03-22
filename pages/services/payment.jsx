import { useEffect, useState, useRef } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useRouter } from 'next/router'

import Container from 'react-bootstrap/Container'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Form from 'react-bootstrap/Form'
import Button from 'react-bootstrap/Button'
import Table from 'react-bootstrap/Table'

import format from "date-fns/format";

import ContentPageLayout from '../../components/layouts/contentPageLayout';

import { getInvoiceThunk, getTransactionsThunk, setCheckoutPlan } from '../../reduxStore/accountSlice';

import { debugLog } from '../../lib/helper'

export default function Payment() {
    const debugOn = false;

    const router = useRouter();
    const dispatch = useDispatch();

    const [plan, setPlan] = useState('yearly');

    const isLoggedIn = useSelector(state => state.auth.isLoggedIn);
    const invoice = useSelector(state => state.account.invoice);
    const transactions = useSelector(state => state.account.transactions);

    const dueTime = invoice && invoice.dueTime;
    const dues = invoice && invoice.dues;
    const planOptions = invoice && invoice.planOptions;
    const storageUsage = invoice && invoice.monthlyInvoice.storageUsage;
    const requiredStorage = invoice && invoice.monthlyInvoice.requiredStorage;
    const monthlyPrice = invoice && invoice.monthlyInvoice.monthlyPrice;

    const remainingDays = invoice && invoice.remainingDays;
    const upgradePrice = invoice && invoice.upgradePrice;
    const waived = invoice && invoice.waived;

    let storageUsageString;
    if (storageUsage) {
        if (storageUsage < 1000000) {
            storageUsageString = (storageUsage / (1000000)).toFixed(3) + ' MB';
        } else {
            storageUsageString = (storageUsage / (1000000000)).toFixed(3) + ' GB';
        }
    }

    let monthlyDuesDuration, yearlyDuesDuration;
    if (planOptions) {
        if (planOptions.monthly.firstDue === planOptions.monthly.lastDue) {
            monthlyDuesDuration = format(new Date(planOptions.monthly.firstDue), 'MM/dd/yyyy');
        } else {
            monthlyDuesDuration = `${format(new Date(planOptions.monthly.firstDue), 'MM/dd/yyyy')} ... ${format(new Date(planOptions.monthly.lastDue), 'MM/dd/yyyy')}`
        }
        yearlyDuesDuration = `${format(new Date(planOptions.yearly.firstDue), 'MM/dd/yyyy')} ... ${format(new Date(planOptions.yearly.lastDue), 'MM/dd/yyyy')}`
    }

    const dueItems = dues && (dues.length !== 0) && dues.toReversed().map((item, i) =>
        <tr key={i}>
            <td>{format(new Date(item.dueTime), 'MM/dd/yyyy')}</td>
            <td>{item.monthlyInvoice.requiredStorage}</td>
            <td>${item.monthlyInvoice.monthlyPrice}</td>
        </tr>
    )

    const transactionItems = (transactions.length !== 0) && transactions.map((item, i) =>
        <tr key={i}>
            <td>{format(new Date(item.time), 'MM/dd/yyyy')}</td>
            <td>{`$${item.amount} ${item.currency}`}</td>
            <td>{item.plan}</td>
            <td>{item.firstDue === item.lastDue ? format(new Date(item.firstDue), 'MM/dd/yyyy') : `${format(new Date(item.firstDue), 'MM/dd/yyyy')} - ${format(new Date(item.lastDue), 'MM/dd/yyyy')}`}</td>
        </tr>
    )

    const changePlan = (e) => {
        setPlan(e.target.value);
    }

    const handleCheckout = (e) => {
        dispatch(setCheckoutPlan(plan));
        router.push('/services/checkout');
    }

    const handleUpgrade = (e) => {
        dispatch(setCheckoutPlan('upgrade'));
        router.push('/services/checkout');
    }

    useEffect(() => {
        if (isLoggedIn) {
            dispatch(getInvoiceThunk());
            dispatch(getTransactionsThunk());
        }
    }, [isLoggedIn])

    return (
        <ContentPageLayout>
            <Container>
                <br />
                <br />
                {dues && <>
                    <Row>
                        <Col sm={{ span: 8, offset: 2 }}>
                            <p>Your current storage usage is {storageUsageString}. </p>
                            <p> You need the {requiredStorage} storage, ${monthlyPrice} USD per month.</p>
                            {(dues.length === 0) &&
                                <p>Next due date is {format(new Date(dueTime), 'MM/dd/yyyy')}</p>
                            }
                        </Col>
                    </Row>
                    {(dues.length !== 0) &&
                        <Row>
                            <Col sm={{ span: 8, offset: 2 }}>
                                <hr />
                                <h1>Invoice</h1>
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
                                <h1>Total : {`$${planOptions.monthly.totalDues} USD`}</h1>
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
                                            label='Pay yearly, get 2 months free.'
                                            value='yearly'
                                            onChange={changePlan}
                                            checked={plan === 'yearly'}
                                        />
                                        <br />
                                        <h4>{planOptions && `$${planOptions.yearly.totalDues} USD.`}</h4>
                                        <p>{planOptions && `For ${yearlyDuesDuration}.`}</p>
                                        <p>{planOptions && `Next due date:  ${format(new Date(planOptions.yearly.nextDueTime), 'MM/dd/yyyy')}`}</p>
                                        <hr />
                                        <Form.Check
                                            type='radio'
                                            id='payMonthly'
                                            label='Pay monthly.'
                                            value='monthly'
                                            onChange={changePlan}
                                            checked={plan === 'monthly'}
                                        />
                                        <br />
                                        <h4>{planOptions && `$${planOptions.monthly.totalDues} USD.`}</h4>
                                        <p>{planOptions && `For ${monthlyDuesDuration}.`}</p>
                                        <p>{planOptions && `Next due date:  ${format(new Date(planOptions.monthly.nextDueTime), 'MM/dd/yyyy')}`}</p>
                                        <hr />
                                    </Form.Group>
                                </Form>

                            </Col>
                        </Row>
                        <Row>
                            <Col sm={{ span: 8, offset: 2 }} className='text-center'>
                                <Button onClick={handleCheckout}>Checkout</Button>
                            </Col>
                        </Row>
                    </>}
                </>}
                {upgradePrice && <>
                    <Row>
                        <Col sm={{ span: 8, offset: 2 }}>
                            <p>Your current storage usage is {storageUsageString}. </p>
                            <p>You need the {requiredStorage} storage, ${monthlyPrice} USD per month.</p>
                            <p>Next due date is {format(new Date(dueTime), 'MM/dd/yyyy')}</p>
                            <p>Upgrade price for the remaining {remainingDays} days until the next due date - </p>
                            <p>{upgradePrice}</p>
                            {waived ?
                                <p>The fee is waived because it is less than one dollar.</p>
                                :
                                <Row>
                                    <Col sm={{ span: 8, offset: 2 }} className='text-center'>
                                        <Button onClick={handleUpgrade}>Upgrade</Button>
                                    </Col>
                                </Row>
                            }

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
        </ContentPageLayout>
    )
}