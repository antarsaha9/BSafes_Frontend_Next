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
import AddAnItemButton from "../../../components/addAnItemButton";
import NewItemModal from "../../../components/newItemModal";

import { clearContainer, initContainer, changeContainerOnly, listItemsThunk } from "../../../reduxStore/containerSlice";
import { clearPage, getPageItemThunk } from "../../../reduxStore/pageSlice";

import { debugLog } from "../../../lib/helper";
import { createANewItem, getItemLink} from "../../../lib/bSafesCommonUI";

export default function BoxContents() {
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
    const itemsState = useSelector( state => state.container.items);
    const workspaceKey = useSelector( state => state.container.workspaceKey);

    const items = itemsState.map((item, index) =>
        <ItemRow key={index} item={item} />
    );

    const addAnItem = (itemType, addAction, targetItem = null) => {
    
        setSelectedItemType(itemType);
        setAddAction(addAction);
        setTargetItem(targetItem);
        setShowNewItemModal(true);
    }

    const handleCoverClicked = () => {
        let newLink = `/box/${containerInWorkspace}`;
        router.push(newLink);
    }

    const handleClose = () => setShowNewItemModal(false);

    const handleCreateANewItem = async (title) => {
        debugLog(debugOn, "createANewItem", title);
        setShowNewItemModal(false);

        const item = await createANewItem(title, containerInWorkspace, selectedItemType, addAction, targetItem, targetPosition, workspaceKey, searchKey, searchIV );
        const link = getItemLink(item);

        router.push(link);
    }

    useEffect(()=>{
        if(router.query.itemId) {

            dispatch(clearPage());
            
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
            dispatch(listItemsThunk({pageNumber: 1}));
        }
    }, [workspaceKeyReady, containerInWorkspace]);

    return (
        <div className={BSafesStyle.pageBackground}>
            <ContentPageLayout> 
                <Container fluid>
                    <br />
                        <TopControlPanel onCoverClicked={handleCoverClicked}></TopControlPanel>
                    <br />  
                    <Row>
                        <Col lg={{span:10, offset:1}}>
                            <div className={`${BSafesStyle.pagePanel} ${BSafesStyle.folderPanel}`}>
                                <br />
                                <br />
                                <p className='fs-1 text-center'>Contents</p>
                                <Row className="justify-content-center">     
                                    <AddAnItemButton pageOnly={false} addAnItem={addAnItem}/>
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

