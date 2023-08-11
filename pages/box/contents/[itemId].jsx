import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useSelector, useDispatch } from 'react-redux'

import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'

import BSafesStyle from '../../../styles/BSafes.module.css'

import ContentPageLayout from '../../../components/layouts/contentPageLayout';
import PageItemWrapper from "../../../components/pageItemWrapper";
import TopControlPanel from "../../../components/topControlPanel";
import ItemCard from '../../../components/itemCard'
import AddAnItemButton from "../../../components/addAnItemButton";
import NewItemModal from "../../../components/newItemModal";
import PaginationControl from "../../../components/paginationControl";

import { createANewItemThunk, clearNewItem, listItemsThunk, searchItemsThunk, getFirstItemInContainer, getLastItemInContainer } from "../../../reduxStore/containerSlice";
import {  } from "../../../reduxStore/pageSlice";

import { debugLog } from "../../../lib/helper";
import { getItemLink} from "../../../lib/bSafesCommonUI";

export default function BoxContents() {
    const debugOn = true;
    debugLog(debugOn, "Rendering Contents");
    const dispatch = useDispatch();
    const router = useRouter();

    const [selectedItemType, setSelectedItemType] = useState(null);
    const [addAction, setAddAction] = useState(null);
    const [targetItem, setTargetItem] = useState(null);
    const [targetPosition, setTargetPosition] = useState(null);
    const [showNewItemModal, setShowNewItemModal] = useState(false);
    const [searchValue, setSearchValue] = useState(null);

    const containerInWorkspace = useSelector( state => state.container.container);
    const mode = useSelector( state => state.container.mode);
    const itemsState = useSelector( state => state.container.items);
    const newItem = useSelector( state => state.container.newItem);
    const pageNumber = useSelector(state => state.container.pageNumber);
    const itemsPerPage = useSelector(state => state.container.itemsPerPage);
    const total = useSelector(state => state.container.total);
    const workspaceKey = useSelector( state => state.container.workspaceKey);
    const workspaceSearchKey = useSelector( state => state.container.searchKey);
    const workspaceSearchIV = useSelector( state => state.container.searchIV);

    const handleAdd = (type, action, target, position) => {
        debugLog(debugOn, `${type} ${action} ${target} ${position}`);
        addAnItem(type, action, target, position );
    }

    const items = itemsState.map((item, index) =>
        <Row key={index}>
            <Col lg={{span:10, offset:1}}>
                <ItemCard itemIndex={index} item={item} onAdd={handleAdd}/>
            </Col>
        </Row>
    );

    function gotoAnotherPage(anotherPageNumber) {
    }

    const gotoNextPage = () =>{
        debugLog(debugOn, "Next Page ");
        gotoAnotherPage('+1');
    }

    const gotoPreviousPage = () => {
        debugLog(debugOn, "Previous Page ");
        gotoAnotherPage('-1');
    }

    const addAnItem = (itemType, addAction, targetItem = null, targetPosition = null) => {    
        setSelectedItemType(itemType);
        setAddAction(addAction);
        setTargetItem(targetItem);
        setTargetPosition(targetPosition);
        setShowNewItemModal(true);        
    }

    const handleCoverClicked = () => {
        let newLink = `/box/${containerInWorkspace}`;
        router.push(newLink);
    }

    const handleGoToFirstItem = async () => {
        try {
            const itemId = await getFirstItemInContainer(containerInWorkspace);
            if(itemId) {
                const newLink = `/${itemId}`;
                router.push(newLink);
            }
        } catch(error) {
            alert("Could not get the first item in the container");
        }
    }

    const handleGoToLastItem = async () => {
        try {
            const itemId = await getLastItemInContainer(containerInWorkspace);
            if(itemId) {
                const newLink = `/${itemId}`;
                router.push(newLink);
            }
        } catch(error) {
            alert("Could not get the first item in the container");
        }
    }

    const handleClose = () => setShowNewItemModal(false);

    const handleCreateANewItem = async (titleStr) => {
        debugLog(debugOn, "createANewItem", titleStr);
        setShowNewItemModal(false);

        dispatch(createANewItemThunk({titleStr, currentContainer:containerInWorkspace, selectedItemType, addAction, targetItem, targetPosition, workspaceKey, searchKey:workspaceSearchKey, searchIV:workspaceSearchIV}))
        //const item = await createANewItem(title, containerInWorkspace, selectedItemType, addAction, targetItem, targetPosition, workspaceKey, workspaceSearchKey, workspaceSearchIV );
    }

    const handleSubmitSearch = (value) => {
        setSearchValue(value);
        dispatch(searchItemsThunk({searchValue:value, pageNumber:1}));
    }

    const handleCancelSearch = () => {
        dispatch(listItemsThunk({pageNumber: 1}));
    }

    const listItems = ({ pageNumber = 1, searchMode }) => {
        const derivedSearchMode = searchMode || mode;
        if (derivedSearchMode === 'listAll')
            dispatch(listItemsThunk({ pageNumber }));
        else if (derivedSearchMode === 'search')
            dispatch(searchItemsThunk({ searchValue, pageNumber }));
    }

    useEffect(()=> {
        if(newItem) {
            const link = getItemLink(newItem, true);
            dispatch(clearNewItem());
            router.push(link);
        }
    }, [newItem]);

    return (
        <div className={BSafesStyle.pageBackground}>
            <ContentPageLayout> 
                <PageItemWrapper itemId={router.query.itemId}>
                    <br />
                        <TopControlPanel onCoverClicked={handleCoverClicked} onGotoFirstItem={handleGoToFirstItem} onGotoLastItem={handleGoToLastItem} onSubmitSearch={handleSubmitSearch} onCancelSearch={handleCancelSearch}></TopControlPanel>
                    <br />  
                    <Row>
                        <Col lg={{span:10, offset:1}}>
                            <div className={`${BSafesStyle.pagePanel} ${BSafesStyle.boxPanel}`}>
                                <br />
                                <br />
                                <p className='fs-1 text-center'>Contents</p>
                                <Row className="justify-content-center">     
                                    <AddAnItemButton addAnItem={addAnItem}/>
                                </Row>
                                <NewItemModal show={showNewItemModal} handleClose={handleClose} handleCreateANewItem={handleCreateANewItem}/>
                                <br />
                                <br />
                                
                                {items}
                                {itemsState && itemsState.length > 0 && (total > itemsPerPage) &&
                                    <Row>
                                        <Col sm={{ span: 10, offset: 1 }} md={{ span: 8, offset: 2 }}>
                                            <div className='mt-4'>
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
                            </div>
                        </Col>
                    </Row>
                </PageItemWrapper>
            </ContentPageLayout>
        </div>
    )
}