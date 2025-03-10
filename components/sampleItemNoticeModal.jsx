import { useSelector } from 'react-redux'
import Modal from 'react-bootstrap/Modal'
import { Button } from 'react-bootstrap';
import { Montserrat } from 'next/font/google';

import { debugLog } from '../lib/helper'
import { getItemType } from '../lib/bSafesCommonUI';

export const monteserrat = Montserrat({
    subsets: ['latin'],
    display: 'swap',
})

export default function SampleItemNoticeModal({ show = false, handleClose }) {
    const debugOn = false;
    debugLog(debugOn, "Rendering SampleItemNoticeModal: ", `${show}}`);
    const itemId = useSelector(state => state.page.id);
    const itemType = itemId ? getItemType(itemId) : "";

    const ownYourBSafes = () => {

    }

    return (
        <Modal className={`${monteserrat.className}`} show={show} onHide={handleClose} size="lg" aria-labelledby="contained-modal-title-vcenter" centered>
            <Modal.Header closeButton style={{ backgroundColor: 'yellow' }}>
                <Modal.Title>🙂 It is a sample!</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <p>{`It's only for demo purposes. Your data is stored locally and is not backed up to the cloud. You can open the demo ${itemType.toLowerCase()}`} and then try</p>
                <ul>
                    <li>writing <i className="fa fa-pencil" aria-hidden="true"></i>, </li>
                    <li>adding photos <i className="fa fa-picture-o" aria-hidden="true"></i>,</li>
                    <li> videos <i className="fa fa-video-camera" aria-hidden="true"></i>, and files <i className="fa fa-paperclip" aria-hidden="true"></i>.</li>
                </ul>
                <p>Later, create your lock <i className="fa fa-lock" aria-hidden="true"></i> to have a private and safe space for writing and media protection!</p>
            </Modal.Body>
            <Modal.Footer>
                <Button onClick={handleClose} variant="dark">OK</Button>
            </Modal.Footer>
        </Modal>
    )
}