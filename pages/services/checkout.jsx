import { useEffect, useState, useRef } from 'react'
import { useSelector, useDispatch } from 'react-redux'

import Container from 'react-bootstrap/Container'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'

import { Elements } from '@stripe/react-stripe-js';

import ContentPageLayout from '../../components/layouts/contentPageLayout';
import LoadStripe from '../../components/loadStripe'
import CheckoutForm from '../../components/checkoutForm'

import { createPaymentIntentThunk } from '../../reduxStore/accountSlice';

import { debugLog } from '../../lib/helper'

export default function Checkout() {
    const debugOn = true;

    const dispatch = useDispatch();

    const [stripePromise, setStripePromise] = useState(null);

    const isLoggedIn = useSelector(state => state.auth.isLoggedIn);
    const stripeClientSecret = useSelector(state => state.account.stripeClientSecret);
    const checkoutItem = useSelector(state => state.account.checkoutItem);
    const checkoutPlan = useSelector(state => state.account.checkoutPlan);

    useEffect(() => {
        if (isLoggedIn && checkoutPlan) {
            dispatch(createPaymentIntentThunk({ checkoutPlan }));
        }
    }, [isLoggedIn, checkoutPlan])

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
                                    <h4>{`$${(checkoutItem.amount / 100).toFixed(2)} ${checkoutItem.currency}`}</h4>
                                </>
                            )}
                        </div>
                    </Col>
                </Row>
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
            </Container>
            <LoadStripe setStripePromise={setStripePromise} />
        </ContentPageLayout>
    )
}