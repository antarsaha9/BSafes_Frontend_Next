import { useSelector, useDispatch } from 'react-redux'

import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'

import ContentPageLayout from '../components/layouts/contentPageLayout';

import Workspace from '../components/workspace'


export default function Safe() {

    const memberId = useSelector( state => state.auth.memberId );
    const workspaceId = 'u:' + memberId;
    return (
        <ContentPageLayout> 
            <Row className="justify-content-center">
                <Col lg={8}>
                    <Workspace workspaceId={workspaceId} />
                </Col> 
            </Row>
           
        </ContentPageLayout>
    )
}