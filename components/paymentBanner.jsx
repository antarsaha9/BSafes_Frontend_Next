import { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from 'next/router';

import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";

import Offcanvas from 'react-bootstrap/Offcanvas';
import Button from "react-bootstrap/Button";

import format from "date-fns/format";

import BSafesStyle from '../styles/BSafes.module.css'

import { debugLog } from "../lib/helper";

export default function PaymentBanner({ }) {
    const debugOn = false;
    const router = useRouter();
    const dispatch = useDispatch();

    const nextDueTime = useSelector(state => state.account.nextDueTime);
    let dueDateString = null;
    if (nextDueTime) {
        dueDateString = format(nextDueTime, 'MMMM do')
    }

    const handlePay = () => {
        router.push('/services/payment')
    }

    return (
        <>
            <Offcanvas show={true} placement='bottom' scroll={true} backdrop={false} style={{ backgroundColor: '#fdf1bc', zIndex: '20000' }}>
                <div style={{height:'1px', backgroundColor:'grey'}}></div>
                <Offcanvas.Header >
                    <Offcanvas.Title>{dueDateString && <>{`Due on ${dueDateString}.`}</>}</Offcanvas.Title>
                </Offcanvas.Header>
                <Offcanvas.Body>
                    {dueDateString && <p>{`Hello, just wanted to remind you that your account was due on ${dueDateString}. Please make your payment as soon as possible.`}</p>}
                    <div className="text-center">
                        <Button onClick={handlePay}>Pay</Button>
                    </div>
                </Offcanvas.Body>
            </Offcanvas>
        </>
    )
}