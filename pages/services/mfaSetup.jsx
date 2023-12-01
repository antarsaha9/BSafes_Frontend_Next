import { useEffect, useState, useRef } from 'react'
import { useSelector, useDispatch } from 'react-redux'

import Container from 'react-bootstrap/Container'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button'
import Modal from "react-bootstrap/Modal";
import InputGroup from "react-bootstrap/InputGroup";

import QRCode from 'qrcode'

import BSafesStyle from '../../styles/BSafes.module.css'
import ContentPageLayout from "../../components/layouts/contentPageLayout";

import { getMFADataThunk, verifyMFASetupTokenThunk, deleteMFAThunk } from '../../reduxStore/accountSlice'
import { debugLog } from '../../lib/helper'

export default function MFASetup() {
    const debugOn = false;
    const dispatch = useDispatch();

    const [extraMFAEnabled, setExtraMFAEnabled] = useState(false);
    const [qrCode, setQrCode] = useState(null);
    const [token, setToken] = useState('');
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteConfirmation, setDeleteConfirmation] = useState('');
    const confirmInputRef = useRef(null);

    const isLoggedIn = useSelector(state => state.auth.isLoggedIn);

    const mfa = useSelector(state=> state.account.mfa);
    
    const handleVerify = async () => {
        try {
            dispatch(verifyMFASetupTokenThunk({token}));
            setToken('');
        } catch (error) {
            alert(error)
        }
    }

    const handleDeleteModalOnEntered = () => {
        confirmInputRef.current.focus();
    }
    const handleCloseDeleteTrigger = () => {
        setDeleteConfirmation('');
        setShowDeleteModal(false);
    }
    const handleDelete = async () => {
        dispatch(deleteMFAThunk());;
        handleCloseDeleteTrigger();
    }
    useEffect(()=>{
        if(isLoggedIn) {
            dispatch(getMFADataThunk());
        }
    }, [isLoggedIn]);

    useEffect(() => {
        if(!mfa) return;
        if (mfa.mfaEnabled){
            setExtraMFAEnabled(true);
        } else {
            setExtraMFAEnabled(false);
            if(mfa.otpAuthUrl){
                const generateQrCode = async () => {
                    try {
                        const data = await QRCode.toDataURL(mfa.otpAuthUrl);
                        setQrCode(data);
                    } catch(error) {
                        debugLog(debugOn, 'QRCode error.');
                    }
                }
                generateQrCode();
            } else {
                dispatch(getMFADataThunk());
            }
        }
    }, [mfa]);

    return (
        <ContentPageLayout> 
            <Container>
                <br />
                <br />
                {!extraMFAEnabled ?
                <div className='m-3'>
                    <Row>
                        <h1>Turn On MFA</h1>
                    </Row>
                    <Row>
                        <h4>{`Step 1. Open your MFA authenticator app., or download one if you don't have any;`}</h4>
                    </Row>
                    <Row>
                        <h4>Step 2. Add an account by scanning the following QR code;</h4>
                        {qrCode && <img className={BSafesStyle.qrCode} alt="qrcode" src={qrCode} />}
                    </Row>
                    <Row>
                        <h4>Step 3. Enter the token displayed on your app, then verify.</h4>
                    </Row>
                    <Row>
                        <Col xs={4} md={3}>
                            <Form.Control className={BSafesStyle.inputBox} size="lg" type="text" placeholder="" value={token} onChange={e => setToken(e.target.value)} />
                        </Col>  
                        <Col xs={8} md={9}>
                            <Button variant="primary" onClick={handleVerify}>Verify</Button>
                        </Col>             
                    </Row>
                    <br />
                    <Row>
                        <h4>Step 4. Store your recovery phrase in a secure location. You would need the recovery phrase if you lost your MFA account.</h4>
                    </Row>
                </div> :
                <div className='m-3'>
                    <Col xs={12}>
                        <h1>MFA is enabled.</h1>
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
                </div>
                }
            </Container>
        </ContentPageLayout> 
    );
}