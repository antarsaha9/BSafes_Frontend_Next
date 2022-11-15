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

import { clearContainer, initWorkspace } from '../../../reduxStore/containerSlice';
import { clearPage, decryptPageItemThunk, getPageItemThunk } from "../../../reduxStore/pageSlice";
import { debugLog } from "../../../lib/helper";

export default function NotebookPage() {
    const debugOn = true;
    debugLog(debugOn, "Rendering item");
    const dispatch = useDispatch();
    const router = useRouter();

    const [pageItemId, setPageItemId] = useState(null);
    const [pageNumber, setPageNumber] = useState(0);
    const [pageStyle, setPageStyle] = useState('');
    const [pageCleared, setPageCleared] = useState(false); 

    const {itemId} = router.query;
    if(itemId && !pageItemId) {
        setPageItemId(itemId);
    }

    const searchKey = useSelector( state => state.auth.searchKey);
    const searchIV = useSelector( state => state.auth.searchIV);
    const expandedKey = useSelector( state => state.auth.expandedKey );
    
    const space = useSelector( state => state.page.space);
    const itemCopy = useSelector( state => state.page.itemCopy);
    const workspaceKey = useSelector( state => state.container.workspaceKey);

    useEffect(()=>{
        dispatch(clearPage());
        dispatch(clearContainer());
        setPageCleared(true);
    }, []);

    useEffect(()=>{
        if(!router.isReady || pageItemId) return;
        const {itemId} = router.query;
        setPageItemId(itemId);
    }, [router.isReady]);

    useEffect(()=>{
        if(pageItemId) {
            let thisPageNumber = parseInt(pageItemId.split(':')[4]);
            setPageNumber(thisPageNumber);
            
            if(thisPageNumber%2) {
                setPageStyle(BSafesStyle.leftPagePanel);
            } else {
                setPageStyle(BSafesStyle.rightPagePanel);
            }
        }

        if(pageItemId && pageCleared) {
            dispatch(getPageItemThunk({itemId}));
        }
    }, [pageCleared, pageItemId]);

    useEffect(()=>{
        if(space && pageCleared ) {
            if (space.substring(0, 1) === 'u') {
                dispatch(initWorkspace({space, workspaceKey: expandedKey, searchKey, searchIV }));
	        } else {
            }
        }
    }, [space]);

    useEffect(()=>{
        if(workspaceKey && pageCleared && itemCopy) {
            dispatch(decryptPageItemThunk({workspaceKey}));
        }
    }, [workspaceKey]);

    
    return (
        <div className={BSafesStyle.pageBackground}>
            <ContentPageLayout>            
                <Container> 
                    <br />
                        <TopControlPanel></TopControlPanel>
                    <br />  
                    <div className={`${BSafesStyle.pagePanel} ${BSafesStyle.notebookPanel} ${pageStyle}`}>
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