import { useEffect, useState } from "react";
import { useSelector, useDispatch } from 'react-redux'
import {useRouter} from "next/router";

import Container from 'react-bootstrap/Container'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'

import BSafesStyle from '../../../styles/BSafes.module.css'

import ContentPageLayout from '../../../components/layouts/contentPageLayout';
import TopControlPanel from "../../../components/topControlPanel";

import { clearContainer, initContainer } from "../../../reduxStore/containerSlice";
import { clearPage, getPageItemThunk } from "../../../reduxStore/pageSlice";
import { debugLog } from "../../../lib/helper";


export default function NotebookContents() {
    const debugOn = true;
    debugLog(debugOn, "Rendering Contents");
    const dispatch = useDispatch();
    const router = useRouter();

    const [containerItemId, setContainerItemId] = useState(null);
    const [pageCleared, setPageCleared] = useState(false);
    
    const searchKey = useSelector( state => state.auth.searchKey);
    const searchIV = useSelector( state => state.auth.searchIV);
    const expandedKey = useSelector( state => state.auth.expandedKey );

    const space = useSelector( state => state.page.space);
    const container = useSelector( state => state.page.container);
    const workspaceKey = useSelector( state => state.container.workspaceKey);
    const workspaceSearchKey = useSelector( state => state.container.searchKey);
    const workspaceSearchIV = useSelector( state => state.container.searchIV);


    const handleCoverClicked = () => {

    }

    const handlePageNumberChanged = (anotherPageNumber) => {
        debugLog(debugOn, "handlePageNumberChanged: ", anotherPageNumber);

    }

    useEffect(()=>{
        if(router.query.itemId) {
            if(router.query.itemId === container) {
                setContainerItemId(router.query.itemId);
                return;
            }
            dispatch(clearPage());
            dispatch(clearContainer());
            debugLog(debugOn, "set pageItemId: ", router.query.itemId);
            setContainerItemId(router.query.itemId);
            setPageCleared(true);
        }
    }, [router.query.itemId]);

    useEffect(()=>{
        if(containerItemId && pageCleared) {
            debugLog(debugOn, "Dispatch getPageItemThunk ...");
            dispatch(getPageItemThunk({itemId:containerItemId}));
        }
    }, [pageCleared, containerItemId]);

    useEffect(()=>{
        if(space && pageCleared) {
            if (space.substring(0, 1) === 'u') {
                debugLog(debugOn, "Dispatch initWorkspace ...");
                dispatch(initContainer({container, space, workspaceKey: expandedKey, searchKey, searchIV }));
	        } else {
            }
        }
    }, [space]);

    useEffect(()=>{ 
        debugLog(debugOn, "useEffect [workspaceKey] ...");
        if(workspaceKey && pageCleared) {
            setPageCleared(false);

        }
    }, [workspaceKey]);

    return (
        <div className={BSafesStyle.pageBackground}>
            <ContentPageLayout> 
                <Container fluid>
                    <br />
                        <TopControlPanel onCoverClicked={handleCoverClicked} onPageNumberChanged={handlePageNumberChanged}></TopControlPanel>
                    <br />  
                    <Row>
                        <Col lg={{span:10, offset:1}}>
                            <div className={`${BSafesStyle.pagePanel} ${BSafesStyle.notebookPanel} ${BSafesStyle.containerContentsPanel}`}>
                                <br />
                                <br />
                                <p className='fs-1 text-center'>Contents</p>
                                <Row>
                                    <Col xs={{span:2, offset:1}} sm={{span:2, offset:1}} md={{span:1, offset:1}}>
           	                            Page 
                                    </Col> 
                                    <Col xs={8} sm={8} md={9}>
              	                        Title 
                                    </Col>
                                </Row>
                            </div>
                        </Col>
                    </Row>
                </Container>
            </ContentPageLayout>
        </div>
    )
}