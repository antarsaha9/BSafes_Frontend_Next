import { useState } from "react";
import { useSelector } from "react-redux";
import { useRouter } from 'next/router';

import Modal from 'react-bootstrap/Modal';
import Button from "react-bootstrap/Button";

import format from "date-fns/format";


import { debugLog } from "../lib/helper";

export default function SuspendedModal({ overflow = false }) {
    const debugOn = false;
    const router = useRouter();
    const [show, setShow] = useState(true);

    const nextDueTime = useSelector(state => state.account.nextDueTime);
    let dueDateString = null;
    if (nextDueTime) {
        dueDateString = format(nextDueTime, 'MMMM do')
    }

    const handleClose = () => {
        setShow(false);
    }

    const handleCheck = () => {
        router.push('/services/payment')
    }

    return (
        <>
            <Modal show={show} fullscreen={true} style={{ zIndex: '100000' }}>
                <div style={{ height: '1px', backgroundColor: 'grey' }}></div>
                {true && <>
                    <Modal.Header closeButton onHide={handleClose} style={{ backgroundColor: '#F9E79F' }}>
                        <Modal.Title></Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <div className="text-center">
                            <img src='/images/message_128.png'/>
                        </div>
                        {overflow ?
                            <p className="text-center">🔰 You may have outstanding payments due to exceeding storage quota.
                                Please check!</p> :
                            <p className="text-center">🔰 You may be overdue. Please check!</p>
                        }
                        <div className="text-center">
                            <Button onClick={handleCheck}>Check</Button>
                        </div>
                    </Modal.Body>
                </>}
            </Modal >
        </>
    )
}