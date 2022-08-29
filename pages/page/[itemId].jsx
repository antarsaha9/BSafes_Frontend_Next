import {useRouter} from "next/router";
import { useSelector, useDispatch } from 'react-redux'

import Container from 'react-bootstrap/Container'

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