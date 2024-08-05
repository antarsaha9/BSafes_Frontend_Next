import Container from 'react-bootstrap/Container'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Modal from "react-bootstrap/Modal";
import Image from 'react-bootstrap/Image';

import BSafesStyle from '../styles/BSafes.module.css'

import PrivacyPolicyContent from './privacyPolicyContent';

import { debugLog } from '../lib/helper'

export default function PrivacyPolicyModal({ callback }) {
    const debugOn = false;

    const handleHide = () => {
        callback();
    }

    return (
        <>
            <Modal show={true} fullscreen={true} onHide={handleHide}>
                <Modal.Header closeButton>
                    <Modal.Title><i className="fa fa-file-text-o" aria-hidden="true"></i> Privacy Policy</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Container>
                        <PrivacyPolicyContent/>
                    </Container>
                </Modal.Body>
            </Modal>
        </>
    )
}