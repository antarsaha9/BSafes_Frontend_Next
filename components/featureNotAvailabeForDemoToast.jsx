import { useRouter } from 'next/router';
import Toast from 'react-bootstrap/Toast';
import ToastContainer from 'react-bootstrap/ToastContainer';
import { Button } from 'react-bootstrap';

import { debugLog } from '../lib/helper'

export default function FeatureNotAvailableForDemoToast({ show = false, message="Hi", handleClose }) {
    const debugOn = false;
    debugLog(debugOn, "Rendering SampleItemNoticeModal: ", `${show}}`);
    const router = useRouter();

    const ownYourBSafes = () => {
        router.push("/keySetup")
    }

    return (
        <ToastContainer
            className="p-3"
            position='top-start'
            style={{ zIndex: 1000 }}
        >
            <Toast bg="warning" show={show} onClose={handleClose}>
                <Toast.Header closeButton={true} style={{backgroundColor: 'yellow'}}>
                    <strong className="me-auto">🙂 {message}</strong>
                    <small></small>
                </Toast.Header>
                <Toast.Body style={{backgroundColor: 'white'}}>Create your lock <i className="fa fa-lock" aria-hidden="true"></i> to have a private and safe space for writing and media protection!  <Button onClick={ownYourBSafes} variant='dark' size='sm'>Go</Button> <Button onClick={handleClose} variant='secondary' size='sm'>Later</Button></Toast.Body>
            </Toast>
        </ToastContainer>
    )
}