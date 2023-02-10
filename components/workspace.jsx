import { useEffect, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useRouter } from 'next/router';

import Container from 'react-bootstrap/Container'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Button from 'react-bootstrap/Button'
import Form from 'react-bootstrap/Form'
import InputGroup from 'react-bootstrap/InputGroup'

import BSafesStyle from '../styles/BSafes.module.css'

import AddAnItemButton from './addAnItemButton'
import NewItemModal from './newItemModal'
import ItemCard from './itemCard'

import { getItemLink } from '../lib/bSafesCommonUI'
import { createANewItem, listItemsThunk, searchItemsThunk } from '../reduxStore/containerSlice';
import { clearPage, itemPathLoaded } from '../reduxStore/pageSlice';
import { debugLog } from '../lib/helper'

export default function Workspace() {
    const debugOn = false;
    debugLog(debugOn, "Rendering Workspace");
    const router = useRouter();
    const dispatch = useDispatch();
    
    const workspaceId = useSelector( state => state.container.workspace);
    const workspaceName = useSelector( state => state.container.workspaceName);
    const workspaceKey = useSelector( state => state.container.workspaceKey);
    const workspaceSearchKey = useSelector( state => state.container.searchKey);
    const workspaceSearchIV = useSelector( state => state.container.searchIV);
    const mode = useSelector( state => state.container.mode);

    const [searchValue, setSearchValue] = useState("");

    const itemsState = useSelector( state => state.container.items);

    const [selectedItemType, setSelectedItemType] = useState(null);
    const [addAction, setAddAction] = useState(null);
    const [targetItem, setTargetItem] = useState(null);
    const [targetPosition, setTargetPosition] = useState(null);
    const [showNewItemModal, setShowNewItemModal] = useState(false);

    const handleAdd = (type, action, target, position) => {
        debugLog(debugOn, `${type} ${action} ${target} ${position}`);
        addAnItem(type, action, target, position );
    }

    const items = itemsState.map( (item, index) => 
        <ItemCard key={index} item={item} onAdd={handleAdd}/>
    );

    const addAnItem = (itemType, addAction, targetItem = null, targetPosition = null) => {
    
        setSelectedItemType(itemType);
        setAddAction(addAction);
        setTargetItem(targetItem);
        setTargetPosition(targetPosition);
        setShowNewItemModal(true);
        
    }

    const handleClose = () => setShowNewItemModal(false);

    const handleCreateANewItem = async (title) => {
        debugLog(debugOn, "createANewItem", title);
        setShowNewItemModal(false);


        const item = await createANewItem(title, workspaceId, selectedItemType, addAction, targetItem, targetPosition, workspaceKey, workspaceSearchKey, workspaceSearchIV );
        const link = getItemLink(item);

        router.push(link);
    }

    const onSearchValueChanged = (e) => {
        debugLog(debugOn, "search value:", e.target.value);
        setSearchValue(e.target.value);
    }

    const onSubmit = (e) => {
        e.preventDefault();
        dispatch(searchItemsThunk({searchValue, pageNumber:1}));
    }

    const onCancelSearch = (e) => {
        e.preventDefault();
        setSearchValue('');
        dispatch(listItemsThunk({pageNumber: 1}));
    }

    useEffect(() => {
        if(!workspaceId) return;
        dispatch(clearPage());
        const itemPath = [{_id: workspaceId}];
        dispatch(itemPathLoaded(itemPath));
        dispatch(listItemsThunk({pageNumber: 1}));
    }, [workspaceId]);

    return (
        <Container className={BSafesStyle.container}>
            <Row>
            <Form onSubmit={onSubmit}>
                <InputGroup className="mb-3">
                    <Form.Control size="lg" type="text"
                        value={searchValue} 
                        onChange={onSearchValueChanged}
                    />
                    <Button variant="link">
                        <i id="1" className="fa fa-search fa-lg text-dark" aria-hidden="true" onClick={onSubmit}></i>
                    </Button>
                </InputGroup>
            </Form>
            </Row>
            <Row className="justify-content-center">     
                <AddAnItemButton addAnItem={addAnItem}/>
            </Row>

            <NewItemModal show={showNewItemModal} handleClose={handleClose} handleCreateANewItem={handleCreateANewItem}/>
            <br />
            <br />
            { mode ==='search' &&
            <>
                <Row>
                    <Col>
                        <Button variant="default" className={`${BSafesStyle.btnCircle} pull-right`} onClick={onCancelSearch}>
                            <i id="1" className="fa fa-times fa-lg" aria-hidden="true"></i>
                        </Button>
                    </Col>
                </Row>
                <br />
            </>
            }
            {items}
            <br />
            <br />
        </Container>
    )

}