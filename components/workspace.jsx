import { useEffect, useRef, useState } from 'react'

import Container from 'react-bootstrap/Container'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Button from 'react-bootstrap/Button'
import Form from 'react-bootstrap/Form'
import InputGroup from 'react-bootstrap/InputGroup'
import Modal from 'react-bootstrap/Modal'

import AddAnItemButton from './addAnItemButton'
import NewItemModal from './newItemModal'
import Item from './item'




import { debugLog } from '../lib/helper'

export default function Workspace({}) {
    const debugOn = true;
    debugLog(debugOn, "Rendering Workspace");
    const [newItemModalVisiable, setNewItemModalVisiable] = useState(false);

    const itemTypeIsSelected = (itemType) => {
        
        setShow(true);
        
    }

    const [show, setShow] = useState(false);

    const handleClose = () => setShow(false);

    const createANewItem = (title) => {
        debugLog(debugOn, "createANewItem", title);
        setShow(false);
        alert(title);
    }

    return (
        <Container>
            <Row>
                <InputGroup className="mb-3">
                    <Form.Control
                        size="lg" type="text"
                    />
                    <Button variant="link">
                        <i id="1" className="fa fa-search fa-lg" aria-hidden="true"></i>
                    </Button>
                </InputGroup>
            </Row>
            <Row className="justify-content-center">     
                <AddAnItemButton itemTypeIsSelected={itemTypeIsSelected}/>
            </Row>

            <NewItemModal show={show} handleClose={handleClose} createANewItem={createANewItem}/>
            <Row className="mt-5 justify-content-center">     
                <Col>
                    <Item />
                </Col>   		
            </Row>            
        </Container>
    )

}

/*
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
*/