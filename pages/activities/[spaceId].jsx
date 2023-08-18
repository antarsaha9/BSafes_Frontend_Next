import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux'
import { useRouter } from 'next/router';
import Link from 'next/link'

import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import ListGroup from 'react-bootstrap/ListGroup';
import Collapse from 'react-bootstrap/Collapse';
import Button from 'react-bootstrap/Button';

import ContentPageLayout from '../../components/layouts/contentPageLayout'

import BSafesStyle from '../../styles/BSafes.module.css'

import { initWorkspaceThunk, initContainer, changeContainerOnly, setWorkspaceKeyReady, clearActivities, listActivitiesThunk } from '../../reduxStore/containerSlice';
import { abort, clearPage, itemPathLoaded } from '../../reduxStore/pageSlice';

import { debugLog } from '../../lib/helper';
import { getItemLink } from '../../lib/bSafesCommonUI';

export default function Activities(props) {
    const debugOn = true;

    const dispatch = useDispatch();
    const router = useRouter();

    const [readyToList, setReadyToList] = useState(false);

    const accountVersion = useSelector( state => state.auth.accountVersion);
    const loggedIn = useSelector(state => state.auth.isLoggedIn);
    const expandedKey = useSelector( state => state.auth.expandedKey );
    const personalSearchKey = useSelector( state => state.auth.searchKey);
    const personalSearchIV = useSelector( state => state.auth.searchIV);
    
    const activity = useSelector(state => state.container.activity);
    const workspaceId = useSelector( state => state.container.workspace );
    const workspaceKeyReady = useSelector( state => state.container.workspaceKeyReady);
    const container = useSelector( state => state.container.container);
    const activities = useSelector(state => state.container.activities);

    const moreActivities = () => {
        dispatch(listActivitiesThunk({}));
    }

    useEffect(() => {
        const handleRouteChange = (url, { shallow }) => {
          console.log(
            `App is changing to ${url} ${
              shallow ? 'with' : 'without'
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(()=>{
        dispatch(setWorkspaceKeyReady(false)); 
    // eslint-disable-next-line react-hooks/exhaustive-deps  
    }, [loggedIn]);

    useEffect(()=>{
        if(loggedIn && !workspaceKeyReady && router.query.spaceId) {
            const spaceId = router.query.spaceId;
            if(spaceId.startsWith('u:')){ // personal space
                dispatch(initContainer({container: 'root', workspaceId:spaceId, workspaceKey:expandedKey, searchKey: personalSearchKey, searchIV: personalSearchIV }));
                dispatch(setWorkspaceKeyReady(true));
            } else { // team space
                if(router.query.spaceId === workspaceId) {
                    dispatch(changeContainerOnly({container: 'root'}))
                    dispatch(setWorkspaceKeyReady(true));
                } else {
                    let teamId;
                    if(accountVersion === 'v1') {
                        teamId = spaceId.substring(0, spaceId.length - 4);
                    } else {
                         teamId = spaceId;
                    }
                    dispatch(initWorkspaceThunk({teamId, container:'root'}));
                }     
            }
            dispatch(clearActivities());
            setReadyToList(true);   
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [loggedIn, workspaceKeyReady, router.query.spaceId]);

    useEffect(() => {
        if(!readyToList || !workspaceId || !workspaceKeyReady || container !== 'root') return;
        dispatch(clearPage());
        const itemPath = [{_id: workspaceId}, {_id:'ac:'+ workspaceId}];
        dispatch(itemPathLoaded(itemPath));
        dispatch(listActivitiesThunk({pageNumber: 1}));
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [readyToList, container, workspaceId, workspaceKeyReady ]);

    return (
        <div className={BSafesStyle.spaceBackground}>
            <ContentPageLayout key={router.pathname}>
                <Container fluid>
                    <br />
                    <br />
                    <br />
                    <Row>
                        <Col>
                            <h1 className="text-center display-5">Activities</h1>
                        </Col>
                    </Row>
                    <Row className="justify-content-center">
                        <Col lg={8}>
                            <ListGroup>
                                {activities.map((g, i) => <GroupedActivity items={g} key={i} />)}
                            </ListGroup>
                        </Col>
                    </Row>
                    <br />
                    { (activity === 0 ) &&
                        <Row className="justify-content-center">
                            <Button variant="link" onClick={moreActivities}>More</Button>
                        </Row>}
                    <br />
                    <br />
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
            <ActivityCard {...first} root />

            {rest.length > 0 &&
                <>
                    {!open && <div className='text-center' onClick={() => setOpen(!open)}><i className='fa fa-caret-down' /></div>}
                    <Collapse in={open}>
                        <div>
                            {rest.map((ra, i)=><ActivityCard {...ra} key={i} />)}
                        </div>
                    </Collapse>
                    {open && <div className='text-center' onClick={() => setOpen(!open)}><i className='fa fa-caret-up' /></div>}
                </>
            }
        </>
    )

}

function ActivityCard({ root, ...activity }) {
    // Link cant be generated, because according to getItemLink definition, it expects "container" attribute, but itemVersion don't hold container.
    const itemLink = getItemLink(activity);
    const componnet = (
        <div>
        
            <Row>
                <Col xs={12}>
                    <h4 className="my-0">{activity.titleText}</h4>
                </Col>
            </Row>
            <Row>
                <Col xs={6}>
                    <span className="">{activity.updatedBy}</span>
                </Col>
            </Row>
            <Row>
                <Col xs={6}>
                    <span className="">{`${activity.updatedText}, ${activity.updatedTime}`}</span>
                </Col>
                <Col xs={6}>
                    <span className="pull-right"></span>
                </Col>
            </Row>
        </div>
    )

    return (
        <ListGroup.Item className={root?'':'bg-light bg-gradient'} style={{ cursor: 'pointer' }}>
            <Row>
                {itemLink?
                    <Link href={itemLink} legacyBehavior>
                        <Col xs={11}>
                            {componnet}
                        </Col>
                    </Link>
                    :
                    <Col xs={11}>
                        {componnet}
                    </Col>
                }
                <Col xs={1} >
                    <a className={`${BSafesStyle.externalLink}`} target="_blank" href={itemLink} rel="noopener noreferrer">
                        <i className="me-2 fa fa-external-link fa-lg text-dark" aria-hidden="true"></i>
                    </a>
                </Col>
            </Row>
        </ListGroup.Item>
    );

}