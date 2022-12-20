import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useSelector, useDispatch } from 'react-redux'

import Container from 'react-bootstrap/Container'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'

import BSafesStyle from '../../../styles/BSafes.module.css'

import Scripts from "../../../components/scripts";
import ContentPageLayout from '../../../components/layouts/contentPageLayout';
import TopControlPanel from "../../../components/folderTopControlPanel";
import ItemTopRows from "../../../components/itemTopRows";

import { clearContainer, initContainer } from "../../../reduxStore/containerSlice";
import { clearPage, getPageItemThunk, decryptPageItemThunk, saveTitleThunk, getPageCommentsThunk, abort } from "../../../reduxStore/pageSlice";

import { debugLog, PostCall } from "../../../lib/helper";
import LoadingSpinner from "../../../components/LoadingSpinner";
import PageCommons from "../../../components/pageCommons";

export default function Diary() {
    const debugOn = true;
    debugLog(debugOn, "Rendering item");
    const dispatch = useDispatch();
    const router = useRouter();

    const [pageItemId, setPageItemId] = useState(null);
    const [navigationInSameContainer, setNavigationInSameContainer] = useState(false);
    const pageNumber = useSelector(state => state.page.pageNumber);
    const [pageStyle, setPageStyle] = useState('');
    const [pageCleared, setPageCleared] = useState(false);
    const [containerCleared, setContainerCleared] = useState(false);
    const [workspaceKeyReady, setWorkspaceKeyReady] = useState(false);

    debugLog(debugOn, "pageNumber: ", pageNumber);
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
        // if(!(pageItemId && pageNumber)) return;

        let idParts, nextPageId;
        idParts = pageItemId.split(':');
        idParts.splice(-1);
        switch (anotherPageNumber) {
            case '-1':
                var ress = await PostCall({
                    api: '/memberAPI/getPreviousFolderPage',
                    body: {
                        folderId: pageItemId,
                        itemPosition: pageItemId.split(':').pop()
                    }

                });
                console.log(ress);
                if (ress.itemId === 'EndOfFolder') {
                    // dispatch()
                }
                else {
                    nextPageId = ress.itemId;
                }
                break;
            case '+1':
                // idParts.push((pageNumber+1));
                var ress = await PostCall({
                    api: '/memberAPI/getNextFolderPage',
                    body: {
                        folderId: pageItemId,
                        itemPosition: pageItemId.split(':').pop()
                    }

                });
                console.log(ress);
                if (ress.itemId === 'EndOfFolder') {
                    // dispatch()
                }
                else {
                    nextPageId = ress.itemId;
                }
                break;
            default:
                idParts.push(anotherPageNumber);

        }

        // nextPageId = idParts.join(':');
        debugLog(debugOn, "setNavigationInSameContainer ...");
        setNavigationInSameContainer(true);
        if (nextPageId) {

            router.push(`/folder/p/${nextPageId}`);
        }
    }

    const handleGoToFirstItem = async () => {
        try {
            const itemId = await getFirstItemInContainer(containerInWorkspace);
            const newLink = `/notebook/p/${itemId}`;
            router.push(newLink);
        } catch (error) {
            alert("Could not get the first item in the container");
        }
    }

    const handleGoToLastItem = async () => {
        try {
            const itemId = await getLastItemInContainer(containerInWorkspace);
            const newLink = `/notebook/p/${itemId}`;
            router.push(newLink);
        } catch (error) {
            alert("Could not get the first item in the container");
        }
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
        if (pageNumber) {
            debugLog(debugOn, "pageNumber: ", pageNumber);
            if (pageNumber % 2) {
                setPageStyle(BSafesStyle.leftPagePanel);
            } else {
                setPageStyle(BSafesStyle.rightPagePanel);
            }
        }
    }, [pageNumber])

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
        <div>
            <div className={BSafesStyle.pageBackground}>
                <ContentPageLayout>
                    {pageItemId ?
                        <Container>
                            <br />
                            <TopControlPanel
                                showListIcon
                                closeDiary={() => {
                                    const parts = pageItemId.split(':');
                                    router.push(`/diary/d:${parts[1]}:${parts[2]}:${parts[3]}?initialDisplay=cover`)
                                }}
                                handleIndexClick={() => {
                                    const parts = pageItemId.split(':');
                                    router.push(`/diary/d:${parts[1]}:${parts[2]}:${parts[3]}`)
                                }}
                            />
                            <br />
                            <div className={`${BSafesStyle.diaryPanel} ${BSafesStyle.pagePanel} ${BSafesStyle.rightPagePanel} ${BSafesStyle.containerPanel}`}>
                                <ItemTopRows />
                                <Row className="justify-content-center">
                                    <Col sm="10" md="8">
                                        <hr />
                                    </Col>
                                </Row>
                                <PageCommons />
                            </div>
                        </Container> :
                        <LoadingSpinner />}
                </ContentPageLayout>
                <Scripts />
            </div>
        </div>
    )
}
