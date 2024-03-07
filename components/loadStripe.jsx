import { useEffect, useState, useRef } from 'react'
import { useSelector, useDispatch } from 'react-redux'

import { loadStripe } from '@stripe/stripe-js';

import { debugLog } from '../lib/helper'

export default function LoadStripe({setStripePromise}) {
    const debugOn = false;
    const stripePublishableKey = useSelector(state => state.auth.stripePublishableKey);
    
    useEffect(() => {
        if (stripePublishableKey) {
            debugLog(debugOn, 'stripePublishableKey');
            setStripePromise(loadStripe(stripePublishableKey));
        }
    }, [stripePublishableKey]);
    
    return (
        <p hidden>Load Stripe</p>
    );
}