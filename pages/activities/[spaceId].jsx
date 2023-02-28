import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux'
import { useRouter } from 'next/router';
import Link from 'next/link'

import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'

import ContentPageLayout from '../../components/layouts/contentPageLayout'

import BSafesStyle from '../../styles/BSafes.module.css'

import { changeContainerOnly, clearContainer, clearItems, initContainer, initWorkspaceThunk, listActivitiesThunk, setWorkspaceKeyReady } from '../../reduxStore/containerSlice';
import { abort, clearPage } from '../../reduxStore/pageSlice';

import { debugLog } from '../../lib/helper';
import ListGroup from 'react-bootstrap/ListGroup';
import Collapse from 'react-bootstrap/Collapse';
import { getItemLink } from '../../lib/bSafesCommonUI';

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
    const activities = useSelector(state => state.container.activities);


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
        dispatch(listActivitiesThunk({ pageNumber: 1 }));
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
                    <ListGroup>
                        {activities.map((g, i) => <GroupedActivity items={g} key={i} />)}
                    </ListGroup>
                </Container>
            </ContentPageLayout>
        </div>
    )
}

function GroupedActivity({ items }) {
    const [open, setOpen] = useState(false);
    const [first, ...rest] = items;
    return (
        <>
            <ActivityCard {...{ ...first, onClick: () => setOpen(!open) }} root />

            {rest.length > 0 &&
                <>
                    {!open && <div className='text-center'><i class='fa fa-caret-down' /></div>}
                    <Collapse in={open}>
                        <div>
                            {rest.map(ActivityCard)}
                        </div>
                    </Collapse>
                    {open && <div className='text-center'><i class='fa fa-caret-up' /></div>}
                </>
            }
        </>
    )

}

function ActivityCard({ onClick, root, ...activity }) {
    // Link cant be generated, because according to getItemLink definition, it expects "container" attribute, but itemVersion don't hold container.
    const itemLink = null && getItemLink(activity);
    const componnet = (
        <ListGroup.Item onClick={onClick} className={root?'':'bg-light bg-gradient'}>
            <Row>
                <Col xs={12}>
                    <h4 className="my-0">{activity.title}</h4>
                </Col>
            </Row>
            <Row>
                <Col xs={6}>
                    <span className="">{activity.displayName}</span>
                </Col>
                <Col xs={6}>
                    <span className="pull-right">{activity.updatedTime}</span>
                </Col>
            </Row>
            <Row>
                <Col xs={6}>
                    <span className="">{activity.updatedText}</span>
                </Col>
                <Col xs={6}>
                    {/* <span className="pull-right">llakdjlsa</span> */}
                </Col>
            </Row>

        </ListGroup.Item>
    )
    if (itemLink)
        return (
            <Link href={itemLink}>
                {componnet}
            </Link>
        )
    else return componnet;
}