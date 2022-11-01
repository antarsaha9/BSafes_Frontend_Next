import { useEffect, useState } from "react";
import {useRouter} from "next/router";
import { useSelector, useDispatch } from 'react-redux'

import Container from 'react-bootstrap/Container'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'

import BSafesStyle from '../../styles/BSafes.module.css'

import ContentPageLayout from '../../components/layouts/contentPageLayout';

import ItemTopRows from "../../components/itemTopRows";
import PageCommons from "../../components/pageCommons";

import { getPageItemThunk } from "../../reduxStore/pageSlice";
import { debugLog } from "../../lib/helper";

export default function Page() {
    const debugOn = true;
    debugLog(debugOn, "Rendering item");
    const dispatch = useDispatch();
    const router = useRouter();

    const [pageItemId, setPageItemId] = useState(null); 

    const {itemId} = router.query;
    if(itemId && !pageItemId) {
        setPageItemId(itemId);
    }
    
    const expandedKey = useSelector( state => state.auth.expandedKey );

    useEffect(()=>{
        if(!router.isReady || pageItemId) return;
        const {itemId} = router.query;
        setPageItemId(itemId);
    }, [router.isReady]);

    useEffect(()=>{
        console.log('entered',pageItemId , expandedKey);
        if(pageItemId && expandedKey) {
            dispatch(getPageItemThunk({itemId, expandedKey}));
        }
    }, [pageItemId, expandedKey]);
    
    return (
        <div className={BSafesStyle.pageBackground}>
            <ContentPageLayout>            
                <Container> 
                    <div className={BSafesStyle.pagePanel}>
                        <ItemTopRows pageItemId={pageItemId} />
                        <Row className="justify-content-center">
                            <Col xs="12" sm="10" md="8">
                                <hr />
                            </Col>
                        </Row>
                        <PageCommons />
                    </div>
                </Container>           
            </ContentPageLayout>
        </div>
        
    )
}