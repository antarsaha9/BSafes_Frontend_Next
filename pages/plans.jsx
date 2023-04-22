import { useEffect, useState, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux'
import Link from 'next/link'

import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Form from 'react-bootstrap/Form';
import Spinner from 'react-bootstrap/Spinner';

import ContentPageLayout from '../components/layouts/contentPageLayout';

import BSafesStyle from '../styles/BSafes.module.css'

import { getClientTokenThunk, subscribe } from '../reduxStore/accountSlice';

const dropin = require('braintree-web-drop-in');


export default function Safe() {
    const dispatch = useDispatch();
    const memberId = useSelector(state => state.auth.memberId);
    const clientToken = useSelector(state => state.account.clientToken);
    const activity = useSelector(state => state.account.activity);
    const paypalInstanceRef = useRef(null);
    const [selectedPlan, setSelectedPlan] = useState('testBSafesMonthly');
    const [subscribed, setSubscribed] = useState(false);
    const [payClicked, setPayClicked] = useState(false);
    const [showPayAgain, setShowPayAgain] = useState(false);
    const [showSpinner, setShowSpinner] = useState(false);

    useEffect(() => {
        if (memberId) {
            dispatch(getClientTokenThunk())
        }
    }, [memberId])

    useEffect(() => {
        if (clientToken) {
            dropin.create({
                authorization: clientToken,
                container: '#dropin-container',
            }).then(res => {
                paypalInstanceRef.current = res;
            })
        }
    }, [clientToken]);

    const handlePayClick = () => {
        setPayClicked(true);
        setShowPayAgain(false);
        setShowSpinner(true);
        paypalInstanceRef.current.requestPaymentMethod().then((payload) => {
            subscribe({
                plan: selectedPlan,
                paymentMethodNonce: payload.nonce,
            }).then(res => {
                setSubscribed(true);
            }).catch(err => {
                setPayClicked(false);
                setShowPayAgain(true);
            }).finally(() => {
                setShowSpinner(false);
            })
        })
    }
    const handleRadioChange = (e) => {
        setSelectedPlan(e.target.value);
    }
    const loading = (activity === 'Loading' || showSpinner);
    return (
        <div className={BSafesStyle.spaceBackground}>
            <ContentPageLayout>
                <Container>
                    {loading && <Spinner className={BSafesStyle.screenCenter} animation='border' />}
                    {subscribed ?
                        <>
                            <div id="thankYouForSubscription">
                                <h1>Many thanks for your subscription!</h1>
                                <Link href="/teams">Continue</Link>
                            </div>
                        </> :
                        <div id="subscribe">
                            <h1>Subscribe</h1>
                            {showPayAgain && <h3 id="payAgain">{"Sorry, it didn't succeed, please try again."}</h3>}
                            <Form as={Row}>
                                <fieldset>
                                    <legend>Please select a plan</legend>
                                    <Form.Group className="mb-3" controlId="formGroupEmail">
                                        <Form.Label lg={2}>plans</Form.Label>
                                        <Col lg={8} >
                                            <Form.Check // prettier-ignore
                                                type={'radio'}
                                                id={`default-radio`}
                                                label={`Monthly, $2.99 usd per month.`}
                                                value={'testBSafesMonthly'}
                                                checked={selectedPlan === 'testBSafesMonthly'}
                                                onChange={handleRadioChange}
                                            />
                                            <Form.Check // prettier-ignore
                                                type={'radio'}
                                                id={`default-radio`}
                                                label={`Annual, $29.99 usd per year.`}
                                                value={'testBSafesYearly'}
                                                onChange={handleRadioChange}
                                                checked={selectedPlan === 'testBSafesYearly'}
                                            />
                                        </Col>
                                    </Form.Group>
                                </fieldset>
                            </Form>
                            <br />
                            <hr />
                            <div id="dropin-container"></div>
                            {payClicked || <button onClick={handlePayClick}>Pay</button>}
                        </div>}
                </Container>
            </ContentPageLayout>
        </div>
    )
}