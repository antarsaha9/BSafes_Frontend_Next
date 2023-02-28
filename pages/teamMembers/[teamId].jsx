import { useEffect, useState, forwardRef } from 'react';
import { useSelector, useDispatch } from 'react-redux'
import { useRouter } from 'next/router';

import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'

import ContentPageLayout from '../../components/layouts/contentPageLayout'

import BSafesStyle from '../../styles/BSafes.module.css'

import { changeContainerOnly, clearContainer, clearItems, initContainer, initWorkspaceThunk, listActivitiesThunk, setWorkspaceKeyReady } from '../../reduxStore/containerSlice';
import { abort, clearPage } from '../../reduxStore/pageSlice';

import { debugLog } from '../../lib/helper';
import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';
import Dropdown from 'react-bootstrap/Dropdown';
import Form from 'react-bootstrap/Form';
import InputGroup from 'react-bootstrap/InputGroup';
import { findMemberByEmail, listTeamMembersThunk } from '../../reduxStore/teamSlice';

export default function Team(props) {
    const debugOn = true;

    const dispatch = useDispatch();
    const router = useRouter();

    const [space, setSpace] = useState(null);
    const [addingMember, setAddingMember] = useState(false);
    const [containerCleared, setContainerCleared] = useState(false);
    const [searchValue, setSearchValue] = useState("");
    const [searchResult, setSearchResult] = useState([]);

    const isLoggedIn = useSelector(state => state.auth.isLoggedIn);
    const searchKey = useSelector(state => state.auth.searchKey);
    const searchIV = useSelector(state => state.auth.searchIV);
    const expandedKey = useSelector(state => state.auth.expandedKey);

    const workspaceId = useSelector(state => state.container.workspace);
    const workspaceKeyReady = useSelector(state => state.container.workspaceKeyReady);
    const teamMembers = useSelector(state => state.team.teamMembers);


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

    const onSubmit = () => {
        // findMemberByEmail(searchValue).then(res=>{
        //     setSearchResult(teamMembers)
        // })
        setSearchResult(teamMembers)
        setSearchValue('');
    }
    const onSearchValueChanged = (e) => {
        debugLog(debugOn, "search value:", e.target.value);
        setSearchValue(e.target.value);
    }

    return (
        <div className={BSafesStyle.spaceBackground}>
            <ContentPageLayout key={router.pathname}>
                <Container fluid>
                    <br />
                    <br />
                    <br />
                    {addingMember ?
                        <>
                            <Row>
                                <Col>
                                    <h2 className="text-center">Adding Members</h2>
                                </Col>
                            </Row>
                            <Row >
                                <Col lg={8}>
                                    <div className='d-flex justify-content-center mb-3'>
                                        <Button variant="light" className={BSafesStyle.btnCircle} onClick={() => setAddingMember(false)}>
                                            <i id="1" className="fa fa-times fa-lg " aria-hidden="true"></i>
                                        </Button>
                                    </div>
                                </Col>
                            </Row>
                            <Row>
                                <Form onSubmit={onSubmit}>
                                    <InputGroup className="mb-3">
                                        <Form.Control size="lg" type="text"
                                            value={searchValue}
                                            onChange={onSearchValueChanged}
                                        />
                                        <Button variant="link" onClick={onSubmit}>
                                            <i id="1" className="fa fa-search fa-lg text-dark" aria-hidden="true" ></i>
                                        </Button>
                                    </InputGroup>
                                </Form>
                            </Row>
                            <Row>
                                {searchResult.map((tm, i) => <MemberCard member={tm} key={i} handleAdd={() => { }} />)}
                            </Row>
                            <Row className='mt-4'>
                                <Col xs={8} sm={{ span: 6, offset: 1 }} md={{ span: 6, offset: 2 }}>
                                    <h4>Select members</h4>
                                </Col>
                                <Col xs={4} sm={4} md={2} >
                                    <Button variant='primary' size='sm' className='pull-right'>Add</Button>
                                </Col>
                            </Row>
                        </>
                        :
                        <>
                            <Row>
                                <Col>
                                    <h2 className="text-center">Members</h2>
                                </Col>
                            </Row>
                            <Row >
                                <Col lg={8}>
                                    <div className='d-flex justify-content-center mb-3'>
                                        <Button variant="primary" className={BSafesStyle.btnCircle} onClick={() => setAddingMember(true)}>
                                            <i id="1" className="fa fa-plus fa-lg" aria-hidden="true"></i>
                                        </Button>
                                    </div>
                                </Col>
                            </Row>
                            <Row>
                                {teamMembers.map((tm, i) => <MemberCard member={tm} key={i} handleDelete={() => { }} />)}
                            </Row>
                        </>}
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
function MemberCard({ member, handleAdd, handleDelete }) {
    const componnet = (
        <Row >
            <Col xs={12} sm={{ span: 10, offset: 1 }} md={{ span: 8, offset: 2 }} class="marginTop7Px">
                <Card>
                    <Card.Body class="mb-3">
                        <div class="py-0 pr-0">
                            <Row >
                                <Col xs={9} class="marginTop7Px">
                                    <h5 class="itemTitle">{member.name}</h5>
                                    <p class="email">{member.email}</p>
                                </Col>
                                <Col xs={3}>
                                    {handleDelete && <Dropdown align="end" className="justify-content-end pull-right">
                                        <Dropdown.Toggle as={ellipsisToggle} variant="link" />

                                        <Dropdown.Menu>
                                            <Dropdown.Item onClick={() => handleAddClicked("addAnItemBefore")}>Delete</Dropdown.Item>
                                        </Dropdown.Menu>
                                    </Dropdown>}
                                    {handleAdd &&
                                        <Button variant='link' className="justify-content-end pull-right border-0 text-black">
                                            <i id="1" className="fa fa-plus fa-lg" aria-hidden="true"></i>
                                        </Button>}
                                </Col>
                            </Row>
                        </div>
                    </Card.Body>
                </Card>
            </Col>
        </Row>
    )
    return componnet;
}