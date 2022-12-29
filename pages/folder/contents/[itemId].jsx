import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useSelector, useDispatch } from 'react-redux'

import Container from 'react-bootstrap/Container'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'

import BSafesStyle from '../../../styles/BSafes.module.css'

import ContentPageLayout from '../../../components/layouts/contentPageLayout';
import TopControlPanel from "../../../components/topControlPanel";
import ItemRow from "../../../components/itemRow";
import TurningPageControls from "../../../components/turningPageControls";
import AddAnItemButton from "../../../components/addAnItemButton";
import NewItemModal from "../../../components/newItemModal";

import { clearContainer, initContainer, changeContainerOnly, clearItems, listItemsThunk, searchItemsThunk, getFirstItemInContainer, getLastItemInContainer } from "../../../reduxStore/containerSlice";
import { clearPage, getPageItemThunk } from "../../../reduxStore/pageSlice";

import { debugLog } from "../../../lib/helper";
import { createANewItem, getItemLink} from "../../../lib/bSafesCommonUI";

export default function FolderContents() {
    const debugOn = true;
    debugLog(debugOn, "Rendering Contents");
    const dispatch = useDispatch();
    const router = useRouter();

    const [pageItemId, setPageItemId] = useState(null);
    const [pageCleared, setPageCleared] = useState(false);
    const [containerCleared, setContainerCleared] = useState(false);
    const [workspaceKeyReady, setWorkspaceKeyReady] = useState(false);

    const [selectedItemType, setSelectedItemType] = useState(null);
    const [addAction, setAddAction] = useState(null);
    const [targetItem, setTargetItem] = useState(null);
    const [targetPosition, setTargetPosition] = useState(null);
    const [showNewItemModal, setShowNewItemModal] = useState(false);

    const searchKey = useSelector( state => state.auth.searchKey);
    const searchIV = useSelector( state => state.auth.searchIV);
    const expandedKey = useSelector( state => state.auth.expandedKey );

    const space = useSelector( state => state.page.space);

    const workspace = useSelector( state => state.container.workspace);
    const containerInWorkspace = useSelector( state => state.container.container);
    const pageNumber = useSelector( state => state.container.pageNumber);
    const totalNumberOfPages = useSelector( state => state.container.totalNumberOfPages );
    const itemsState = useSelector( state => state.container.items);
    const workspaceKey = useSelector( state => state.container.workspaceKey);
    const workspaceSearchKey = useSelector( state => state.container.searchKey);
    const workspaceSearchIV = useSelector( state => state.container.searchIV);

    const handleAdd = (type, action, target, position) => {
        debugLog(debugOn, `${type} ${action} ${target} ${position}`);
        addAnItem(type, action, target, position );
    }

    const items = itemsState.map((item, index) =>
        <ItemRow key={index} item={item} onAdd={handleAdd}/>
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
        let newLink = `/folder/${containerInWorkspace}`;
        router.push(newLink);
    }

    const handleGoToFirstItem = async () => {
        try {
            const itemId = await getFirstItemInContainer(containerInWorkspace);
            if(itemId) {
                const newLink = `/folder/p/${itemId}`;
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
                const newLink = `/folder/p/${itemId}`;
                router.push(newLink);
            }
        } catch(error) {
            alert("Could not get the first item in the container");
        }
    }

    const handleClose = () => setShowNewItemModal(false);

    const handleCreateANewItem = async (title) => {
        debugLog(debugOn, "createANewItem", title);
        setShowNewItemModal(false);

        const item = await createANewItem(title, containerInWorkspace, selectedItemType, addAction, targetItem, targetPosition, workspaceKey, workspaceSearchKey, workspaceSearchIV );
        const link = getItemLink(item);

        router.push(link);
    }

    const handleSubmitSearch = (searchValue) => {
        dispatch(searchItemsThunk({searchValue, pageNumber:1}));
    }

    const handleCancelSearch = () => {
        dispatch(listItemsThunk({pageNumber: 1}));
    }

    useEffect(()=>{
        if(router.query.itemId) {

            dispatch(clearPage());
            dispatch(clearItems());
            
            debugLog(debugOn, "set pageItemId: ", router.query.itemId);
            setPageItemId(router.query.itemId);
            setPageCleared(true);
        }
    }, [router.query.itemId]);

    useEffect(()=>{
        if(pageItemId && pageCleared) {
            debugLog(debugOn, "Dispatch getPageItemThunk ...");
            dispatch(getPageItemThunk({itemId:pageItemId}));
        }
    }, [pageCleared, pageItemId]);

    useEffect(()=>{
        if(space && pageCleared) {
            if(space === workspace) {
                if(pageItemId !== containerInWorkspace) {
                    dispatch(changeContainerOnly({container:pageItemId}));
                }
                setWorkspaceKeyReady(true);
                return;
            }

            dispatch(clearContainer());
            setContainerCleared(true); 

        }
    }, [space]);

    useEffect(()=>{
        if(containerCleared) {
            if (space.substring(0, 1) === 'u') {
                debugLog(debugOn, "Dispatch initWorkspace ...");
                dispatch(initContainer({container: pageItemId, workspaceId: space, workspaceKey: expandedKey, searchKey, searchIV }));
                setWorkspaceKeyReady(true);
            } else {
            }
        }        
    }, [containerCleared]);


    useEffect(()=>{ 
        debugLog(debugOn, "useEffect [workspaceKey] ...");
        if( containerInWorkspace &&  workspaceKeyReady && pageCleared) {
            setPageCleared(false);
            setContainerCleared(false);
            debugLog(debugOn, "listItemsThunk ...");
            dispatch(listItemsThunk({pageNumber: 1}));
        }
    }, [workspaceKeyReady, containerInWorkspace]);

    return (
        <div className={BSafesStyle.pageBackground}>
            <ContentPageLayout> 
                <Container fluid>
                    <br />
                        <TopControlPanel onCoverClicked={handleCoverClicked} onGotoFirstItem={handleGoToFirstItem} onGotoLastItem={handleGoToLastItem} onSubmitSearch={handleSubmitSearch} onCancelSearch={handleCancelSearch}></TopControlPanel>
                    <br />  
                    <Row>
                        <Col lg={{span:10, offset:1}}>
                            <div className={`${BSafesStyle.pagePanel} ${BSafesStyle.folderPanel}`}>
                                <br />
                                <br />
                                <p className='fs-1 text-center'>Contents</p>
                                <Row className="justify-content-center">     
                                    <AddAnItemButton pageOnly={true} addAnItem={addAnItem}/>
                                </Row>
                                <NewItemModal show={showNewItemModal} handleClose={handleClose} handleCreateANewItem={handleCreateANewItem}/>
                                <br />
                                <br />
                                
                                {items}

                            </div>
                        </Col>
                    </Row>
                </Container>
            </ContentPageLayout>
        </div>
    )

}

