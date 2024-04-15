import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useRouter } from 'next/router';

import Container from 'react-bootstrap/Container'
import Button from 'react-bootstrap/Button'

import LoadStripe from '../../components/loadStripe';
import ContentPageLayout from '../../components/layouts/contentPageLayout';

import { paymentCompletedThunk } from '../../reduxStore/accountSlice';

export default function PaymentCompletion() {
    const dispatch = useDispatch();
    const router = useRouter();

    const [stripePromise, setStripePromise] = useState(null);
    const [paymentIntentData, setPaymentIntentData] = useState(null);
    const [paymentError, setPaymentError] = useState(null);

    useEffect(() => {
        if (!stripePromise) return;

        stripePromise.then(async (stripe) => {
            const url = new URL(window.location);
            const clientSecret = url.searchParams.get('payment_intent_client_secret');
            const { error, paymentIntent } = await stripe.retrievePaymentIntent(clientSecret);
            if (error) {
                setPaymentError(error);
            } else {
                setPaymentIntentData(paymentIntent);
                dispatch(paymentCompletedThunk());
            }
        });
    }, [stripePromise]);

    return (
        <ContentPageLayout>
            <Container>
                {paymentError &&
                    <div>
                        <div className='text-center'>
                            <img src='/images/sorry_196.png' />
                        </div>
                        <h3 className="text-center">{`We're sorry, but the payment has failed.`}</h3>
                        <p className="text-center">{paymentError && paymentError.message}</p>
                        <div className='text-center'>
                            <Button onClick={() => { router.push('/services/payment') }}>Please retry</Button>
                        </div>
                    </div>
                }
                {!paymentError && paymentIntentData && paymentIntentData.status === 'succeeded' &&
                    <div>
                        <div className='text-center'>
                            <img src='/images/thank_196.png' />
                        </div>
                        <h1 className="text-center">Thank you!</h1>
                        <h3 className="text-center">Payment succeeded.</h3>
                        <div className='text-center'>
                            <Button onClick={() => { router.push('/safe') }}>Done</Button>
                        </div>
                    </div>
                }
                {!paymentError && paymentIntentData && paymentIntentData.status !== 'succeeded' &&
                    <div>
                        <div className='text-center'>
                            <img src='/images/sorry_196.png' />
                        </div>
                        <h3 className="text-center">{`We're sorry, the payment did not succeed.`}</h3>
                        <h4 className="text-center">Status: {paymentIntentData.status}</h4>
                        <div className='text-center'>
                            <Button onClick={() => { router.push('/services/payment') }}>Please retry</Button>
                        </div>
                    </div>
                }

            </Container>
            <LoadStripe setStripePromise={setStripePromise} />
        </ContentPageLayout>
    )
}

