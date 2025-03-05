import Modal from 'react-bootstrap/Modal'
import { Button } from 'react-bootstrap';

import { debugLog } from '../lib/helper'

export default function SampleItemNoticeModal({ show = false, handleClose }) {
    const debugOn = false;
    debugLog(debugOn, "Rendering SampleItemNoticeModal: ", `${show}}`);

    const ownYourBSafes = ()=>{

    }

    return (
        <Modal show={show} onHide={handleClose} size="lg" aria-labelledby="contained-modal-title-vcenter" centered>
            <Modal.Header closeButton>
                <Modal.Title>🙂 It is a sample!</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <p>Your data is stored locally and is not backed up to the cloud. Own your BSafes to have a private and safe space for writing and media protection!</p>
            </Modal.Body>
            <Modal.Footer>
                <Button onClick={handleClose} variant="secondary">OK</Button>
            </Modal.Footer>
        </Modal>
    )
}