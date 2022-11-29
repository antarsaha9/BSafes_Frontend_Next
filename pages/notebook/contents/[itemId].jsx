import { useEffect, useState } from "react";
import { useSelector, useDispatch } from 'react-redux'
import {useRouter} from "next/router";

import Container from 'react-bootstrap/Container'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'

import BSafesStyle from '../../../styles/BSafes.module.css'

import ContentPageLayout from '../../../components/layouts/contentPageLayout';
import TopControlPanel from "../../../components/topControlPanel";
import ItemRow from "../../../components/itemRow";

import { clearContainer, initContainer, changeContainerOnly, listItemsThunk } from "../../../reduxStore/containerSlice";
import { clearPage, getPageItemThunk } from "../../../reduxStore/pageSlice";
import { debugLog } from "../../../lib/helper";


export default function NotebookContents() {
    const debugOn = true;
    debugLog(debugOn, "Rendering Contents");
    const dispatch = useDispatch();
    const router = useRouter();

    const [pageItemId, setPageItemId] = useState(null);
    const [pageCleared, setPageCleared] = useState(false);
    const [containerCleared, setContainerCleared] = useState(false);
    const [workspaceKeyReady, setWorkspaceKeyReady] = useState(false);

    const searchKey = useSelector( state => state.auth.searchKey);
    const searchIV = useSelector( state => state.auth.searchIV);
    const expandedKey = useSelector( state => state.auth.expandedKey );

    const space = useSelector( state => state.page.space);
    const container = useSelector( state => state.page.container);
    const itemCopy = useSelector( state => state.page.itemCopy);


    const workspace = useSelector( state => state.container.workspace);
    const containerInWorkspace = useSelector( state => state.container.container);
    const itemsState = useSelector( state => state.container.items);
    const workspaceKey = useSelector( state => state.container.workspaceKey);
    const workspaceSearchKey = useSelector( state => state.container.searchKey);
    const workspaceSearchIV = useSelector( state => state.container.searchIV);

    const items = itemsState.map( (item, index) => 
        <ItemRow key={index} item={item}/>
    );


    const handleCoverClicked = () => {

    }

    const handlePageNumberChanged = (anotherPageNumber) => {
        debugLog(debugOn, "handlePageNumberChanged: ", anotherPageNumber);

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
                dispatch(initContainer({container: pageItemId, space, workspaceKey: expandedKey, searchKey, searchIV }));
                setWorkspaceKeyReady(true);
            } else {
            }
        }        
    }, [containerCleared]);

    useEffect(()=>{ 
        debugLog(debugOn, "useEffect [workspaceKey] ...");
        if( itemCopy &&  workspaceKeyReady && pageCleared) {
            setPageCleared(false);
            setContainerCleared(false);
            dispatch(listItemsThunk({pageNumber: 1}));
        }
    }, [workspaceKeyReady, itemCopy]);

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
           	                            <p>Page</p> 
                                    </Col> 
                                    <Col xs={8} sm={8} md={9}>
              	                        <p>Title</p> 
                                    </Col>
                                </Row>
                                {items}
                            </div>
                        </Col>
                    </Row>
                </Container>
            </ContentPageLayout>
        </div>
    )
}