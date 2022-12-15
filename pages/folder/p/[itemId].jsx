import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useSelector, useDispatch } from 'react-redux'

import Container from 'react-bootstrap/Container'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'

import BSafesStyle from '../../../styles/BSafes.module.css'

import Scripts from "../../../components/scripts";
import ContentPageLayout from '../../../components/layouts/contentPageLayout';

import TopControlPanel from "../../../components/topControlPanel";
import ItemTopRows from "../../../components/itemTopRows";
import PageCommons from "../../../components/pageCommons";
import TurningPageControls from "../../../components/turningPageControls";

import { clearContainer, initContainer, getFirstItemInContainer, getLastItemInContainer } from '../../../reduxStore/containerSlice';
import { abort, clearPage, decryptPageItemThunk, getPageItemThunk, setContainerData, getPageCommentsThunk } from "../../../reduxStore/pageSlice";

import { debugLog } from "../../../lib/helper";

export default function FolderPage() {
    const debugOn = true;
    debugLog(debugOn, "Rendering item");
    const dispatch = useDispatch();
    const router = useRouter();

    const [pageItemId, setPageItemId] = useState(null);
    const [navigationInSameContainer, setNavigationInSameContainer] = useState(false);
    const [pageCleared, setPageCleared] = useState(false);
    const [containerCleared, setContainerCleared] = useState(false);
    const [workspaceKeyReady, setWorkspaceKeyReady] = useState(false);

    const searchKey = useSelector(state => state.auth.searchKey);
    const searchIV = useSelector(state => state.auth.searchIV);
    const expandedKey = useSelector(state => state.auth.expandedKey);

    const navigationMode = useSelector(state => state.page.navigationMode);
    const space = useSelector(state => state.page.space);
    const container = useSelector(state => state.page.container);
    const itemCopy = useSelector(state => state.page.itemCopy);

    const containerInWorkspace = useSelector(state => state.container.container);
    const workspace = useSelector(state => state.container.workspace);
    const workspaceKey = useSelector(state => state.container.workspaceKey);

    async function gotoAnotherPage(anotherPageNumber) {
    }

    const gotoNextPage = () => {
        debugLog(debugOn, "Next Page ");
        gotoAnotherPage('+1');
    }

    const gotoPreviousPage = () => {
        debugLog(debugOn, "Previous Page ");
        gotoAnotherPage('-1');
    }

    const handleCoverClicked = () => {
        let newLink = `/folder/${containerInWorkspace}`;
        router.push(newLink);
    }

    const handleContentsClicked = () => {
        const contentsPageLink = `/folder/contents/${container}`;
        router.push(contentsPageLink);
    }

    const handleGoToFirstItem = async () => {
    }

    const handleGoToLastItem = async () => {
    }

    useEffect(() => {
        const handleRouteChange = (url, { shallow }) => {
            console.log(
                `App is changing to ${url} ${shallow ? 'with' : 'without'
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
        if (router.query.itemId) {
            dispatch(clearPage());
            setWorkspaceKeyReady(false);
            debugLog(debugOn, "set pageItemId: ", router.query.itemId);
            setPageItemId(router.query.itemId);
            setPageCleared(true);
        }
    }, [router.query.itemId]);

    useEffect(() => {
        if (pageItemId && pageCleared) {
            debugLog(debugOn, "Dispatch getPageItemThunk ...");
            dispatch(getPageItemThunk({ itemId: pageItemId, navigationInSameContainer }));
        }
    }, [pageItemId, pageCleared]);

    useEffect(() => {
        if (pageCleared && navigationMode) {
            debugLog(debugOn, "setContainerData ...");
            dispatch(setContainerData({ itemId: pageItemId, container: { space: workspace, id: containerInWorkspace } }));
        }
    }, [navigationMode]);

    useEffect(() => {
        if (space && pageCleared) {
            if (container === containerInWorkspace) {
                setWorkspaceKeyReady(true);
                return;
            }

            dispatch(clearContainer());
            setContainerCleared(true);
        }
    }, [space]);

    useEffect(() => {
        if (containerCleared) {
            if (space.substring(0, 1) === 'u') {
                debugLog(debugOn, "Dispatch initWorkspace ...");
                dispatch(initContainer({ container, workspaceId: space, workspaceKey: expandedKey, searchKey, searchIV }));
                setWorkspaceKeyReady(true);
            } else {
            }
        }
    }, [containerCleared]);

    useEffect(() => {
        debugLog(debugOn, "useEffect [workspaceKeyReady] ...");
        if (workspaceKeyReady && workspaceKey && itemCopy && pageCleared) {
            setPageCleared(false);
            setContainerCleared(false);
            debugLog(debugOn, "Dispatch decryptPageItemThunk ...");
            dispatch(decryptPageItemThunk({ itemId: pageItemId, workspaceKey }));
            dispatch(getPageCommentsThunk({ itemId: pageItemId }));
        }
    }, [workspaceKeyReady, itemCopy]);

    return (
        <div className={BSafesStyle.pageBackground}>
            <ContentPageLayout>            
                <Container fluid>
                    <br />
                    <TopControlPanel onCoverClicked={handleCoverClicked} onContentsClicked={handleContentsClicked} onGotoFirstItem={handleGoToFirstItem} onGotoLastItem={handleGoToLastItem}></TopControlPanel>
                    <br />  
                    <Row>
                        <Col lg={{span:10, offset:1}}>
                            <div className={`${BSafesStyle.pagePanel} ${BSafesStyle.folderPanel}`}>
                                <ItemTopRows />
                                <Row className="justify-content-center">
                                    <Col xs="12" sm="10" md="8">
                                        <hr />
                                    </Col>
                                </Row>
                                <PageCommons />
                            </div>
                        </Col>
                    </Row> 

                    <TurningPageControls onNextClicked={gotoNextPage} onPreviousClicked={gotoPreviousPage} />
   
                </Container>  
            </ContentPageLayout>
            <Scripts />
        </div>
    )
}
