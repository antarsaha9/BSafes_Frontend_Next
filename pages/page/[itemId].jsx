import { useState } from "react";
import { useRouter } from "next/router";
import { useSelector, useDispatch } from 'react-redux'

import Button from 'react-bootstrap/Button'

import BSafesStyle from '../../styles/BSafes.module.css'

import Scripts from "../../components/scripts";
import ContentPageLayout from '../../components/layouts/contentPageLayout';
import PageItemWrapper from "../../components/pageItemWrapper";

import TopControlPanel from "../../components/topControlPanel"
import ItemTopRows from "../../components/itemTopRows";
import PageCommons from "../../components/pageCommons";
import TurningPageControls from "../../components/turningPageControls";

import { setNavigationInSameContainer } from "../../reduxStore/containerSlice";
import { newCommentAdded, setChangingPage } from "../../reduxStore/pageSlice";

import { debugLog } from "../../lib/helper";
import { getCoverAndContentsLink, getAnotherItem } from "../../lib/bSafesCommonUI"

let hideFunction = false;
if((process.env.NEXT_PUBLIC_platform ==='iOS') || (process.env.NEXT_PUBLIC_platform ==='android')) {
    hideFunction = (process.env.NEXT_PUBLIC_functions.indexOf('hide') !== -1);
}

export default function Page() {
    const debugOn = false;
    debugLog(debugOn, "Rendering item");

    const router = useRouter();
    const dispatch = useDispatch();

    const [endOfContainer, setEndOfContainer] = useState(false);

    const changingPage = useSelector(state => state.page.changingPage);
    const pageItemId = useSelector(state => state.page.id);
    const container = useSelector(state => state.page.container);
    const position = useSelector(state => state.page.position);


    const handleCoverClicked = () => {
        if (!container) return;
        let newLink = getCoverAndContentsLink(container).converLink;
        router.push(newLink);
    }

    const handleContentsClicked = () => {
        if (!container) return;
        let newLink = getCoverAndContentsLink(container).contentsLink;
        router.push(newLink);
    }

    async function gotoAnotherItem(anotherItemNumber) {
        debugLog(debugOn, `gotoAnotherItem ${changingPage} ${pageItemId} ${container} ${position}`);
        if (changingPage || !(pageItemId || !container || !position)) return;
        setChangingPage(true);
        let anotherItemId, anotherItemLink = null;

        const getAnotherItemLink = (itemId) => {
            const itemType = itemId.split(':')[0];
            let itemLink;
            switch (itemType) {
                case 'b':
                    itemLink = '/box/' + itemId;
                    break;
                case 'f':
                    itemLink = '/folder/' + itemId;
                    break;
                case 'p':
                    itemLink = '/page/' + itemId;
                    break;
                default:
            }
            return itemLink;
        }

        switch (anotherItemNumber) {
            case '-1':
                try {
                    anotherItemId = await getAnotherItem('getPreviousItem', container, position, dispatch);
                    if (anotherItemId === 'EndOfContainer') {
                        setEndOfContainer(true);
                    } else {
                        anotherItemLink = getAnotherItemLink(anotherItemId);
                    }
                } catch (error) {

                }
                break;
            case '+1':
                try {
                    anotherItemId = await getAnotherItem('getNextItem', container, position, dispatch);
                    if (anotherItemId === 'EndOfContainer') {
                        setEndOfContainer(true);
                    } else {
                        anotherItemLink = getAnotherItemLink(anotherItemId);
                    }
                } catch (error) {

                }
                break;
            default:
        }
        debugLog(debugOn, "setNavigationInSameContainer ...");

        setNavigationInSameContainer(true);
        if (anotherItemLink) {
            router.push(anotherItemLink);
        } else {
            setChangingPage(false);
        }
    }

    const gotoNextItem = () => {
        debugLog(debugOn, "Next item ");
        gotoAnotherItem('+1');
    }

    const gotoPreviousItem = () => {
        debugLog(debugOn, "Previous item ");
        gotoAnotherItem('-1');
    }

    const onHide = () => {
        router.push('/safe');
    }

    debugLog(debugOn, "router.query.itemId: ", router.query.itemId);

    return (
        <div className={BSafesStyle.pageBackground}>
            <ContentPageLayout>
                <PageItemWrapper itemId={router.query.itemId}>
                    <br />
                    {hideFunction &&
                            <Button variant='warning' onClick={onHide} className='float-end' style={{textTransform:'uppercase', color:'black'}}>
                                Hide This page
                            </Button>    
                    }
                    {!hideFunction &&
                        <TopControlPanel onCoverClicked={handleCoverClicked} onContentsClicked={handleContentsClicked} ></TopControlPanel>
                    }
                    <br />
                    <div className={BSafesStyle.pagePanel}>
                        <ItemTopRows />
                        <PageCommons />
                    </div>
                    <TurningPageControls onNextClicked={gotoNextItem} onPreviousClicked={gotoPreviousItem} showAlert={endOfContainer} alertClosed={() => setEndOfContainer(false)} />
                </PageItemWrapper>
            </ContentPageLayout>
            <Scripts />
        </div>

    )
}