import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux'

import Link from 'next/link'

import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Card from 'react-bootstrap/Card';

import ContentPageLayout from '../components/layouts/contentPageLayout';
import AddATeamButton from '../components/addATeamButton';
import NewTeamModal from '../components/newTeamModal';

import BSafesStyle from '../styles/BSafes.module.css'

import { debugLog } from '../lib/helper'
import { listTeamsThunk } from '../reduxStore/teamSlice';
import { createANewTeam } from '../lib/bSafesCommonUI';
import TeamCard from '../components/teamCard';

export default function Teams() {
    const debugOn = true;
    const publicKeyPem = useSelector(state => state.auth.publicKey);
    const loggedIn = useSelector(state => state.auth.isLoggedIn);
    const teams = useSelector(state => state.team.teams);
    const [addAction, setAddAction] = useState(null);
    const [targetTeam, setTargetTeam] = useState(null);
    const [targetTeamPosition, setTargetTeamPosition] = useState(null);
    const [showNewTeamModal, setShowNewTeamModal] = useState(false);
    const dispatch = useDispatch()
    const addATeam = (addAction='createANewTeam', targetTeam, targetTeamPosition) => {
        setAddAction(addAction);
        setTargetTeam(targetTeam);
        setTargetTeamPosition(targetTeamPosition)
        setShowNewTeamModal(true);
    }
    const handleClose = () => setShowNewTeamModal(false);

    const handleCreateANewTeam = async (title) => {
        setShowNewTeamModal(false);
        console.log(title, addAction, targetTeam, targetTeamPosition, publicKeyPem);
        createANewTeam(title, addAction, targetTeam, targetTeamPosition, publicKeyPem);
    }

    useEffect(() => {
        loggedIn && dispatch(listTeamsThunk());
    }, [loggedIn]);

    return (
        <div className={BSafesStyle.spaceBackground}>
            <ContentPageLayout>
                <Container fluid>
                    <Row className="personalSpace">
                        <Col sm={{ span: 10, offset: 1 }} md={{ span: 8, offset: 2 }}>
                            <Card>
                                <Link href='/safe'>
                                    <Card.Body style={{ cursor: 'pointer' }}>
                                        <i className="fa fa-heart text-danger"></i>
                                        <h2>Personal</h2>
                                    </Card.Body>
                                </Link>
                            </Card>
                            <br />
                            <p className="text-muted">Only you can access items in your personal workspace.</p>
                        </Col>
                    </Row>
                    <Row className="personalSpace">
                        <Col sm={{ span: 10, offset: 1 }} md={{ span: 8, offset: 2 }}>
                            <h1 className='text-center'>Teams</h1>
                            <br />
                            <p className="text-muted">You could create a team and add other members to your team. Your team members have a workspace to collaborate on items.</p>
                        </Col>
                    </Row>
                    <Row className="justify-content-center mb-4">
                        <Col lg={8}>
                            <Row className="justify-content-center">
                                <AddATeamButton addATeam={addATeam} />
                            </Row>
                            <NewTeamModal show={showNewTeamModal} handleClose={handleClose} handleCreateANewTeam={handleCreateANewTeam} />
                        </Col>
                    </Row>
                    <Row className="personalSpace">
                        <Col sm={{ span: 10, offset: 1 }} md={{ span: 8, offset: 2 }}>
                            {teams.map((team, index) => {
                                return <TeamCard key={index} team={team} addATeam={addATeam} setShowNewTeamModal={setShowNewTeamModal} />
                            })}
                        </Col>
                    </Row>
                </Container>
            </ContentPageLayout>
        </div>
    )
}