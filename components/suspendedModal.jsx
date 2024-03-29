import { useSelector } from "react-redux";
import { useRouter } from 'next/router';

import Modal from 'react-bootstrap/Modal';
import Button from "react-bootstrap/Button";

import format from "date-fns/format";


import { debugLog } from "../lib/helper";

export default function SuspendedModal({ overflow = false }) {
    const debugOn = false;
    const router = useRouter();

    const nextDueTime = useSelector(state => state.account.nextDueTime);
    let dueDateString = null;
    if (nextDueTime) {
        dueDateString = format(nextDueTime, 'MMMM do')
    }

    const handleCheck = () => {
        router.push('/services/payment')
    }

    return (
        <>
            <Modal show={true} fullscreen={true} style={{ zIndex: '100000' }}>
                <div style={{ height: '1px', backgroundColor: 'grey' }}></div>
                {true && <>
                    <Modal.Header style={{ backgroundColor: '#F9E79F' }}>
                        <Modal.Title>🔰 Please check for any outstanding payments. Thank you!</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <div className="text-center">
                            <Button onClick={handleCheck}>Check</Button>
                        </div>
                    </Modal.Body>
                </>}
            </Modal >
        </>
    )
}