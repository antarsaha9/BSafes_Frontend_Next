import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'

import ContentPageLayout from '../components/layouts/contentPageLayout';

import Workspace from '../components/workspace'


export default function Safe() {

    return (
        <ContentPageLayout> 
            <Row className="justify-content-center">
                <Col lg={8}>
                    <Workspace />
                </Col> 
            </Row>
           
        </ContentPageLayout>
    )
}