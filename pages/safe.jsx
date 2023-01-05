import { useSelector, useDispatch } from 'react-redux'
import {useRouter} from "next/router";

import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'

import ContentPageLayout from '../components/layouts/contentPageLayout';

import Workspace from '../components/workspace'
import { useEffect } from 'react';

import { initContainer } from '../reduxStore/containerSlice';
import { abort } from "../reduxStore/pageSlice";

export default function Safe() {
    const router = useRouter();
    const dispatch = useDispatch();
    
    const memberId = useSelector( state => state.auth.memberId );
    const workspaceKey = useSelector( state => state.auth.expandedKey );
    const searchKey = useSelector( state => state.auth.searchKey);
    const searchIV = useSelector( state => state.auth.searchIV);

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

    useEffect(() => {
        if(memberId) {
            const currentKeyVersion = 3;
            const workspaceId = 'u:' + memberId + ':' + currentKeyVersion + ':' + '0'; ;
            dispatch(initContainer({container: 'root', workspaceId, workspaceKey, searchKey, searchIV }));
        }
    }, [memberId])
    
    return (
        <ContentPageLayout> 
            <Container fluid>
                <Row className="justify-content-center">
                    <Col lg={8}>
                        <Workspace />
                    </Col> 
                </Row>
           </Container>
        </ContentPageLayout>
    )
}