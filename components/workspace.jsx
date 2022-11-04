import { useEffect, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useRouter } from 'next/router';

import Container from 'react-bootstrap/Container'
import Row from 'react-bootstrap/Row'
import Button from 'react-bootstrap/Button'
import Form from 'react-bootstrap/Form'
import InputGroup from 'react-bootstrap/InputGroup'

import AddAnItemButton from './addAnItemButton'
import NewItemModal from './newItemModal'
import Item from './item'

import { createANewItem, getItemLink } from '../lib/bSafesCommonUI'
import { listItemsThunk } from '../reduxStore/containerSlice';
import { debugLog } from '../lib/helper'

export default function Workspace() {
    const debugOn = true;
    debugLog(debugOn, "Rendering Workspace");
    const router = useRouter();
    const dispatch = useDispatch();
    
    const workspaceId = useSelector( state => state.container.currentSpace);
    const workspaceKey = useSelector( state => state.container.workspaceKey);
    const searchKey = useSelector( state => state.container.searchKey);
    const searchIV = useSelector( state => state.container.searchIV);

    const itemsState = useSelector( state => state.container.items);

    const [selectedItemType, setSelectedItemType] = useState(null);
    const [addAction, setAddAction] = useState(null);
    const [targetItem, setTargetItem] = useState(null);
    const [showNewItemModal, setShowNewItemModal] = useState(false);

    const items = itemsState.map( (item, index) => 
        <Item key={index} item={item}/>
    );

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
            <br />
            <br />
            {items}
        </Container>
    )

}
