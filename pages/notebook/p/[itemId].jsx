import { useState } from "react";
import {useRouter} from "next/router";
import { useSelector, useDispatch } from 'react-redux'

import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'

import BSafesStyle from '../../../styles/BSafes.module.css'

import Scripts from "../../../components/scripts";
import ContentPageLayout from '../../../components/layouts/contentPageLayout';
import PageItemWrapper from "../../../components/pageItemWrapper";

import TopControlPanel from "../../../components/topControlPanel"
import ItemTopRows from "../../../components/itemTopRows";
import PageCommons from "../../../components/pageCommons";
import TurningPageControls from "../../../components/turningPageControls";

import { setNavigationInSameContainer, getFirstItemInContainer, getLastItemInContainer } from '../../../reduxStore/containerSlice';

import { debugLog } from "../../../lib/helper";

export default function NotebookPage() {
    const debugOn = true;
    debugLog(debugOn, "Rendering NotebookPage");

    const dispatch = useDispatch();
    const router = useRouter();
    
    const pageItemId = useSelector( state => state.page.id);
    const pageStyle = useSelector( state => state.page.style);
    const pageNumber = useSelector( state=> state.page.pageNumber);
    const container = useSelector( state => state.page.container);
    debugLog(debugOn, "pageNumber: ", pageNumber);

    const containerInWorkspace = useSelector( state => state.container.container);

    function gotoAnotherPage (anotherPageNumber) {
        if(!(pageItemId && pageNumber)) return;

        let idParts, nextPageId;
        idParts = pageItemId.split(':');
        idParts.splice(-1);
        switch(anotherPageNumber) {
            case '-1':
                if(pageNumber > 1) {
                    idParts.push((pageNumber-1));
                } else {
                    if(!containerInWorkspace) return;
                    router.push(`/notebook/contents/${containerInWorkspace}`);
                    return;
                }
                break;
            case '+1':
                idParts.push((pageNumber+1));
                break;
            default:
                idParts.push(anotherPageNumber);
            
        }

        nextPageId = idParts.join(':');
        debugLog(debugOn, "setNavigationInSameContainer ...");
        dispatch(setNavigationInSameContainer(true));
        router.push(`/notebook/p/${nextPageId}`);       
    }

    const gotoNextPage = () =>{
        debugLog(debugOn, "Next Page ");
        gotoAnotherPage('+1');
    }

    const gotoPreviousPage = () => {
        debugLog(debugOn, "Previous Page ");
        gotoAnotherPage('-1');
    }

    const handleCoverClicked = () => {
        let newLink = `/notebook/${containerInWorkspace}`;
        router.push(newLink);
    }

    const handleContentsClicked = () => {
        const contentsPageLink = `/notebook/contents/${container}`;
        router.push(contentsPageLink);
    }

    const handlePageNumberChanged = (anotherPageNumber) => {
        debugLog(debugOn, "handlePageNumberChanged: ", anotherPageNumber);
        gotoAnotherPage(anotherPageNumber);
    }

    const handleGoToFirstItem = async () => {
        try {
            const itemId = await getFirstItemInContainer(containerInWorkspace);
            const newLink = `/notebook/p/${itemId}`;
            router.push(newLink);
        } catch(error) {
            alert("Could not get the first item in the container");
        }
    }

    const handleGoToLastItem = async () => {
        try {
            const itemId = await getLastItemInContainer(containerInWorkspace);
            const newLink = `/notebook/p/${itemId}`;
            router.push(newLink);
        } catch(error) {
            alert("Could not get the first item in the container");
        }
    }
    
    return (
        <div className={BSafesStyle.pageBackground}>
            <ContentPageLayout>            
                <PageItemWrapper itemId={router.query.itemId}>
                    <br />
                    <TopControlPanel pageNumber={pageNumber} onCoverClicked={handleCoverClicked} onContentsClicked={handleContentsClicked} onPageNumberChanged={handlePageNumberChanged} onGotoFirstItem={handleGoToFirstItem} onGotoLastItem={handleGoToLastItem}></TopControlPanel>
                    <br />  
                    <Row>
                        <Col lg={{span:10, offset:1}}>
                            <div className={`${BSafesStyle.pagePanel} ${BSafesStyle.notebookPanel} ${pageStyle}`}>
                                <ItemTopRows />
                                <PageCommons />
                            </div>  
                        </Col>
                    </Row> 

                    <TurningPageControls onNextClicked={gotoNextPage} onPreviousClicked={gotoPreviousPage} />
   
                </PageItemWrapper>           
            </ContentPageLayout>
            <Scripts />
        </div>

    )
}