import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useSelector, useDispatch } from 'react-redux'

import Container from 'react-bootstrap/Container'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'

import BSafesStyle from '../../../styles/BSafes.module.css'

import Scripts from "../../../components/scripts";
import ContentPageLayout from '../../../components/layouts/contentPageLayout';
import TopControlPanel from "../../../components/diaryTopControlPanel";
import ItemTopRows from "../../../components/itemTopRows";
import Editor from "../../../components/editor";
import ContainerOpenButton from "../../../components/containerOpenButton";
import PageCommonControls from "../../../components/pageCommonControls";

import { clearContainer, initWorkspace } from "../../../reduxStore/containerSlice";
import { clearPage, getPageItemThunk, decryptPageItemThunk, saveTitleThunk, getPageCommentsThunk, abort } from "../../../reduxStore/pageSlice";

import { debugLog } from "../../../lib/helper";
import { getLastAccessedItem } from "../../../lib/bSafesCommonUI";
import parse from "date-fns/parse";
import format from "date-fns/format";
import isSameDay from "date-fns/isSameDay";
import LoadingSpinner from "../../../components/LoadingSpinner";
import PageCommons from "../../../components/pageCommons";
import TurningPageControls from "../../../components/turningPageControls";

export default function Diary() {
    const debugOn = true;
    debugLog(debugOn, "Rendering item");
    const dispatch = useDispatch();
    const router = useRouter();

    const [pageItemId, setPageItemId] = useState(null);
    const pageNumber = useSelector(state => state.page.pageNumber);
    const [pageStyle, setPageStyle] = useState('');
    const [pageCleared, setPageCleared] = useState(false);
    const [pageDate, setPageDate] = useState();

    const searchKey = useSelector(state => state.auth.searchKey);
    const searchIV = useSelector(state => state.auth.searchIV);
    const expandedKey = useSelector(state => state.auth.expandedKey);

    const space = useSelector(state => state.page.space);
    const itemCopy = useSelector(state => state.page.itemCopy);
    const workspaceKey = useSelector(state => state.container.workspaceKey);

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
            dispatch(clearContainer());
            debugLog(debugOn, "set pageItemId: ", router.query.itemId);
            setPageItemId(router.query.itemId);
            setPageCleared(true);
            setPageDate(parse(router.query.itemId.split(':').pop(), 'yyyyLLdd', new Date()));
        }
    }, [router.query.itemId]);

    useEffect(() => {
        if (pageItemId && pageCleared) {
            debugLog(debugOn, "Dispatch getPageItemThunk ...");
            dispatch(getPageItemThunk({ itemId: pageItemId }));
        }
    }, [pageItemId, pageCleared]);

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

            if (space.substring(0, 1) === 'u') {
                debugLog(debugOn, "Dispatch initWorkspace ...");
                dispatch(initWorkspace({ space, workspaceKey: expandedKey, searchKey, searchIV }));
            } else {
            }
        }
    }, [space]);

    useEffect(() => {
        debugLog(debugOn, "useEffect [workspaceKey] ...");
        if (workspaceKey && itemCopy && pageCleared) {
            setPageCleared(false);
            debugLog(debugOn, "Dispatch decryptPageItemThunk ...");
            dispatch(decryptPageItemThunk({ itemId: pageItemId, workspaceKey }));
            dispatch(getPageCommentsThunk({ itemId: pageItemId }));
        }
    }, [workspaceKey]);
    const [today] = useState(new Date());
    var distance = Math.ceil((today - pageDate) / (1000 * 60 * 60 * 24));
    if (isSameDay(pageDate, today))
        distance = 'Today';
    else if (distance === 1)
        distance = '1 day ago'
    else if (distance === 2)
        distance = '2 days ago'
    else distance = null;

    const gotoAnotherPage = (anotherPageNumber) => {
        if (!(pageItemId && pageDate)) return;

        let idParts, nextPageId;
        idParts = pageItemId.split(':');
        idParts.splice(-1);
        const newDate = new Date(pageDate.valueOf());
        switch (anotherPageNumber) {
            case '-1':
                newDate.setDate(newDate.getDate() - 1);
                idParts.push(format(newDate, 'yyyyLLdd'));
                break;
            case '+1':
                newDate.setDate(newDate.getDate() + 1);
                idParts.push(format(newDate, 'yyyyLLdd'));
                break;
            default:
                idParts.push(anotherPageNumber);

        }

        nextPageId = idParts.join(':');
        router.push(`/diary/p/${nextPageId}`);
    }
    const gotoNextPage = () => {
        debugLog(debugOn, "Next Page ");
        gotoAnotherPage('+1');
    }

    const gotoPreviousPage = () => {
        debugLog(debugOn, "Previous Page ");
        gotoAnotherPage('-1');
    }

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
                                <Row style={{ marginTop: '20px' }} className=" mx-0">
                                    <Col xs={12} sm={{ span: 10, offset: 1 }} md={{ span: 8, offset: 2 }}>
                                        {distance && <h2>{distance}</h2>}
                                        <h4>{pageDate && format(pageDate, 'EEEE, LLL. dd, yyyy')}</h4>
                                    </Col>
                                </Row>
                                <Row className="justify-content-center">
                                    <Col sm="10" md="8">
                                        <hr />
                                    </Col>
                                </Row>
                                <PageCommons />
                            </div>
                            <TurningPageControls onNextClicked={gotoNextPage} onPreviousClicked={gotoPreviousPage} />

                        </Container> :
                        <LoadingSpinner />}
                </ContentPageLayout>
                <Scripts />
            </div>
        </div>
    )
}
