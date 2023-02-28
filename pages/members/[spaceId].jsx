import { useEffect, useState, forwardRef } from 'react';
import { useSelector, useDispatch } from 'react-redux'
import { useRouter } from 'next/router';

import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'

import ContentPageLayout from '../../components/layouts/contentPageLayout'

import BSafesStyle from '../../styles/BSafes.module.css'

import { changeContainerOnly, clearContainer, clearItems, initContainer, initWorkspaceThunk, setWorkspaceKeyReady } from '../../reduxStore/containerSlice';
import { abort, clearPage } from '../../reduxStore/pageSlice';

import { debugLog } from '../../lib/helper';
import Dropdown from 'react-bootstrap/Dropdown';
import Card from 'react-bootstrap/Card';

export default function Team(props) {
    const debugOn = true;

    const dispatch = useDispatch();
    const router = useRouter();

    const [space, setSpace] = useState(null);
    const [containerCleared, setContainerCleared] = useState(false);

    const isLoggedIn = useSelector(state => state.auth.isLoggedIn);
    const searchKey = useSelector(state => state.auth.searchKey);
    const searchIV = useSelector(state => state.auth.searchIV);
    const expandedKey = useSelector(state => state.auth.expandedKey);

    const workspaceId = useSelector(state => state.container.workspace);
    const workspaceKeyReady = useSelector(state => state.container.workspaceKeyReady);
    const teamMembers = [] && useSelector(state => state.team.teamMembers);


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
    }, [])

    useEffect(() => {
        if (isLoggedIn && router.query.spaceId) {
            console.log(router.query.spaceId)

            dispatch(clearItems());
            dispatch(setWorkspaceKeyReady(false));

            debugLog(debugOn, "set space: ", router.query.spaceId);
            setSpace(router.query.spaceId);
            if (router.query.spaceId === workspaceId) {
                dispatch(changeContainerOnly({ container: 'Unknown' }))
                dispatch(setWorkspaceKeyReady(true));
            } else {
                dispatch(clearContainer());
                setContainerCleared(true);
            }
        }
    }, [isLoggedIn, router.query.spaceId]);

    useEffect(() => {
        if (space && containerCleared) {
            if (space.substring(0, 1) === 'u') {
                dispatch(initContainer({ container: 'Unknown', workspaceId: space, workspaceKey: expandedKey, searchKey, searchIV }));
                dispatch(setWorkspaceKeyReady(true));
            } else {
                dispatch(initWorkspaceThunk({ teamId: space, container: 'Unknown' }));
            }
        }
    }, [space, containerCleared]);

    useEffect(() => {
        if (!workspaceId || !workspaceKeyReady) return;
        dispatch(clearPage());
        dispatch(listTeamMembersThunk({ pageNumber: 1 }));
    }, [workspaceId, workspaceKeyReady]);


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
                    <Row>
                        {teamMembers.map((tm, i) => <MemberCard items={tm} key={i} />)}
                    </Row>
                </Container>
            </ContentPageLayout>
        </div>
    )
}

function ellipsisButton({ children, onClick }, ref) {
    return (
        <a
            href=""
            ref={ref}
            onClick={e => {
                e.preventDefault();
                onClick(e);
            }}
        >
            {/* Render custom icon here */}
            <i className="fa fa-ellipsis-v text-dark" aria-hidden="true"></i>
            {children}
        </a>
    )
}
const ellipsisToggle = forwardRef(ellipsisButton);
function MemberCard({ member }) {
    const componnet = (
        <Card>
            <div class="mb-3">
                <div class="py-0 pr-0">
                    <Row >
                        <Col xs={9} class="marginTop7Px">
                            <h5 class="itemTitle">{member.name}</h5>
                            <p class="email">{member.name}</p>
                        </Col>
                        <Col xs={3}>
                            <Dropdown align="end" className="justify-content-end">
                                <Dropdown.Toggle as={ellipsisToggle} variant="link" />

                                <Dropdown.Menu>
                                    <Dropdown.Item onClick={() => handleAddClicked("addAnItemBefore")}>Delete</Dropdown.Item>
                                </Dropdown.Menu>
                            </Dropdown>
                        </Col>
                    </Row>
                </div>
            </div>
        </Card>
    )
    return componnet;
}