import { useEffect, useState, useRef } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useRouter } from 'next/router'

import Container from 'react-bootstrap/Container'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'

import { Elements } from '@stripe/react-stripe-js';

import ContentPageLayout from '../../components/layouts/contentPageLayout';
import LoadStripe from '../../components/loadStripe'
import CheckoutForm from '../../components/checkoutForm'

import { accountActivity } from '../../lib/activities'
import { createPaymentIntentThunk, createApplePaymentIntentThunk, setApplePaymentIntentData, reportAnAppleTransactionThunk, activityStart, activityDone, clearAppleClientSecret } from '../../reduxStore/accountSlice';

import { debugLog } from '../../lib/helper'

export default function Checkout() {
    const debugOn = true;

    const router = useRouter();
    const dispatch = useDispatch();

    const [stripePromise, setStripePromise] = useState(null);

    const isLoggedIn = useSelector(state => state.auth.isLoggedIn);
    const stripeClientSecret = useSelector(state => state.account.stripeClientSecret);
    const appleClientSecret = useSelector(state => state.account.appleClientSecret)
    const checkoutItem = useSelector(state => state.account.checkoutItem);
    const invoice = useSelector(state => state.account.invoice);
    const checkoutPlan = useSelector(state => state.account.checkoutPlan);
    const planOptions = invoice && invoice.planOptions;
    const planId = planOptions && planOptions[checkoutPlan].planId;

    debugLog(debugOn, `isLoggedIn: ${isLoggedIn}, checkoutPlan: ${checkoutPlan}`)

    const reportAnAppleTransactionCallback  = () => {
        if (window.webkit && window.webkit.messageHandlers && window.webkit.messageHandlers.toggleMessageHandler) {
            window.webkit.messageHandlers.toggleMessageHandler.postMessage({
                "action": 'finishTransaction',
            });
        }
    }

    const transactionWebCallFromIOS = (data) => {
        debugLog(debugOn, 'transactionWebCall', data);
        let transaction = data.transaction;
        //transaction = {time: Date.now() ,id: '2000000619251013', originalId: '2000000619251013'}
        if (data.status === 'ok') {
            dispatch(reportAnAppleTransactionThunk({ transaction, callback: reportAnAppleTransactionCallback }))
        } else {
            router.push('/services/payment')
        }
        dispatch(activityDone(accountActivity.IOSInAppPurchase))
    }

    useEffect(() => {
        if (isLoggedIn && checkoutPlan) {
            if (process.env.NEXT_PUBLIC_platform === 'iOS') {
                debugLog(debugOn, 'createApplePaymentIntentThunk')
                dispatch(createApplePaymentIntentThunk({ checkoutPlan }));
            } else {
                dispatch(createPaymentIntentThunk({ checkoutPlan }));
            }
        }
    }, [isLoggedIn, checkoutPlan])

    useEffect(() => {
        debugLog(debugOn, 'appleCientSecret: ', appleClientSecret)
        if (appleClientSecret) {
            if (window.webkit && window.webkit.messageHandlers && window.webkit.messageHandlers.toggleMessageHandler) {
                console.log('checkout');
                dispatch(activityStart(accountActivity.IOSInAppPurchase))
                window.bsafesNative.transactionWebCall = transactionWebCallFromIOS;
                window.webkit.messageHandlers.toggleMessageHandler.postMessage({
                    "action": 'checkout',
                    "planId": planId,
                    "appleClientSecret": appleClientSecret
                });
            }
            dispatch(clearAppleClientSecret())
        }
    }, [appleClientSecret])

    return (
        <ContentPageLayout>
            <Container>
                <br />
                <br />
                <Row>
                    <Col xs={{ span: 12 }} sm={{ span: 10, offset: 1 }} md={{ span: 8, offset: 2 }} lg={{ span: 6, offset: 3 }}>
                        <div style={{ borderStyle: 'solid' }} className='p-3'>
                            {checkoutItem && (
                                <>
                                    <p>Total Amount:</p>
                                    <h4>{`$${(checkoutItem.amount / 100).toFixed(2)} ${checkoutItem.currency.toUpperCase()}`}</h4>
                                </>
                            )}
                        </div>
                    </Col>
                </Row>
                {(process.env.NEXT_PUBLIC_platform === 'Web') &&
                    <Row>
                        <Col xs={{ span: 12 }} sm={{ span: 10, offset: 1 }} md={{ span: 8, offset: 2 }} lg={{ span: 6, offset: 3 }}>
                            <div style={{ borderStyle: 'solid' }} className='p-3'>
                                {stripeClientSecret && stripePromise && (
                                    <Elements stripe={stripePromise} options={{ clientSecret: stripeClientSecret, }}>
                                        <CheckoutForm />
                                    </Elements>
                                )}
                            </div>
                        </Col>
                    </Row>
                }
            </Container>
            {(process.env.NEXT_PUBLIC_platform === 'Web') &&
                <LoadStripe setStripePromise={setStripePromise} />
            }

        </ContentPageLayout>
    )
}