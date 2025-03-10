import { useSelector } from "react-redux";
import { useRouter } from 'next/router';
import Link from "next/link";

import Offcanvas from 'react-bootstrap/Offcanvas';
import Button from "react-bootstrap/Button";

import format from "date-fns/format";
import { debugLog } from "../lib/helper";

export default function VisitPaymentBanner({ upgradeRequired = false, suspended = false, overflow = false }) {
    const debugOn = false;
    const router = useRouter();

    const nextDueTime = useSelector(state => state.account.nextDueTime);
    let dueDateString = null;
    if (nextDueTime) {
        dueDateString = format(nextDueTime, 'MMMM do')
    }

    const handleVisitPayment = () => {
        router.push('/services/payment')
    }

    return (
        <>
            <Offcanvas show={true} placement='bottom' scroll={true} backdrop={false} style={{ backgroundColor: '#fdf1bc', zIndex: '20000' }}>
                <div style={{ height: '1px', backgroundColor: 'grey' }}></div>
                {upgradeRequired && <>
                    <Offcanvas.Header >
                        <Offcanvas.Title>Upgrade Required</Offcanvas.Title>
                    </Offcanvas.Header>
                    <Offcanvas.Body>
                        {true && <p>{`Hello, just wanted to remind you that your cuurent storage usage exceeds your storage quota. Please visit the`} <Link href="/services/payment">payment page</Link>.</p>}
                        <div className="text-center">
                            <Button onClick={handleVisitPayment}>Go</Button>
                        </div>
                    </Offcanvas.Body>
                </>}
                {suspended && <>
                    <Offcanvas.Header >
                        <Offcanvas.Title>Pending Dues</Offcanvas.Title>
                    </Offcanvas.Header>
                    <Offcanvas.Body>
                        {true && <p>{`Hello, you may have pending dues. Please visit the`} <Link href="/services/payment">payment page</Link>.</p>}
                        <div className="text-center">
                            <Button onClick={handleVisitPayment}>Go</Button>
                        </div>
                    </Offcanvas.Body>
                </>}
                {overflow && <>
                    <Offcanvas.Header >
                        <Offcanvas.Title>Upgrade Required</Offcanvas.Title>
                    </Offcanvas.Header>
                    <Offcanvas.Body>
                        {true && <p>{`Hello, you might have outstanding payments due to exceeding your storage quota. Please visit the`} <Link href="/services/payment">payment page</Link>.</p>}
                        <div className="text-center">
                            <Button onClick={handleVisitPayment}>Go</Button>
                        </div>
                    </Offcanvas.Body>
                </>}
            </Offcanvas >
        </>
    )
}