import { useState } from "react";
import { useSelector, useDispatch } from 'react-redux'
import {useRouter} from "next/router";

import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'

import BSafesStyle from '../../../styles/BSafes.module.css'

import ContentPageLayout from '../../../components/layouts/contentPageLayout';
import PageItemWrapper from "../../../components/pageItemWrapper";
import TopControlPanel from "../../../components/topControlPanel";
import ItemRow from "../../../components/itemRow";
import TurningPageControls from "../../../components/turningPageControls";

import { listItemsThunk, searchItemsThunk, getFirstItemInContainer, getLastItemInContainer } from "../../../reduxStore/containerSlice";
import {  } from "../../../reduxStore/pageSlice";
import { debugLog } from "../../../lib/helper";


export default function NotebookContents() {
    const debugOn = true;
    debugLog(debugOn, "Rendering Contents");
    const dispatch = useDispatch();
    const router = useRouter();



    const containerInWorkspace = useSelector( state => state.container.container);
    const pageNumber = useSelector( state => state.container.pageNumber);
    const totalNumberOfPages = useSelector( state => state.container.totalNumberOfPages );
    const itemsState = useSelector( state => state.container.items);
    
    const pageItemId = useSelector( state => state.page.id);

    const items = itemsState.map( (item, index) => 
        <ItemRow key={index} item={item}/>
    );


    function gotoAnotherPage (anotherPageNumber) {
        if(!(pageItemId)) return;

        let idParts, nextPageId, newLink;
        idParts = pageItemId.split(':');
        idParts.splice(0, 1);
        switch(anotherPageNumber) {
            case '-1':
                if(pageNumber > 1) {

                } else {
                    newLink = `/notebook/${containerInWorkspace}`;  
                }
                break;
            case '+1':
                if(!totalNumberOfPages || (pageNumber === totalNumberOfPages) ) {
                    nextPageId = 'np:'+ idParts.join(':') + ':1';
                    newLink = `/notebook/p/${nextPageId}`; 
                } else {

                }
                break;
            default:
                idParts.push(anotherPageNumber);
                nextPageId = 'np:'+ idParts.join(':');
                newLink = `/notebook/p/${nextPageId}`;         
        }      

        router.push(newLink);
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

    const handlePageNumberChanged = (anotherPageNumber) => {
        debugLog(debugOn, "handlePageNumberChanged: ", anotherPageNumber);
        gotoAnotherPage(anotherPageNumber);
    }

    const handleSubmitSearch = (searchValue) => {
        dispatch(searchItemsThunk({searchValue, pageNumber:1}));
    }

    const handleCancelSearch = () => {
        dispatch(listItemsThunk({pageNumber: 1}));
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
                        <TopControlPanel onCoverClicked={handleCoverClicked} onPageNumberChanged={handlePageNumberChanged} onSubmitSearch={handleSubmitSearch} onCancelSearch={handleCancelSearch} onGotoFirstItem={handleGoToFirstItem} onGotoLastItem={handleGoToLastItem}></TopControlPanel>
                    <br />  
                    <Row>
                        <Col lg={{span:10, offset:1}}>
                            <div className={`${BSafesStyle.pagePanel} ${BSafesStyle.notebookPanel}`}>
                                <br />
                                <br />
                                <p className='fs-1 text-center'>Contents</p>
                                <Row>
                                    <Col xs={{span:2, offset:1}} sm={{span:2, offset:1}} md={{span:1, offset:1}}>
           	                            <p>Page</p> 
                                    </Col> 
                                    <Col xs={8} sm={8} md={9}>
              	                        <p>Title</p> 
                                    </Col>
                                </Row>
                                <Row>
                                    <Col xs={{span:10, offset:1}}>
                                        <hr className="mt-0 mb-0"/>
                                    </Col>
                                </Row>
                                {items}
                            </div>
                        </Col>
                    </Row>
                    <TurningPageControls onNextClicked={gotoNextPage} onPreviousClicked={gotoPreviousPage} />
                </PageItemWrapper>
            </ContentPageLayout>
        </div>
    )
}