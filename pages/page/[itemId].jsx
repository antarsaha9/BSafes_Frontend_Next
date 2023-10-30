import {useRouter} from "next/router";
import { useSelector } from 'react-redux'

import BSafesStyle from '../../styles/BSafes.module.css'

import Scripts from "../../components/scripts";
import ContentPageLayout from '../../components/layouts/contentPageLayout';
import PageItemWrapper from "../../components/pageItemWrapper";

import TopControlPanel from "../../components/topControlPanel"
import ItemTopRows from "../../components/itemTopRows";
import PageCommons from "../../components/pageCommons";

import { debugLog } from "../../lib/helper";
import { getCoverAndContentsLink} from "../../lib/bSafesCommonUI"

export default function Page() {
    const debugOn = true;
    debugLog(debugOn, "Rendering item");

    const router = useRouter();

    const container = useSelector( state => state.page.container);

    const handleCoverClicked = () => {
        if(!container) return;
        let newLink = getCoverAndContentsLink(container).converLink;
        router.push(newLink);
    }

    const handleContentsClicked = () => {
        if(!container) return;
        let newLink = getCoverAndContentsLink(container).contentsLink;
        router.push(newLink);
    }

    const handleAdd = (type, action, target, position) => {
        debugLog(debugOn, `${type} ${action} ${target} ${position}`);
        addAnItem(type, action, target, position );
    }

    const addAnItem = (itemType, addAction, targetItem = null, targetPosition = null) => {
    
        setSelectedItemType(itemType);
        setAddAction(addAction);
        setTargetItem(targetItem);
        setTargetPosition(targetPosition);
        setShowNewItemModal(true);
        
    }

    debugLog(debugOn, "router.query.itemId: ", router.query.itemId);


    return (
        <div className={BSafesStyle.pageBackground}>
            <ContentPageLayout>            
                <PageItemWrapper itemId={router.query.itemId}> 
                    <br />
                    <TopControlPanel onCoverClicked={handleCoverClicked} onContentsClicked={handleContentsClicked} onAdd={handleAdd} ></TopControlPanel>
                    <br />  
                    <div className={BSafesStyle.pagePanel}>
                        <ItemTopRows />
                        <PageCommons />
                    </div>
                </PageItemWrapper>           
            </ContentPageLayout>
            <Scripts />
        </div>
        
    )
}