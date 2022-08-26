import {useRouter} from "next/router";
import { useSelector, useDispatch } from 'react-redux'

import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'

import ContentPageLayout from '../../components/layouts/contentPageLayout';

import ItemTopRows from "../../components/itemTopRows";
import PageCommons from "../../components/pageCommons";


export default function Page() {

    const router = useRouter();
    const {itemId} = router.query;

    const memberId = useSelector( state => state.auth.memberId );
    const workspaceId = 'u:' + memberId;
    return (
        <ContentPageLayout> 
            <p>Item:{itemId}</p>
            <Row className="justify-content-center">
                <ItemTopRows />
                <PageCommons />
            </Row>
           
        </ContentPageLayout>
    )
}