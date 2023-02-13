import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useSelector, useDispatch } from 'react-redux'

import Container from 'react-bootstrap/Container'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'

import BSafesStyle from '../../../styles/BSafes.module.css'

import Scripts from "../../../components/scripts";
import ContentPageLayout from '../../../components/layouts/contentPageLayout';
import PageItemWrapper from "../../../components/pageItemWrapper";

import TopControlPanel from "../../../components/topControlPanel";
import ItemTopRows from "../../../components/itemTopRows";
import PageCommons from "../../../components/pageCommons";
import TurningPageControls from "../../../components/turningPageControls";
import NewItemModal from '../../../components/newItemModal'

import { setNavigationInSameContainer, getFirstItemInContainer, getLastItemInContainer, createANewItem} from '../../../reduxStore/containerSlice';
import { setChangingPage } from "../../../reduxStore/pageSlice";

import { debugLog } from "../../../lib/helper";
import { getItemLink, gotoAnotherFolderPage } from "../../../lib/bSafesCommonUI";

export default function FolderPage() {
    const debugOn = true;
    debugLog(debugOn, "Rendering item");

    const router = useRouter();
    
    const [selectedItemType, setSelectedItemType] = useState(null);
    const [addAction, setAddAction] = useState(null);
    const [targetItem, setTargetItem] = useState(null);
    const [targetPosition, setTargetPosition] = useState(null);
    const [showNewItemModal, setShowNewItemModal] = useState(false);

    const changingPage = useSelector(state => state.page.changingPage);
    const pageItemId = useSelector(state => state.page.id);
    const container = useSelector(state => state.page.container);
    const position = useSelector(state => state.page.position);

    const containerInWorkspace = useSelector(state => state.container.container);
    const workspaceKey = useSelector(state => state.container.workspaceKey);
    const workspaceSearchKey = useSelector( state => state.container.searchKey);
    const workspaceSearchIV = useSelector( state => state.container.searchIV);

    async function gotoAnotherPage(anotherPageNumber) {
        debugLog(debugOn, `gotoAnotherPage ${changingPage} ${pageItemId} ${container} ${position}`);
        if(changingPage || !(pageItemId || !container || !position)) return;
        setChangingPage(true);
        let result, nextPageId = null;
        switch (anotherPageNumber) {
            case '-1':
                try{
                    result = await gotoAnotherFolderPage('getPreviousFolderPage', container, position);
                    if (result === 'EndOfFolder') {
                        nextPageId = `/folder/contents/${container}`; 
                    } else {
                        nextPageId = `/folder/p/${result}`; 
                    }
                } catch(error) {

                }
                break;
            case '+1':
                try{
                    result = await gotoAnotherFolderPage('getNextFolderPage', container, position);
                    if (result === 'EndOfFolder') {
                        alert('End of folder');
                    } else {
                        nextPageId = `/folder/p/${result}`; 
                    }
                } catch(error) {

                }
                break;
            default:
        }
        debugLog(debugOn, "setNavigationInSameContainer ...");

        setNavigationInSameContainer(true);
        if (nextPageId) {
            router.push(nextPageId);
        } else {
            setChangingPage(false);
        }
    }

    const gotoNextPage = () => {
        debugLog(debugOn, "Next Page ");
        gotoAnotherPage('+1');
    }

    const gotoPreviousPage = () => {
        debugLog(debugOn, "Previous Page ");
        gotoAnotherPage('-1');
    }

    const handleCoverClicked = () => {
        let newLink = `/folder/${containerInWorkspace}`;
        router.push(newLink);
    }

    const handleContentsClicked = () => {
        const contentsPageLink = `/folder/contents/${container}`;
        router.push(contentsPageLink);
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


    const handleAdd = (type, action, target, position) => {
        debugLog(debugOn, `${type} ${action} ${target} ${position}`);
        addAnItem(type, action, target, position );
    }

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


        const item = await createANewItem(title, containerInWorkspaces, selectedItemType, addAction, targetItem, targetPosition, workspaceKey, workspaceSearchKey, workspaceSearchIV );
        const link = getItemLink(item);

        router.push(link);
    }

    return (
        <div className={BSafesStyle.pageBackground}>
            <ContentPageLayout>            
                <PageItemWrapper itemId={router.query.itemId}>
                    <br />
                    <TopControlPanel onCoverClicked={handleCoverClicked} onContentsClicked={handleContentsClicked} onGotoFirstItem={handleGoToFirstItem} onGotoLastItem={handleGoToLastItem} onAdd={handleAdd}></TopControlPanel>
                    <br />  
                    <Row>
                        <Col lg={{span:10, offset:1}}>
                            <div className={`${BSafesStyle.pagePanel}`}>
                                <ItemTopRows />
                                <PageCommons />
                            </div>
                        </Col>
                    </Row> 
                    <NewItemModal show={showNewItemModal} handleClose={handleClose} handleCreateANewItem={handleCreateANewItem}/>
                    <TurningPageControls onNextClicked={gotoNextPage} onPreviousClicked={gotoPreviousPage} />

                </PageItemWrapper>  
            </ContentPageLayout>
            <Scripts />
        </div>
    )
}
