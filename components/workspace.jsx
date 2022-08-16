import { useEffect, useRef, useState } from 'react'

import Container from 'react-bootstrap/Container'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Button from 'react-bootstrap/Button'
import Form from 'react-bootstrap/Form'
import InputGroup from 'react-bootstrap/InputGroup'
import Modal from 'react-bootstrap/Modal'

import Item from './item'

import BSafesStyle from '../styles/BSafes.module.css'



import { debugLog } from '../lib/helper'

export default function Workspace({}) {
    const [show, setShow] = useState(false);

    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);

    return (
        <Container>
            <Row>
                <InputGroup className="mb-3">
                    <Form.Control
                        placeholder="Recipient's username"
                        aria-label="Recipient's username"
                        aria-describedby="basic-addon2"
                    />
                    <Button variant="link">
                        <i id="1" className="fa fa-search fa-lg" aria-hidden="true"></i>
                    </Button>
                </InputGroup>
            </Row>
            <Row className="justify-content-center">     
                <Button variant="primary" className={BSafesStyle.btnCircle} onClick={handleShow}>
                    <i id="1" className="fa fa-plus fa-lg" aria-hidden="true"></i>
                </Button>

                <Modal show={show} onHide={handleClose}>
                    <Modal.Header closeButton>
                        <Modal.Title>Modal heading</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>Woohoo, you're reading this text in a modal!</Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={handleClose}>
                            Close
                        </Button>
                        <Button variant="primary" onClick={handleClose}>
                            Save Changes
                        </Button>
                    </Modal.Footer>
                </Modal>        		
            </Row>
            <Row className="mt-5 justify-content-center">     
                <Col>
                    <Item />
                </Col>   		
            </Row>            
        </Container>
    )

}