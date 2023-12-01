import Container from 'react-bootstrap/Container'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button'

import BSafesStyle from '../../styles/BSafes.module.css'
import ContentPageLayout from "../../components/layouts/contentPageLayout";

import { debugLog } from '../../lib/helper'

export default function MFA() {
    const debugOn = false;

    return (
        <ContentPageLayout> 
            <Container>
                MFA
            </Container>
        </ContentPageLayout>    
    )
}