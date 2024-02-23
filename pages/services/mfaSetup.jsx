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


export default function MFASetup() {
    const debugOn = false;
    const dispatch = useDispatch();

    const [password, setPassword] = useState('');
    const [passwordFocus, setPasswordFocus] = useState(false);
    const [accountHash, setAccountHash] = useState(null);
    const [showPasswordModal, setShowPasswordModal] = useState(false);

    const [extraMFAEnabled, setExtraMFAEnabled] = useState(false);
    const [qrCode, setQrCode] = useState(null);
    const [token, setToken] = useState('');
    const [showRecoveryWords, setShowRecoveryWords] = useState(false);
    const [copied, setCopied] = useState(false);
    const [downloadUrl, setDownloadUrl] = useState(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteConfirmation, setDeleteConfirmation] = useState('');
    const confirmInputRef = useRef(null);

    const isLoggedIn = useSelector(state => state.auth.isLoggedIn);
    const keySalt = useSelector(state => state.auth.keySalt);

    const accountHashVerified = useSelector(state => state.account.accountHashVerified);
    const mfa = useSelector(state => state.account.mfa);

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

    const handleVerify = async () => {
        try {
            dispatch(verifyMFASetupTokenThunk({ token, accountHash }));
            setToken('');
        } catch (error) {
            alert(error)
        }

    }

    const handleHide = () => {
        const result = confirm("Did you save your 2FA recovery phase? Close this?")
        if(result) setShowRecoveryWords(false)
    }

    const handleCopy = () => {
        navigator.clipboard.writeText(mfa.recoveryWords);
        setCopied(true);
    }

    const handleDeleteModalOnEntered = () => {
        confirmInputRef.current.focus();
    }

    const handleCloseDeleteTrigger = () => {
        setDeleteConfirmation('');
        setShowDeleteModal(false);
    }
    const handleDelete = async () => {
        dispatch(deleteMFAThunk({ accountHash }));
        handleCloseDeleteTrigger();
    }
    useEffect(() => {
        if (isLoggedIn) {
            dispatch(getMFADataThunk());
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

    useEffect(() => {
        if (!mfa) return;
        if (mfa.mfaSetup) {
            const file = new File([mfa.recoveryWords], '2FA.txt', {
                type: 'text/plain',
            })

            const url = URL.createObjectURL(file)
            setDownloadUrl(url);
            setCopied(false);
            setShowRecoveryWords(true);     
        } else {
            if (mfa.error === 'InvalidToken') {
                setToken('');
                return;
            }
        }
        if (mfa.mfaEnabled) {
            setExtraMFAEnabled(true);
        } else {
            setExtraMFAEnabled(false);
            if (mfa.otpAuthUrl) {
                const generateQrCode = async () => {
                    try {
                        const data = await QRCode.toDataURL(mfa.otpAuthUrl);
                        setQrCode(data);
                    } catch (error) {
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
                            <h1>Turn On 2FA</h1>
                        </Row>
                        <Row>
                            <p>{`Step 1. Open your authenticator app., or download one if you don't have any;`}</p>
                        </Row>
                        <Row>
                            <p>Step 2. Add an account by scanning the following QR code;</p>
                            {qrCode && <img className={BSafesStyle.qrCode} alt="qrcode" src={qrCode} />}
                        </Row>
                        <Row>
                            <p>Step 3. Enter the token displayed on your app, then verify.</p>
                        </Row>
                        <Row>
                            <Col xs={4} md={3}>
                                <Form.Control className={BSafesStyle.inputBox} size="lg" type="text" placeholder="" value={token} onChange={e => setToken(e.target.value)} />
                            </Col>
                            <Col xs={8} md={9}>
                                <Button variant="primary" onClick={handleVerify}>Verify</Button>
                            </Col>
                        </Row>
                        <Row>
                            {(mfa && !mfa.mfaSetup && (mfa.error === 'InvalidToken')) &&
                                <p style={{ color: 'red' }}>Invalid Token</p>
                            }
                        </Row>
                        <br />
                        <Row>
                            <p>Step 4. Store your recovery phrase in a secure location. You would need the recovery phrase if you lost your 2FA account.</p>
                        </Row>
                    </div> :
                    <div className='m-3'>
                        <Col xs={12}>
                            <h1>2FA is enabled.</h1>
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
                            <Modal show={showRecoveryWords} fullscreen={true} onHide={handleHide}>
                                <Modal.Header closeButton>
                                    <Modal.Title>2FA Recovery Words</Modal.Title>
                                </Modal.Header>
                                <Modal.Body>
                                    <p>Store your recovery words in a secure location. If you lose your 2FA authenticator account, using recovery words is the only way to pass the 2FA step.</p>
                                    <p>You can either copy the following recovery words and paste it to a safe location</p>
                                    <hr />
                                    <h3>{mfa && mfa.recoveryWords}</h3>
                                    <hr />
                                    <Row>
                                        <Col className='text-center'>
                                            <Button variant="primary" onClick={handleCopy}>{copied ? `Copied` : `Copy`}</Button>
                                        </Col>
                                    </Row>
                                    <br />
                                    <p>or download the following file, rename it, and save it in a secure location.</p>
                                    <Row>
                                        <Col className="d-flex justify-content-center">
                                            {downloadUrl && <a href={downloadUrl} download="2FA.txt">2FA.txt</a>}
                                        </Col>
                                    </Row>
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