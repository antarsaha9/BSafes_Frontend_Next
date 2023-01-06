import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux'
import {useRouter} from "next/router";

import Link from 'next/link'

import Navbar from 'react-bootstrap/Navbar'
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Breadcrumb from 'react-bootstrap/Breadcrumb';
import Card from 'react-bootstrap/Card';

import ContentPageLayout from '../components/layouts/contentPageLayout';
import AddATeamButton from '../components/addATeamButton';
import NewTeamModal from '../components/newTeamModal';

import BSafesStyle from '../styles/BSafes.module.css'

import { debugLog } from '../lib/helper'

export default function Teams() {
    const debugOn = true;
    const [showNewTeamModal, setShowNewTeamModal] = useState(false);

    const addATeam = (e) => {
        setShowNewTeamModal(true);
    }
    const handleClose = () => setShowNewTeamModal(false);

    const handleCreateANewTeam = async (title) => {
        debugLog(debugOn, "createANewTeam", title);
        setShowNewTeamModal(false);
    }

    return (
        <div className={BSafesStyle.spaceBackground}>
            <Navbar bg="light" expand="lg" className={BSafesStyle.bsafesNavbar}>
                <Container fluid>
                    <Navbar.Brand href="/"><span className={BSafesStyle.navbarTeamName}>BSafes</span></Navbar.Brand>
                </Container>
            </Navbar>
            {false && <>
                <Container fluid>
                {true && <Row>
                    {true && <Col xs={10} sm={11} className={`${BSafesStyle.itemPath} rounded-end`}>
                        {true && <Breadcrumb >
                            {true && <Breadcrumb.Item className={`${BSafesStyle.teamsPathItem}`} linkProps={{ className: BSafesStyle.teamsPathLink }} href='/teams'><i className="fa fa-building" aria-hidden="true" /> Teams </Breadcrumb.Item>}
                            {false && breadItems}
                        </Breadcrumb>}
                        </Col>}
                </Row>}
                </Container>            
            </>}
            <ContentPageLayout>
                
            </ContentPageLayout>
            Hello
        </div>
    )
}