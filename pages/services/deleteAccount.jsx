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
import KeyInput from '../../components/keyInput'

import { calculateAccountHash } from '../../lib/crypto'
import { debugLog } from '../../lib/helper'
import { getMFADataThunk, verifyAccountHashThunk, verifyMFASetupTokenThunk, deleteMFAThunk } from '../../reduxStore/accountSlice'


export default function DeleteAccount() {
    const debugOn = false;
    const dispatch = useDispatch();

    const [password, setPassword] = useState('');
    const [passwordFocus, setPasswordFocus] = useState(false);
    const [accountHash, setAccountHash] = useState(null);
    const [showPasswordModal, setShowPasswordModal] = useState(false);

    const isLoggedIn = useSelector(state => state.auth.isLoggedIn);
    const keySalt = useSelector(state => state.auth.keySalt);

    const accountHashVerified = useSelector(state => state.account.accountHashVerified);

    const passwordChanged = (thisPassword) => {
        setPassword(thisPassword);
    }

    const handleOnPasswordModalEntered = () => {
        setPasswordFocus(true);
    }

    const handlePassword = async () => {
        const result = await calculateAccountHash(password, keySalt);
        dispatch(verifyAccountHashThunk({ accountHash: result }));
    }

    const handleDeleteModalOnEntered = () => {
        confirmInputRef.current.focus();
    }

    const handleCloseDeleteTrigger = () => {
        setDeleteConfirmation('');
        setShowDeleteModal(false);
    }

    const handleDelete = async () => {
        //dispatch(deleteMFAThunk({ accountHash }));
        handleCloseDeleteTrigger();
    }

    useEffect(() => {
        if (isLoggedIn) {
        }
    }, [isLoggedIn]);

    useEffect(() => {
        if (!accountHash && keySalt) {
            setShowPasswordModal(true);
        } else {
            setShowPasswordModal(false);
        }
    }, [accountHash, keySalt])

    useEffect(() => {
        if (accountHashVerified && accountHashVerified.verified) {
            setPassword('');
            setAccountHash(accountHashVerified.accountHash);
        }
    }, [accountHashVerified])

    return (
        <ContentPageLayout>
            <Container>
                <br />
                <br />
                {true &&
                    <div className='m-3'>
                        <Col xs={12}>
                            <h1>Delete Account</h1>
                            <Button variant="warning" className="py-2" onClick={() => setShowDeleteModal(true)}>Disable</Button>
                            <Modal show={showDeleteModal} onEntered={handleDeleteModalOnEntered} onHide={handleCloseDeleteTrigger}>
                                <Modal.Body>
                                    <h3>Are you sure?</h3>
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
                <Modal show={showPasswordModal} onEntered={handleOnPasswordModalEntered}>
                    <Modal.Body>
                        <h3>Please Enter your Password</h3>
                        <br />
                        <KeyInput onKeyChanged={passwordChanged} focus={passwordFocus} />
                        {(accountHashVerified && !accountHashVerified.verified) ?
                            <p style={{ color: 'red' }}>Authentication Failed</p>
                            :
                            <br />
                        }
                        <br />
                        <Button variant="primary" onClick={handlePassword} className="pull-right">
                            Go
                        </Button>
                    </Modal.Body>
                </Modal>
            </Container>
        </ContentPageLayout>
    );
}