import { useEffect, useState } from "react";
import {useRouter} from "next/router";
import { useSelector, useDispatch } from 'react-redux'

import Container from 'react-bootstrap/Container'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'

import BSafesStyle from '../../styles/BSafes.module.css'

import Scripts from "../../components/scripts";
import ContentPageLayout from '../../components/layouts/contentPageLayout';

import TopControlPanel from "../../components/topControlPanel"
import ItemTopRows from "../../components/itemTopRows";
import PageCommons from "../../components/pageCommons";

import { clearContainer, initContainer} from '../../reduxStore/containerSlice';
import { abort, clearPage, decryptPageItemThunk, getPageItemThunk, getPageCommentsThunk } from "../../reduxStore/pageSlice";
import { debugLog } from "../../lib/helper";

export default function Page() {
    const debugOn = true;
    debugLog(debugOn, "Rendering item");
    const dispatch = useDispatch();
    const router = useRouter();

    const [pageItemId, setPageItemId] = useState(null); 
    const [pageCleared, setPageCleared] = useState(false); 
    const [containerCleared, setContainerCleared] = useState(false);
    const [workspaceKeyReady, setWorkspaceKeyReady] = useState(false);

    const searchKey = useSelector( state => state.auth.searchKey);
    const searchIV = useSelector( state => state.auth.searchIV);
    const expandedKey = useSelector( state => state.auth.expandedKey );
    
    const containerInWorkspace = useSelector( state => state.container.container);
    const workspaceKey = useSelector( state => state.container.workspaceKey);

    const space = useSelector( state => state.page.space);
    const container = useSelector( state => state.page.container);
    const itemCopy = useSelector( state => state.page.itemCopy);

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
                dispatch(initContainer({container, workspaceId:space, workspaceKey: expandedKey, searchKey, searchIV }));
                setWorkspaceKeyReady(true);
            } else {
            }
        }
    }, [containerCleared]);

    useEffect(()=>{
        debugLog(debugOn, "useEffect [workspaceKey] ...");
        if((workspaceKeyReady && workspaceKey && itemCopy && pageCleared)) {
            setPageCleared(false);
            setContainerCleared(false);
            debugLog(debugOn, "Dispatch decryptPageItemThunk ...");
            dispatch(decryptPageItemThunk({itemId:pageItemId, workspaceKey}));
            dispatch(getPageCommentsThunk({itemId:pageItemId}));
        }
    }, [workspaceKeyReady]);
    
    return (
        <div className={BSafesStyle.pageBackground}>
            <ContentPageLayout>            
                <Container> 
                    <br />
                        <TopControlPanel></TopControlPanel>
                    <br />  
                    <div className={BSafesStyle.pagePanel}>
                        <ItemTopRows />
                        <Row className="justify-content-center">
                            <Col xs="12" sm="10" md="8">
                                <hr />
                            </Col>
                        </Row>
                        <PageCommons />
                    </div>
                </Container>           
            </ContentPageLayout>
            <Scripts />
        </div>
        
    )
}