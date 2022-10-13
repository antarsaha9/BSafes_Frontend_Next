import { useEffect, useRef, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useRouter } from 'next/router';

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

import { createANewItem, getItemLink } from '../lib/bSafesCommonUI'
import { initWorkspace, listItemsThunk } from '../reduxStore/workspaceSlice';
import { debugLog } from '../lib/helper'

export default function Workspace() {
    const debugOn = true;
    debugLog(debugOn, "Rendering Workspace");
    const router = useRouter();
    const dispatch = useDispatch();
    
    const workspaceId = useSelector( state => state.workspace.currentSpace);
    const workspaceKey = useSelector( state => state.workspace.workspaceKey);
    const searchKey = useSelector( state => state.workspace.searchKey);
    const searchIV = useSelector( state => state.workspace.searchIV);

    const [selectedItemType, setSelectedItemType] = useState(null);
    const [addAction, setAddAction] = useState(null);
    const [targetItem, setTargetItem] = useState(null);
    const [showNewItemModal, setShowNewItemModal] = useState(false);

    const addAnItem = (itemType, addAction, targetItem = null) => {
    
        setSelectedItemType(itemType);
        setAddAction(addAction);
        setTargetItem(targetItem);
        setShowNewItemModal(true);
        
    }

 

    const handleClose = () => setShowNewItemModal(false);

    const handleCreateANewItem = async (title) => {
        debugLog(debugOn, "createANewItem", title);
        setShowNewItemModal(false);


        const item = await createANewItem(title, workspaceId, selectedItemType, addAction, targetItem, workspaceKey, searchKey, searchIV );
        const link = getItemLink(item);

        router.push(link);
    }

    useEffect(() => {
        if(!workspaceId) return;
        dispatch(listItemsThunk({pageNumber: 1}));
    }, [workspaceId]);

    return (
        <Container>
            <Row>
                <InputGroup className="mb-3">
                    <Form.Control
                        size="lg" type="text"
                    />
                    <Button variant="link">
                        <i id="1" className="fa fa-search fa-lg text-dark" aria-hidden="true"></i>
                    </Button>
                </InputGroup>
            </Row>
            <Row className="justify-content-center">     
                <AddAnItemButton addAnItem={addAnItem}/>
            </Row>

            <NewItemModal show={showNewItemModal} handleClose={handleClose} handleCreateANewItem={handleCreateANewItem}/>
            <Row className="mt-5 justify-content-center">     
                <Col>
                    <Item />
                </Col>   		
            </Row>            
        </Container>
    )

}
