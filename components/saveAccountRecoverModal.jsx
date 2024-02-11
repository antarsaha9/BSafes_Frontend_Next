import { useEffect, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'

import Container from 'react-bootstrap/Container'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Modal from "react-bootstrap/Modal";
import Button from 'react-bootstrap/Button'

import { setNewAccountCreated } from '../reduxStore/accountSlice'

export default function SaveAccountRecoveryModal(show = false) {
    const dispatch = useDispatch();

    const newAccountCreated = useSelector(state => state.account.newAccountCreated);
    const [copied, setCopied] = useState(false);
    const [downloadUrl, setDownloadUrl] = useState(null);

    const handleHide = () => {
        const result = confirm("Did you save your account recovery code? Close this?")
        if(result) dispatch(setNewAccountCreated(null));
    }
    const handleCopy = () => {
        navigator.clipboard.writeText(newAccountCreated.accountRecoveryPhrase);
        setCopied(true);
    }

    useEffect(() => {
        if (newAccountCreated) {
            const file = new File([newAccountCreated.accountRecoveryPhrase], 'abc.txt', {
                type: 'text/plain',
            })

            const url = URL.createObjectURL(file)
            setDownloadUrl(url);
        }
    }, [newAccountCreated])

    return (
        <>
            <Modal show={show} fullscreen={true} onHide={handleHide}>
                <Modal.Header closeButton>
                    <Modal.Title><i class="fa fa-ambulance" aria-hidden="true"></i> Save Your Account Recovery Code </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Container>
                        <p>Store your account recovery phrase in a secure location. If you forget your Nickname and Key Password, using account recovery code is the only way to recover your account.</p>
                        <p>You can either copy the following recovery code and paste it to a safe location</p>
                        <hr />
                        <Row>
                            <Col style={{ overflowX: 'auto', overflowY: 'hidden', textOverflow: 'ellipsis' }}>
                                <p>{newAccountCreated && newAccountCreated.accountRecoveryPhrase}</p>
                            </Col>
                        </Row>
                        <hr />
                        <Row>
                            <Col className="d-flex justify-content-center">
                                <Button className='text-center' variant="primary" onClick={handleCopy}>{copied ? `Copied` : `Copy`}</Button>
                            </Col>
                        </Row>
                        <br />
                        <p>or download the following file, rename it, and save it in a secure location.</p>
                        <Row>
                            <Col className="d-flex justify-content-center">
                                {downloadUrl && <a href={downloadUrl} download="account.txt">account.txt</a>}
                            </Col>
                        </Row>
                    </Container>
                </Modal.Body>
            </Modal>
        </>
    )
}