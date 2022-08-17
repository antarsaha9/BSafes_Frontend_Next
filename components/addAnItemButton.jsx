import { useEffect, useRef, useState } from 'react'

import Button from 'react-bootstrap/Button'
import Modal from 'react-bootstrap/Modal'
import ListGroup from 'react-bootstrap/ListGroup'

import BSafesStyle from '../styles/BSafes.module.css'

import { debugLog } from '../lib/helper'

export default function AddAnItemButton({itemTypeIsSelected, pageOnly=false}) {
    const debugOn = true;
    const [show, setShow] = useState(false);

    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);

    const optionSelected = (e) => {
        debugLog(debugOn, e.target.id)
        
        setShow(false);
        itemTypeIsSelected(e.target.id);
    }

    return (
        <>
            <Button variant="primary" className={BSafesStyle.btnCircle} onClick={handleShow}>
                <i id="1" className="fa fa-plus fa-lg" aria-hidden="true"></i>
            </Button>

            <Modal show={show} onHide={handleClose}>
                <Modal.Header closeButton>
                    <Modal.Title>Please Select a Type</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <ListGroup>
                        <ListGroup.Item id='Page' action onClick={optionSelected} className="pt-3 pb-3"><i className="fa fa-file-text-o me-2 fs-5 fw-light" aria-hidden="true"></i><em className="fs-5 fw-light">Page</em></ListGroup.Item>
                        { 
                            pageOnly?'':
                            <>
                                <ListGroup.Item id='Notebook' action onClick={optionSelected} className="pt-3 pb-3"><i className="fa fa-book me-2 fs-5 fw-light" aria-hidden="true"></i><em className="fs-5 fw-light">Notebook</em></ListGroup.Item>
                                <ListGroup.Item id='Diary' action onClick={optionSelected} className="pt-3 pb-3"><i className="fa fa-calendar me-2 fs-5 fw-light" aria-hidden="true"></i><em className="fs-5 fw-light">Diary</em></ListGroup.Item>
                                <ListGroup.Item id='Box' action onClick={optionSelected} className="pt-3 pb-3" variant="primary"><i className="fa fa-archive me-2 fs-5 fw-light" aria-hidden="true"></i><em className="fs-5 fw-light">Box</em></ListGroup.Item>
                                <ListGroup.Item id='Folder' action onClick={optionSelected} className="pt-3 pb-3" variant="warning"><i className="fa fa-folder-o me-2 fs-5 fw-light" aria-hidden="true"></i><em className="fs-5 fw-light">Folder</em></ListGroup.Item>
                            </>
                        }
                    </ListGroup>
                </Modal.Body>
            </Modal>   
        </> 
    )
}