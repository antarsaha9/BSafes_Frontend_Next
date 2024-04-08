import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux'

import Link from 'next/link'

import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Card from 'react-bootstrap/Card';

import ContentPageLayout from '../components/layouts/contentPageLayout';
import AddATeamButton from '../components/addATeamButton';
import NewTeamModal from '../components/newTeamModal';
import TeamCard from '../components/teamCard';
import PaginationControl from '../components/paginationControl';

import BSafesStyle from '../styles/BSafes.module.css'

import { clearContainer } from '../reduxStore/containerSlice';
import { createANewTeamThunk, listTeamsThunk } from '../reduxStore/teamSlice';
import { debugLog } from '../lib/helper'

export default function Teams() {
    const debugOn = false;
    const dispatch = useDispatch();

    const [containerCleared, setContainerCleared] = useState(false);

    const loggedIn = useSelector(state => state.auth.isLoggedIn);
    const publicKeyPem = useSelector(state => state.auth.publicKey);

    const teams = useSelector(state => state.team.teams);
    const pageNumber = useSelector(state => state.team.pageNumber);
    const itemsPerPage = useSelector(state => state.team.itemsPerPage);
    const total = useSelector(state => state.team.total);

    const [addAction, setAddAction] = useState(null);
    const [targetIndex, setTargetIndex] = useState(null);
    const [targetTeam, setTargetTeam] = useState(null);
    const [targetPosition, setTargetPosition] = useState(null);
    const [showNewTeamModal, setShowNewTeamModal] = useState(false);

    const addATeam = ({ action = 'addATeamOnTop', index, targetTeam, targetPosition }) => {
        setAddAction(action);
        setTargetIndex(index);
        setTargetTeam(targetTeam);
        setTargetPosition(targetPosition);
        setShowNewTeamModal(true);
    }
    const handleClose = () => setShowNewTeamModal(false);

    const handleCreateANewTeam = async (title) => {
        debugLog(debugOn, "createANewTeam", title);
        setShowNewTeamModal(false);
        dispatch(createANewTeamThunk({ title, addAction, targetIndex, targetTeam, targetPosition, publicKeyPem }));
    }

    const loadTeams = (pageNumber = 1) => {
        dispatch(listTeamsThunk({ pageNumber }));

        setContainerCleared(false);
    }

    useEffect(() => {
        debugLog(debugOn, "loggedIn value: ", loggedIn);
        if (loggedIn && !containerCleared) {
            dispatch(clearContainer());
            setContainerCleared(true);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps   
    }, [loggedIn]);

    useEffect(() => {
        if (containerCleared) {
            loadTeams();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [containerCleared]);

    return (
        <div className={BSafesStyle.spaceBackground}>
            <div className={BSafesStyle.bannerBackground}>
                <ContentPageLayout>
                    <Container fluid>
                        <br />
                        <Row>
                            <Col sm={{ span: 10, offset: 1 }} md={{ span: 8, offset: 2 }}>
                                <Card>
                                    <Link href='/safe' legacyBehavior>
                                        <Card.Body>
                                            <i className="fa fa-heart text-danger"></i>
                                            <h2>Personal</h2>
                                        </Card.Body>
                                    </Link>
                                </Card>
                                <br />
                                <p hidden className="text-muted">Only you can access items in your personal workspace.</p>
                            </Col>
                        </Row>
                        <Row className="justify-content-center">
                            <Col lg={8}>
                                <Row className="justify-content-center">
                                    <AddATeamButton addATeam={addATeam} />
                                </Row>
                                <NewTeamModal show={showNewTeamModal} handleClose={handleClose} handleCreateANewTeam={handleCreateANewTeam} />
                            </Col>
                        </Row>
                        <br />
                        <br />
                        <Row>
                            <Col sm={{ span: 10, offset: 1 }} md={{ span: 8, offset: 2 }}>
                                {teams.map((team, index) => {
                                    return <TeamCard key={index} index={index} team={team} onAdd={addATeam} />
                                })}
                            </Col>
                        </Row>
                        {teams && teams.length > 0 &&
                            <Row>
                                <Col sm={{ span: 10, offset: 1 }} md={{ span: 8, offset: 2 }}>
                                    <div className='mt-4 d-flex justify-content-center'>
                                        <PaginationControl
                                            page={pageNumber}
                                            // between={4}
                                            total={total}
                                            limit={itemsPerPage}
                                            changePage={(page) => {
                                                loadTeams(page)
                                            }}
                                            ellipsis={1}
                                        />
                                    </div>
                                </Col>
                            </Row>}
                    </Container>
                </ContentPageLayout>
            </div>
        </div>
    );
}