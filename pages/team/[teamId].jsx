import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux'
import { useRouter } from 'next/router';
import Link from 'next/link'

import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'

import ContentPageLayout from '../../components/layouts/contentPageLayout'
import Workspace from '../../components/workspace'

import BSafesStyle from '../../styles/BSafes.module.css'

import { changeContainerOnly, clearItems, initWorkspaceThunk, setWorkspaceKeyReady } from '../../reduxStore/containerSlice';
import { abort } from '../../reduxStore/pageSlice';

import { debugLog } from '../../lib/helper';

export default function Team(props) {
    const debugOn = false;

    const router = useRouter();
    const dispatch = useDispatch();

    const [readyToList, setReadyToList] = useState(false);

    const loggedIn = useSelector(state => state.auth.isLoggedIn);
    const workspaceId = useSelector( state => state.container.workspace );
    const workspaceName = useSelector( state => state.container.workspaceName );
    const workspaceKeyReady = useSelector( state => state.container.workspaceKeyReady );
    
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
      if(loggedIn) {
        dispatch(setWorkspaceKeyReady(false));
      }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [loggedIn]);

    useEffect(()=>{
        if(loggedIn && !workspaceKeyReady && router.query.teamId) {
            const teamId = router.query.teamId;
            debugLog(debugOn, `Set up workspace loggedIn:${loggedIn} workspaceKeyReady:${workspaceKeyReady} teamId:${router.query.teamId}`);
            dispatch(clearItems());
            
            if(workspaceId && workspaceId.startsWith(router.query.teamId)) {
              dispatch(changeContainerOnly({container: 'root'}))
              dispatch(setWorkspaceKeyReady(true));
            } else {
              dispatch(initWorkspaceThunk({teamId, container:'root'}));
            }   
            setReadyToList(true);     
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [loggedIn, workspaceKeyReady, router.query.teamId]);

    return (
        <div className={BSafesStyle.spaceBackground}>
          <ContentPageLayout key={router.pathname}> 
              <Container fluid>
                  <br />
                  <br />
                  <br />
                  <Row>
                    <Col>
                      <h2 className="text-center display-3">{workspaceName}</h2>
                    </Col>
                  </Row>
                  <Row>
                    <Col className="text-center">
                      {false && <span><Link href={`/teamMembers/${workspaceId}`}>Members</Link> |</span>}
					            <Link href={`/activities/${workspaceId}`}>Activities</Link>
                    </Col>
                  </Row>
                  <Row className="justify-content-center">
                      <Col lg={8}>
                          <Workspace readyToList={readyToList}/>
                      </Col> 
                  </Row>
             </Container>
          </ContentPageLayout>
        </div>
      )
}