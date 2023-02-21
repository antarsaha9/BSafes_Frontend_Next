import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux'
import { useRouter } from 'next/router';
import Link from 'next/link'

import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'

import ContentPageLayout from '../../components/layouts/contentPageLayout'
import Workspace from '../../components/workspace'

import BSafesStyle from '../../styles/BSafes.module.css'

import { getTeamData } from '../../reduxStore/teamSlice';
import { changeContainerOnly, clearItems, initWorkspaceThunk, setWorkspaceKeyReady } from '../../reduxStore/containerSlice';
import { abort } from '../../reduxStore/pageSlice';

import { debugLog } from '../../lib/helper';
import ListGroup from 'react-bootstrap/ListGroup';

export default function Team(props) {
    const debugOn = true;

    const router = useRouter();
    const dispatch = useDispatch();

    const loggedIn = useSelector(state => state.auth.isLoggedIn);
    const workspaceId = useSelector(state => state.container.workspace);
    const workspaceName = useSelector(state => state.container.workspaceName);


    useEffect(() => {
        const handleRouteChange = (url, { shallow }) => {
            console.log(
                `App is changing to ${url} ${shallow ? 'with' : 'without'
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

    useEffect(() => {
        if (loggedIn && router.query.teamId) {
            const teamId = router.query.teamId;

            dispatch(clearItems());
            if (router.query.teamId === workspaceId) {
                dispatch(changeContainerOnly({ container: 'root' }))
                dispatch(setWorkspaceKeyReady(true));
            } else {
                dispatch(initWorkspaceThunk({ teamId, container: 'root' }));
            }
        }
    }, [loggedIn, router.query.teamId]);

    return (
        <div className={BSafesStyle.spaceBackground}>
            <ContentPageLayout key={router.pathname}>
                <Container fluid>
                    <br />
                    <br />
                    <br />
                    <Row>
                        <Col>
                            <h2 className="text-center">Activities</h2>
                        </Col>
                    </Row>
                    <ListGroup>
                        <ListGroup.Item>
                            <Row>
                                <Col xs={12}>
                                    <h4 class="my-0">test</h4>
                                </Col>
                            </Row>
                            <Row>
                                <Col xs={6}>
                                    <span class="">bsafes test</span>
                                </Col>
                                <Col xs={6}>
                                    <span class="pull-right">1 sec ago</span>
                                </Col>
                            </Row>
                            <Row>
                                <Col xs={6}>
                                    <span class="">creation</span>
                                </Col>
                                <Col xs={6}>
                                    <span class="pull-right">llakdjlsa</span>
                                </Col>
                            </Row>

                        </ListGroup.Item>
                    </ListGroup>
                </Container>
            </ContentPageLayout>
        </div>
    )
}