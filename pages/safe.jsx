import { useSelector, useDispatch } from 'react-redux'

import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'

import ContentPageLayout from '../components/layouts/contentPageLayout';

import Workspace from '../components/workspace'
import { useEffect } from 'react';

import { initWorkspace } from '../reduxStore/workspaceSlice';

export default function Safe() {
    const dispatch = useDispatch();
    const memberId = useSelector( state => state.auth.memberId );
    const workspaceKey = useSelector( state => state.auth.expandedKey );
    const searchKey = useSelector( state => state.auth.searchKey);
    const searchIV = useSelector( state => state.auth.searchIV);

    useEffect(() => {
        if(memberId) {
            const currentKeyVersion = 3;
            const workspaceId = 'u:' + memberId + ':' + currentKeyVersion + ':' + '0'; ;
            dispatch(initWorkspace({workspaceId, workspaceKey, searchKey, searchIV }));
        }
    }, [memberId])
    
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