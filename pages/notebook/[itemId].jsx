import { useEffect, useState } from "react";
import {useRouter} from "next/router";
import { useSelector, useDispatch } from 'react-redux'

import Container from 'react-bootstrap/Container'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'

import BSafesStyle from '../../styles/BSafes.module.css'

import ContentPageLayout from '../../components/layouts/contentPageLayout';
import ItemTopRows from "../../components/itemTopRows";

import { debugLog } from "../../lib/helper";

export default function Notebook() {
    const debugOn = true;
    debugLog(debugOn, "Rendering item");
    const dispatch = useDispatch();
    const router = useRouter();

    return (
        <div className={BSafesStyle.pageBackground}>
            <ContentPageLayout>            
                <Container> 
                    
                </Container>           
            </ContentPageLayout>
        </div>
        
    )
}
