import { useState } from 'react';
import Toast from 'react-bootstrap/Toast';
import ToastContainer from 'react-bootstrap/ToastContainer';
import { Button } from 'react-bootstrap';

import { debugLog } from '../lib/helper'

export default function SampleItemNoticeToast({ show = false, handleClose }) {
    const debugOn = false;
    debugLog(debugOn, "Rendering SampleItemNoticeModal: ", `${show}}`);

    const ownYourBSafes = () => {

    }

    return (
        <ToastContainer
            className="p-3"
            position='bottom-start'
            style={{ zIndex: 1000 }}
        >
            <Toast bg="warning" show={show} onClose={handleClose}>
                <Toast.Header closeButton={true}>
                    <img
                        src="holder.js/20x20?text=%20"
                        className="rounded me-2"
                        alt=""
                    />
                    <strong className="me-auto">🙂 It is a sample!</strong>
                    <small></small>
                </Toast.Header>
                <Toast.Body>Own your BSafes to have a private and safe space for writing and media protection!  <Button variant='light' size='sm'>Go</Button> <Button onClick={handleClose} variant='light' size='sm'>Later</Button></Toast.Body>
            </Toast>
        </ToastContainer>
    )
}