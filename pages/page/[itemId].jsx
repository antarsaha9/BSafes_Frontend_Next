import {useRouter} from "next/router";
import { useSelector, useDispatch } from 'react-redux'

import Container from 'react-bootstrap/Container'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'

import pageGlobals from '../../styles/pageGlobals'
import BSafesStyle from '../../styles/BSafes.module.css'

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
            <div>
                <Container> 
                    <p>Item:{itemId}</p>
                    <div className={BSafesStyle.pagePanel}>
                        <ItemTopRows />
                        <Row className="justify-content-center">
                            <Col xs="12" sm="10" md="8">
                                <hr />
                            </Col>
                        </Row>
                        <PageCommons />
                    </div>
                </Container>
            </div>
            <style jsx global>
                {pageGlobals}
            </style>
        </ContentPageLayout>
        
    )
}