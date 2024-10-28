import { useEffect, useState, useRef } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useRouter } from 'next/router'

import Container from 'react-bootstrap/Container'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Button from 'react-bootstrap/Button'

import { Elements } from '@stripe/react-stripe-js';

import ContentPageLayout from '../../components/layouts/contentPageLayout';
import LoadStripe from '../../components/loadStripe'
import CheckoutForm from '../../components/checkoutForm'

import { accountActivity } from '../../lib/activities'
import { createPaymentIntentThunk, createApplePaymentIntentThunk, reportAnAppleTransactionThunk, reportAnAndroidPurchaseThunk, activityStart, activityDone, clearAppleClientSecret, createAndroidPaymentIntentThunk } from '../../reduxStore/accountSlice';

import { debugLog } from '../../lib/helper'

export default function Checkout() {
    const debugOn = true;

    const router = useRouter();
    const dispatch = useDispatch();

    const [stripePromise, setStripePromise] = useState(null);
    const [pendingAppleTransaction, setPendingAppleTransaction] = useState(null);
    const [reportAnAppleTransactionError, setReportAnAppleTransactionError] = useState(null)
    const [appleTransactionCompleted, setAppleTransactionCompleted] = useState(false);
    const [pendingAndroidPurchase, setPendingAndroidPurchase] = useState(null);
    const [reportAnAndroidPurchaseError, setReportAnAndroidPurchaseError] = useState(null)
    const [androidPurchaseCompleted, setAndroidPurchaseCompleted] = useState(false);

    const isLoggedIn = useSelector(state => state.auth.isLoggedIn);
    const memberId = useSelector(state => state.auth.memberId);
    const stripeClientSecret = useSelector(state => state.account.stripeClientSecret);
    const appleClientSecret = useSelector(state => state.account.appleClientSecret);
    const androidClientSecret = useSelector(state => state.account.androidClientSecret);
    const checkoutItem = useSelector(state => state.account.checkoutItem);
    const invoice = useSelector(state => state.account.invoice);
    const checkoutPlan = useSelector(state => state.account.checkoutPlan);
    const planOptions = invoice && invoice.planOptions;
    const planId = planOptions && planOptions[checkoutPlan].planId;

    debugLog(debugOn, `isLoggedIn: ${isLoggedIn}, checkoutPlan: ${checkoutPlan}`)

    const savePendingAppleTransaction = (transaction) => {
        debugLog(debugOn, "savePendingAppleTransaction - ")
        setPendingAppleTransaction(transaction);
        let pendingAppleTransactions = localStorage.getItem('pendingAppleTransactions');
        if (pendingAppleTransactions && pendingAppleTransactions !== 'null') {
            pendingAppleTransactions = JSON.parse(pendingAppleTransactions);
        } else {
            pendingAppleTransactions = {};
        }
        pendingAppleTransactions[memberId] = transaction;
        pendingAppleTransactions = JSON.stringify(pendingAppleTransactions)
        localStorage.setItem('pendingAppleTransactions', pendingAppleTransactions);
    }
    const clearPendingApppleTransaction = () => {
        debugLog(debugOn, "clearPendingApppleTransaction - ")
        setPendingAppleTransaction(null);
        let pendingAppleTransactions = localStorage.getItem('pendingAppleTransactions');
        if (pendingAppleTransactions && pendingAppleTransactions !== 'null') {
            pendingAppleTransactions = JSON.parse(pendingAppleTransactions);
        } else {
            pendingAppleTransactions = {};
        }
        pendingAppleTransactions[memberId] = null;
        pendingAppleTransactions = JSON.stringify(pendingAppleTransactions)
        localStorage.setItem('pendingAppleTransactions', pendingAppleTransactions);
    }

    const savePendingAndroidPurchase = (purchase) => {
        debugLog(debugOn, "savePendingAndroidPurchase - ")
        setPendingAndroidPurchase(purchase);
        let pendingAndroidPurchases = localStorage.getItem('pendingAndroidPurchases');
        if (pendingAndroidPurchases && pendingAndroidPurchases !== 'null') {
            pendingAndroidPurchases = JSON.parse(pendingAndroidPurchases);
        } else {
            pendingAndroidPurchases = {};
        }
        pendingAndroidPurchases[memberId] = JSON.stringify(purchase);
        pendingAndroidPurchases = JSON.stringify(pendingAndroidPurchases)
        localStorage.setItem('pendingAndroidPurchases', pendingAndroidPurchases);
    }
    const clearPendingAndroidPurchase = () => {
        debugLog(debugOn, "clearPendingAndroidPurchase - ")
        setPendingAndroidPurchase(null);
        let pendingAndroidPurchases = localStorage.getItem('pendingAndroidPurchases');
        if (pendingAndroidPurchases && pendingAndroidPurchases !== 'null') {
            pendingAndroidPurchases = JSON.parse(pendingAndroidPurchases);
        } else {
            pendingAndroidPurchases = {};
        }
        debugLog(debugOn, "clearPendingAndroidPurchase - ")
        pendingAndroidPurchases[memberId] = null;
        pendingAndroidPurchases = JSON.stringify(pendingAndroidPurchases)
        localStorage.setItem('pendingAndroidPurchases', pendingAndroidPurchases);
        debugLog(debugOn, "clearPendingAndroidPurchase finished. ")
    }


    const handleFixIt = () => {
        if (process.env.NEXT_PUBLIC_platform === 'iOS') {
            setReportAnAppleTransactionError(null);
            dispatch(reportAnAppleTransactionThunk({ transaction: pendingAppleTransaction, callback: reportAnAppleTransactionCallback }))
        } else if (process.env.NEXT_PUBLIC_platform === 'android') {
            setReportAnAndroidPurchaseError(null);
            dispatch(reportAnAndroidPurchaseThunk({ purchase: pendingAndroidPurchase, callback: reportAnAppleTransactionCallback }))
        }
    }

    const reportAnAppleTransactionCallback = (response) => {
        if (response.status === 'ok') {
            if (window.webkit && window.webkit.messageHandlers && window.webkit.messageHandlers.toggleMessageHandler) {
                window.webkit.messageHandlers.toggleMessageHandler.postMessage({
                    "action": 'finishTransaction',
                });
            }
            clearPendingApppleTransaction();
            setAppleTransactionCompleted(true);
        } else {
            console.log("reportAnAppleTransactionCallback returns error, pending: ", pendingAppleTransaction)
            setReportAnAppleTransactionError(response.error);
        }
    }

    const transactionWebCallFromIOS = (data) => {
        debugLog(debugOn, 'transactionWebCall', data);
        let transaction = data.transaction;
        //transaction = {time: Date.now() ,id: '2000000619251013', originalId: '2000000619251013'}; // TestWarning
        if (data.status === 'ok') {
            savePendingAppleTransaction(transaction);
        } else {
            router.push('/services/payment')
        }
        dispatch(activityDone(accountActivity.IOSInAppPurchase))
    }

    const reportAnAndroidPurchaseCallback = (response) => {
        debugLog("reportAnAndroidPurchaseCallback - ", response.status );
        if (response.status === 'ok') {
            clearPendingAndroidPurchase();
            setAndroidPurchaseCompleted(true);
        } else {
            console.log("reportAnAndroidPurchaseCallback returns error, pending: ", pendingAndroidPurchase)
            setReportAnAndroidPurchaseError(response.error);
        }
    }

    const transactionWebCallFromAndroid = (data) => {
        debugLog(debugOn, 'transactionWebCall');
        if (data.status === 'ok') {
            let purchase = JSON.parse(data.purchase);
            debugLog(debugOn, 'purchase: ', purchase);
            savePendingAndroidPurchase(purchase);
        } else if (data.status === 'canceled') {
            router.push('/services/payment')
        } else if (data.status == 'error') {
            router.push('/services/payment')
        }
        dispatch(activityDone(accountActivity.AndroidInAppPurchase))
    }

    useEffect(() => {
        if (isLoggedIn && checkoutPlan) {
            if (process.env.NEXT_PUBLIC_platform === 'iOS') {
                debugLog(debugOn, 'createApplePaymentIntentThunk')
                dispatch(createApplePaymentIntentThunk({ checkoutPlan }));
            } if (process.env.NEXT_PUBLIC_platform === 'android') {
                debugLog(debugOn, 'createAndroidPaymentIntentThunk')
                dispatch(createAndroidPaymentIntentThunk({ checkoutPlan }));
            } else {
                dispatch(createPaymentIntentThunk({ checkoutPlan }));
            }
        }
    }, [isLoggedIn, checkoutPlan])

    useEffect(() => {
        if (pendingAppleTransaction) {
            debugLog(debugOn, "useEffect - pendingAppleTransaction: ", pendingAppleTransaction)
            dispatch(reportAnAppleTransactionThunk({ transaction: pendingAppleTransaction, callback: reportAnAppleTransactionCallback }))
        }
    }, [pendingAppleTransaction])

    useEffect(() => {
        if (appleTransactionCompleted) {
            debugLog(debugOn, "Apple transaction is completed.")
            router.push('/services/inAppPurchaseCompletion')
        }
    }, [appleTransactionCompleted])

    useEffect(() => {
        if (reportAnAppleTransactionError) {
            debugLog(debugOn, "useEffect - reportAnAppleTransactionErrorn: ", reportAnAppleTransactionError)
        }
    }, [reportAnAppleTransactionError])

    useEffect(() => {
        if (pendingAndroidPurchase) {
            debugLog(debugOn, "useEffect - pendingAndroidPurchase: ", pendingAndroidPurchase)
            dispatch(reportAnAndroidPurchaseThunk({ purchase: pendingAndroidPurchase, callback: reportAnAndroidPurchaseCallback }))
        }
    }, [pendingAndroidPurchase])

    useEffect(() => {
        if (androidPurchaseCompleted) {
            debugLog(debugOn, "Android purchase is completed.")
            router.push('/services/inAppPurchaseCompletion')
        }
    }, [androidPurchaseCompleted])

    useEffect(() => {
        if (reportAnAndroidPurchaseError) {
            debugLog(debugOn, "useEffect - reportAnAndroidPurchaseError: ", reportAnAndroidPurchaseError)
        }
    }, [reportAnAndroidPurchaseError])

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

    useEffect(() => {
        debugLog(debugOn, 'androidCientSecret: ', androidClientSecret)
        if (androidClientSecret) {
            if (window.Android) {
                console.log('checkout');
                dispatch(activityStart(accountActivity.AndroidInAppPurchase))
                window.bsafesAndroid.transactionWebCall = transactionWebCallFromAndroid;
                window.Android.initiatePurchase(planId.toLowerCase())
            } else {
                const purchase = '{"orderId":"GPA.3351-4344-3420-01214","packageName":"com.bsafes.android.bsafes","productId":"bsafes_001","purchaseTime":1730092798870,"purchaseState":0,"purchaseToken":"ocikmbelnoiflbmgonehogeb.AO-J1OxvnDznYogJk0jliUCMcmyWDa8kcmNRoX_2mbYG8F0Ey6t5XdvdEoiLR5WoCMUOb2N0m_o9k25YTu0meiqY24m4TxAlvH-oqsjI9XQrEe0odPoljGU","quantity":1,"acknowledged":false}';
                transactionWebCallFromAndroid({status: 'ok', purchase})
            }
            dispatch(clearAppleClientSecret())
        }
    }, [androidClientSecret])

    return (
        <ContentPageLayout showNaveBar={false}>
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
                <br />
                {((process.env.NEXT_PUBLIC_platform === 'iOS' && reportAnAppleTransactionError && !reportAnAppleTransactionError.startsWith('Invalid transaction')) || (process.env.NEXT_PUBLIC_platform === 'android' && reportAnAndroidPurchaseError && !reportAnAndroidPurchaseError.startsWith('Invalid purchase'))) &&
                    <Row>
                        <Col xs={{ span: 12 }} sm={{ span: 10, offset: 1 }} md={{ span: 8, offset: 2 }} lg={{ span: 6, offset: 3 }}>
                            {`Many thanks for your purchase. We're sorry we failed to complete it due to a`} <span style={{ fontWeight: 'bold' }}>{reportAnAppleTransactionError}</span>. {`Please try again, and we will not ask you to pay.`}
                            <br />
                            <br />
                            <div className="text-center">
                                <Button onClick={handleFixIt}>Fix It</Button>
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