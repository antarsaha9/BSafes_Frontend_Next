import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useSelector, useDispatch } from 'react-redux'

import Container from 'react-bootstrap/Container'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'

import parse from "date-fns/parse";
import format from "date-fns/format";
import isSameDay from "date-fns/isSameDay";

import BSafesStyle from '../../../styles/BSafes.module.css'

import Scripts from "../../../components/scripts";
import ContentPageLayout from '../../../components/layouts/contentPageLayout';

import TopControlPanel from "../../../components/topControlPanel";
import ItemTopRows from "../../../components/itemTopRows";
import PageCommons from "../../../components/pageCommons";
import TurningPageControls from "../../../components/turningPageControls";

import { clearContainer, initContainer } from '../../../reduxStore/containerSlice';
import { abort, clearPage, decryptPageItemThunk, getPageItemThunk, getPageCommentsThunk } from "../../../reduxStore/pageSlice";

import { debugLog } from "../../../lib/helper";

export default function DiaryPage() {
    const debugOn = true;
    debugLog(debugOn, "Rendering item");
    const dispatch = useDispatch();
    const router = useRouter();

    const [pageItemId, setPageItemId] = useState(null);
    const [pageDate, setPageDate] = useState();
    const [pageStyle, setPageStyle] = useState(''); 
    const [pageCleared, setPageCleared] = useState(false); 
    const [containerCleared, setContainerCleared] = useState(false);
    const [workspaceKeyReady, setWorkspaceKeyReady] = useState(false);
    
    const searchKey = useSelector( state => state.auth.searchKey);
    const searchIV = useSelector( state => state.auth.searchIV);
    const expandedKey = useSelector( state => state.auth.expandedKey );

    const space = useSelector( state => state.page.space);
    const container = useSelector( state => state.page.container);
    const itemCopy = useSelector( state => state.page.itemCopy);

    const containerInWorkspace = useSelector( state => state.container.container);
    const workspaceKey = useSelector( state => state.container.workspaceKey);

    function gotoAnotherPage (anotherPageNumber) {
      
    }

    const gotoNextPage = () =>{
        debugLog(debugOn, "Next Page ");
        gotoAnotherPage('+1');
    }

    const gotoPreviousPage = () => {
        debugLog(debugOn, "Previous Page ");
        gotoAnotherPage('-1');
    }

    useEffect(() => {
        const handleRouteChange = (url, { shallow }) => {
          console.log(
            `App is changing to ${url} ${
              shallow ? 'with' : 'without'
            } shallow routing`
          )
          dispatch(abort());
        }
    
        router.events.on('routeChangeStart', handleRouteChange)
    
        // If the component is unmounted, unsubscribe
        // from the event with the `off` method:
        return () => {
          router.events.off('routeChangeStart', handleRouteChange)
        }
    }, []);

    useEffect(()=>{
        if(router.query.itemId) {
            dispatch(clearPage());
            setWorkspaceKeyReady(false);
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
        if(space && pageCleared) {
            if(container === containerInWorkspace ) {
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
                dispatch(initContainer({container, workspaceId: space, workspaceKey: expandedKey, searchKey, searchIV }));
                setWorkspaceKeyReady(true);
            } else {
            }
        }        
    }, [containerCleared]);

    useEffect(()=>{
        debugLog(debugOn, "useEffect [workspaceKeyReady] ...");
        if(workspaceKeyReady && workspaceKey && itemCopy && pageCleared) {
            setPageCleared(false);
            setContainerCleared(false);
            debugLog(debugOn, "Dispatch decryptPageItemThunk ...");
            dispatch(decryptPageItemThunk({itemId:pageItemId, workspaceKey}));
            dispatch(getPageCommentsThunk({itemId:pageItemId}));
        }
    }, [workspaceKeyReady, itemCopy]);

    return (
        <div className={BSafesStyle.pageBackground}>
            <ContentPageLayout>            
                <Container fluid>
                    <br />
                    <TopControlPanel ></TopControlPanel>
                    <br /> 
                    <br />  
                    <Row>
                        <Col lg={{span:10, offset:1}}>
                            <div className={`${BSafesStyle.pagePanel} ${BSafesStyle.diaryPanel} ${pageStyle}`}>
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
    );
}