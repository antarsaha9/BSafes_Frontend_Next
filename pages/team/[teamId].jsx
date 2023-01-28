import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { Col, Container, Row } from 'react-bootstrap'
import { useDispatch, useSelector } from 'react-redux';
import ContentPageLayout from '../../components/layouts/contentPageLayout'
import Workspace from '../../components/workspace'
import { initContainer } from '../../reduxStore/containerSlice';
import { abort } from '../../reduxStore/pageSlice';
import BSafesStyle from '../../styles/BSafes.module.css'

export default function Team(props) {
    const router = useRouter();
    const dispatch = useDispatch();
    const workspaceKey = useSelector( state => state.auth.expandedKey );
    const searchKey = useSelector( state => state.auth.searchKey);
    const searchIV = useSelector( state => state.auth.searchIV);
    const memberId = useSelector( state => state.auth.memberId );
    useEffect(()=>{
        if(memberId && router.query.teamId) {
            const workspaceId = router.query.teamId;
            dispatch(initContainer({container: 'root', workspaceId, workspaceKey, searchKey, searchIV }));
        }
    }, [router.query.teamId, memberId]);

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
    }, []);

    return (
        <div className={BSafesStyle.spaceBackground}>
          <ContentPageLayout> 
              <Container fluid>
                  <Row className="justify-content-center">
                      <Col lg={8}>
                          <Workspace />
                      </Col> 
                  </Row>
             </Container>
          </ContentPageLayout>
        </div>
      )
}