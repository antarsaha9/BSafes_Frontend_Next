import { useEffect, useState } from "react";
import {useRouter} from "next/router";
import { useSelector, useDispatch } from 'react-redux'

import Container from 'react-bootstrap/Container'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'

import BSafesStyle from '../../../styles/BSafes.module.css'

import Scripts from "../../../components/scripts";
import ContentPageLayout from '../../../components/layouts/contentPageLayout';

import TopControlPanel from "../../../components/topControlPanel"
import ItemTopRows from "../../../components/itemTopRows";
import PageCommons from "../../../components/pageCommons";
import TurningPageControls from "../../../components/turningPageControls";

import { clearContainer, initWorkspace } from '../../../reduxStore/containerSlice';
import { clearPage, decryptPageItemThunk, getPageItemThunk, getPageCommentsThunk } from "../../../reduxStore/pageSlice";
import { debugLog } from "../../../lib/helper";

export default function NotebookPage() {
    const debugOn = true;
    debugLog(debugOn, "Rendering item");
    const dispatch = useDispatch();
    const router = useRouter();

    const [pageItemId, setPageItemId] = useState(null);
    const pageNumber = useSelector( state=> state.page.pageNumber);
    const [pageStyle, setPageStyle] = useState('');
    const [pageCleared, setPageCleared] = useState(false); 
/*
    const {itemId} = router.query;
    if(itemId && (!pageItemId || (pageItemId !== itemId))) {
        setPageItemId(itemId);
    }*/
    debugLog(debugOn, "pageNumber: ", pageNumber);
    const searchKey = useSelector( state => state.auth.searchKey);
    const searchIV = useSelector( state => state.auth.searchIV);
    const expandedKey = useSelector( state => state.auth.expandedKey );
    
    const space = useSelector( state => state.page.space);
    const itemCopy = useSelector( state => state.page.itemCopy);
    const workspaceKey = useSelector( state => state.container.workspaceKey);

    function gotoAnotherPage (anotherPageNumber) {
        if(!(pageItemId && pageNumber)) return;

        let idParts, nextPageId;
        idParts = pageItemId.split(':');
        idParts.splice(-1);
        switch(anotherPageNumber) {
            case '-1':
                if(pageNumber > 1) {
                    idParts.push((pageNumber-1));
                }
                break;
            case '+1':
                idParts.push((pageNumber+1));
                break;
            default:
                idParts.push(anotherPageNumber);
            
        }

        nextPageId = idParts.join(':');
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

    const handlePageNumberChanged = (anotherPageNumber) => {
        debugLog(debugOn, "handlePageNumberChanged: ", anotherPageNumber);
        gotoAnotherPage(anotherPageNumber);
    }

    useEffect(()=>{
        if(router.query.itemId) {
            dispatch(clearPage());
            dispatch(clearContainer());
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
    }, [pageItemId, pageCleared]);

    useEffect(()=>{
        if(pageNumber) {
            debugLog(debugOn, "pageNumber: ", pageNumber);
            if(pageNumber%2) {
                setPageStyle(BSafesStyle.leftPagePanel);
            } else {
                setPageStyle(BSafesStyle.rightPagePanel);
            }
        }
    }, [pageNumber])

    useEffect(()=>{
        if(space && pageCleared) {
            
            if (space.substring(0, 1) === 'u') {
                debugLog(debugOn, "Dispatch initWorkspace ...");
                dispatch(initWorkspace({space, workspaceKey: expandedKey, searchKey, searchIV }));
	        } else {
            }
        }
    }, [space]);

    useEffect(()=>{
        debugLog(debugOn, "useEffect [workspaceKey] ...");
        if(workspaceKey && itemCopy && pageCleared) {
            setPageCleared(false);
            debugLog(debugOn, "Dispatch decryptPageItemThunk ...");
            dispatch(decryptPageItemThunk({workspaceKey}));
            dispatch(getPageCommentsThunk({itemId:pageItemId}));
        }
    }, [workspaceKey]);

    
    return (
        <div className={BSafesStyle.pageBackground}>
            <ContentPageLayout>            
                <Container fluid>
                    <br />
                        <TopControlPanel pageNumber={pageNumber} onPageNumberChanged={handlePageNumberChanged}></TopControlPanel>
                    <br />  
                    <Row>
                        <Col lg={{span:10, offset:1}}>
                            <div className={`${BSafesStyle.pagePanel} ${BSafesStyle.notebookPanel} ${pageStyle}`}>
                                <ItemTopRows />
                                <Row className="justify-content-center">
                                    <Col xs="12" sm="10" md="8">
                                        <hr />
                                    </Col>
                                </Row>
                                <PageCommons />
                            </div>  
                        </Col>
                    </Row> 

                    <TurningPageControls onNextClicked={gotoNextPage} onPreviousClicked={gotoPreviousPage} />
   
                </Container>           
            </ContentPageLayout>
            <Scripts />
        </div>

    )
}