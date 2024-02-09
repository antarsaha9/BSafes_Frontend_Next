
import { useState } from 'react'

import Container from 'react-bootstrap/Container'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Modal from "react-bootstrap/Modal";
import Button from 'react-bootstrap/Button'

export default function SaveAccountRecoveryModal(show=false) {
    
    const accountRecoveryPhrase = 'abc';
    const [copied, setCopied] = useState(false);

    const handleHide = () => {

    }
    const handleCopy = () => {
        navigator.clipboard.writeText(accountRecoveryPhrase);
        setCopied(true);
    }
    return (
        <>
            <Modal show={show} fullscreen={true} onHide={handleHide}>
                <Modal.Header closeButton>
                    <Modal.Title>Save Your Account Recovery Phrase </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p>Store your account recovery phrase in a secure location. If you forget your Nickname and Key Password, using account recovery phrase is the only way to recover your account.</p>
                    <hr />
                    <p>{accountRecoveryPhrase}</p>
                    <hr />
                    <Row>
                        <Button variant="primary" onClick={handleCopy}>{copied ? `Copied` : `Copy`}</Button>
                    </Row>
                </Modal.Body>
            </Modal>
        </>
    )
}