/* eslint-disable @next/next/no-img-element */
import { useEffect, useState, useRef } from "react";
import Col from "react-bootstrap/Col";
import Button from "react-bootstrap/Button";
import Container from "react-bootstrap/Container";
import Form from "react-bootstrap/Form";
import InputGroup from "react-bootstrap/InputGroup";
import Modal from "react-bootstrap/Modal";
import Row from "react-bootstrap/Row";
import { useDispatch, useSelector } from "react-redux";
import ContentPageLayout from "../../components/layouts/contentPageLayout";
import { deleteExtraMFA, getMFADataThunk, verifyMFASetupToken } from "../../reduxStore/accountSlice";
import BSafesStyle from '../../styles/BSafes.module.css'

export default function MFASetup(props) {
    const mfa = useSelector(state => state.account.mfa);
    const memberId = useSelector(state => state.auth.memberId);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [token, setToken] = useState('');
    const [extraMFAEnabled, setExtraMFAEnabled] = useState(false);
    const confirmInputRef = useRef(null);
    const [deleteConfirmation, setDeleteConfirmation] = useState('');
    const handleDeleteModalOnEntered = () => {
        confirmInputRef.current.focus();
    }
    const handleCloseDeleteTrigger = () => {
        setDeleteConfirmation('');
        setShowDeleteModal(false);
    }
    const dispatch = useDispatch();
    useEffect(() => {
        if (memberId)
            dispatch(getMFADataThunk());
    }, [memberId, dispatch]);

    useEffect(() => {
        if (mfa?.mfaEnabled)
            setExtraMFAEnabled(true);
    }, [mfa])
    const handleDelete = async () => {
        await deleteExtraMFA();
        handleCloseDeleteTrigger();
        setExtraMFAEnabled(false);
        dispatch(getMFADataThunk());
    }
    const handleVerify = async () => {
        try {
            
            await verifyMFASetupToken(token);
            setToken('');
            setExtraMFAEnabled(true)
        } catch (error) {
            alert(error)
        }
    }
    return (
        <div className={BSafesStyle.spaceBackground}>
            <ContentPageLayout>
                <Container>
                    <Row>
                        <Col xs={12} className="text-center">
                            <h1>Security</h1>
                        </Col>
                    </Row>
                    <Row>
                        <Col xs={12}>
                            <h4>Extra MFA (Multi-Factor Authentication)</h4>
                        </Col>
                        {!extraMFAEnabled ? <>
                            <Col xs={12}>
                                <h6>1. Download Authy or Google authenticator on your mobile device.</h6>
                                <h6>2. Scan following QR code in your authenticator.</h6>
                                {mfa && <img alt="qrcode" src={mfa.mfa_qr} />}
                                <Form.Group className="mb-2">
                                    <Form.Label htmlFor="basic-url">Please enter the token</Form.Label>
                                    <Form.Control id="basic-url" aria-describedby="basic-addon3" value={token} onChange={e => setToken(e.target.value)} />
                                </Form.Group>

                                <Button variant="primary" className="py-2" onClick={handleVerify}>Verify</Button>
                            </Col></> :
                            <>
                                <Col xs={12}>
                                    <h6>Enabled.</h6>
                                    <Button variant="warning" className="py-2" onClick={() => setShowDeleteModal(true)}>Disable</Button>
                                    <Modal show={showDeleteModal} onEntered={handleDeleteModalOnEntered} onHide={handleCloseDeleteTrigger}>
                                        <Modal.Body>
                                            <h3>Are you Sure?</h3>
                                            <Form >
                                                <InputGroup className="mb-3">
                                                    <Form.Control ref={confirmInputRef} size="lg" type="text"
                                                        value={deleteConfirmation}
                                                        onChange={e => setDeleteConfirmation(e.target.value)}
                                                        placeholder="Yes"
                                                    />
                                                </InputGroup>
                                            </Form>
                                            <Button variant="primary" className="pull-right" size="md" onClick={handleDelete} disabled={deleteConfirmation !== 'Yes'}>
                                                Go
                                            </Button>
                                            <Button variant="light" className="pull-right" size="md" onClick={handleCloseDeleteTrigger}>
                                                Cancel
                                            </Button>
                                        </Modal.Body>
                                    </Modal>
                                </Col>
                            </>}
                    </Row>
                    <br />
                </Container >
            </ContentPageLayout >
        </div >
    )

}