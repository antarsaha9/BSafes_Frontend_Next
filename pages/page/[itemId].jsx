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

export default function Page() {
    const dispatch = useDispatch();

    const router = useRouter();
    const {itemId} = router.query;

    const memberId = useSelector( state => state.auth.memberId );
    const expandedKey = useSelector( state => state.auth.expandedKey );
    const searchKey = useSelector( state => state.auth.searchKey);
    const searchIV = useSelector( state => state.auth.searchIV);

    const workspaceId = 'u:' + memberId;

    useEffect(()=>{
        dispatch(getPageItemThunk({itemId}));
    }, []);

    return (
        <ContentPageLayout> 
            <div className={BSafesStyle.pageBackground}>
                <Container> 
                    <p>Item:{itemId}</p>
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
            </div>
        </ContentPageLayout>
        
    )
}