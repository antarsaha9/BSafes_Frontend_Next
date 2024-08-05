import { useSelector } from "react-redux";
import { useRouter } from 'next/router';

import Offcanvas from 'react-bootstrap/Offcanvas';
import Button from "react-bootstrap/Button";

import format from "date-fns/format";


import { debugLog } from "../lib/helper";

export default function PaymentBanner({ upgradeRequired = false }) {
    const debugOn = false;
    const router = useRouter();

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
                <div style={{ height: '1px', backgroundColor: 'grey' }}></div>
                {!upgradeRequired && <>
                    <Offcanvas.Header >
                        <Offcanvas.Title>{dueDateString && <>{`Due on ${dueDateString}.`}</>}</Offcanvas.Title>
                    </Offcanvas.Header>
                    <Offcanvas.Body>
                        {dueDateString && <p>{`Hello, just wanted to remind you that your BSafes account was due on ${dueDateString}. Please make your payment as soon as possible.`}</p>}
                        <div className="text-center">
                            <Button onClick={handlePay}>Pay</Button>
                        </div>
                    </Offcanvas.Body>
                </>}
                {upgradeRequired && <>
                    <Offcanvas.Header >
                        <Offcanvas.Title>Upgrade Required</Offcanvas.Title>
                    </Offcanvas.Header>
                    <Offcanvas.Body>
                        {true && <p>{`Hello, just wanted to remind you that your cuurent storage usage exceeds your storage quota. Please upgrade as soon as possible.`}</p>}
                        <div className="text-center">
                            <Button onClick={handlePay}>Upgrade</Button>
                        </div>
                    </Offcanvas.Body>
                </>}
            </Offcanvas >
        </>
    )
}