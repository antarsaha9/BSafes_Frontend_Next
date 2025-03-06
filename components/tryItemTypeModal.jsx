import Modal from 'react-bootstrap/Modal'
import ListGroup from 'react-bootstrap/ListGroup';

import { debugLog } from '../lib/helper'

export default function TryItemTypeModal({show=false, optionSelected, handleClose, pageOnly=false}) {
    const debugOn = false;
    debugLog(debugOn, "Rendering ItemTypeModal: ", `${show}}`);
    
    return (
        <Modal show={show} onHide={handleClose}>
        <Modal.Header closeButton>
            <Modal.Title><p>Please Select a Sample</p></Modal.Title>
        </Modal.Header>
        <Modal.Body>
            <ListGroup>
                <ListGroup.Item id='Page' action onClick={()=>optionSelected('p00')} className="pt-3 pb-3"><i className="fa fa-file-text-o me-2 fs-5 fw-light" aria-hidden="true"></i><em className="fs-5 fw-light">Page</em></ListGroup.Item>
                { 
                    pageOnly?'':
                    <>
                        <ListGroup.Item id='Notebook' action onClick={()=>optionSelected('n00')} className="pt-3 pb-3"><i className="fa fa-book me-2 fs-5 fw-light" aria-hidden="true"></i><em className="fs-5 fw-light">Notebook</em></ListGroup.Item>
                        <ListGroup.Item id='Diary' action onClick={()=>optionSelected('d00')} className="pt-3 pb-3"><i className="fa fa-calendar me-2 fs-5 fw-light" aria-hidden="true"></i><em className="fs-5 fw-light">Diary</em></ListGroup.Item>
                    </>
                }
            </ListGroup>
        </Modal.Body>
    </Modal>   
    )
}