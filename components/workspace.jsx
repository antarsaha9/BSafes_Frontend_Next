import { useEffect, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useRouter } from 'next/router';

import Link from 'next/link';

import Container from 'react-bootstrap/Container'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Button from 'react-bootstrap/Button'
import Form from 'react-bootstrap/Form'
import InputGroup from 'react-bootstrap/InputGroup'
import Spinner from 'react-bootstrap/Spinner';

import BSafesStyle from '../styles/BSafes.module.css'

import AddAnItemButton from './addAnItemButton'
import NewItemModal from './newItemModal'
import ItemCard from './itemCard'
import PaginationControl from './paginationControl';

import { getItemLink } from '../lib/bSafesCommonUI'
import { createANewItemThunk, clearNewItem, listItemsThunk, searchItemsThunk } from '../reduxStore/containerSlice';
import { clearPage, itemPathLoaded } from '../reduxStore/pageSlice';
import { debugLog } from '../lib/helper'

export default function Workspace({readyToList = false}) {
    const debugOn = false;
    debugLog(debugOn, "Rendering Workspace");
    const router = useRouter();
    const dispatch = useDispatch();
    
    const workspaceId = useSelector( state => state.container.workspace);
    const workspaceKey = useSelector( state => state.container.workspaceKey);
    const workspaceKeyReady = useSelector( state => state.container.workspaceKeyReady);
    const workspaceSearchKey = useSelector( state => state.container.searchKey);
    const workspaceSearchIV = useSelector( state => state.container.searchIV);
    const container = useSelector( state => state.container.container);
    const mode = useSelector( state => state.container.mode);
    const activity = useSelector( state => state.container.activity);

    const [searchValue, setSearchValue] = useState("");

    const itemsState = useSelector( state => state.container.items);
    const newItem = useSelector( state => state.container.newItem);
    const pageNumber = useSelector(state => state.container.pageNumber);
    const itemsPerPage = useSelector(state => state.container.itemsPerPage);
    const total = useSelector(state => state.container.total);

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

    const handleCreateANewItem = async (titleStr) => {
        debugLog(debugOn, "createANewItem", titleStr);
        setShowNewItemModal(false);

        dispatch(createANewItemThunk({titleStr, currentContainer:workspaceId, selectedItemType, addAction, targetItem, targetPosition, workspaceKey, searchKey:workspaceSearchKey, searchIV:workspaceSearchIV}));
    
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

    const listItems = ({ pageNumber = 1, searchMode }) => {
        const derivedSearchMode = searchMode || mode;
        if (derivedSearchMode === 'listAll')
            dispatch(listItemsThunk({ pageNumber }));
        else if (derivedSearchMode === 'search')
            dispatch(searchItemsThunk({ searchValue, pageNumber }));
    }

    useEffect(() => {
        debugLog(debugOn, `workspaceKeyReady: ${workspaceKeyReady} `);
        if(!readyToList || !workspaceId || !workspaceKeyReady || container !== 'root') return;
        debugLog(debugOn, "listItemsThunk");
        dispatch(clearPage());
        const itemPath = [{_id: workspaceId}];
        dispatch(itemPathLoaded(itemPath));
        dispatch(listItemsThunk({pageNumber: 1}));
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [readyToList, container, workspaceId, workspaceKeyReady ]);

    useEffect(()=> {
        if(newItem) {
            const link = getItemLink(newItem);
            dispatch(clearNewItem());
            router.push(link);
        }
    }, [newItem]);

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
            { (activity !== 'Done' && activity !== 'Error') &&
                <Row className="justify-content-center">
                    <Spinner animation='border' />
                </Row>
            }
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
            {itemsState && itemsState.length > 0 &&
                <Row>
                    <Col sm={{ span: 10, offset: 1 }} md={{ span: 8, offset: 2 }}>
                        <div className='mt-4 d-flex justify-content-center'>
                            <PaginationControl
                                page={pageNumber}
                                // between={4}
                                total={total}
                                limit={itemsPerPage}
                                changePage={(page) => {
                                    listItems({pageNumber:page})
                                }}
                                ellipsis={1}
                            />
                        </div>
                    </Col>
                </Row>}
            <br />
            <br />
            <br />
            {workspaceId && <Row>
                <Col xs={12}>
                    <Link href={"/trashBox/" + workspaceId} legacyBehavior>
                        <Button variant="light" className='pull-right border-0 shadow-none'>
                            <i className="fa fa-5x fa-trash" aria-hidden="true" />
                        </Button>
                    </Link>
                </Col>
            </Row>}
        </Container>
    )

}