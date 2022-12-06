import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useSelector, useDispatch } from 'react-redux'

import Container from 'react-bootstrap/Container'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'

import parse from "date-fns/parse";
import format from "date-fns/format";
import isSameDay from "date-fns/isSameDay";

import BSafesStyle from '../../../styles/BSafes.module.css'

import Scripts from "../../../components/scripts";
import ContentPageLayout from '../../../components/layouts/contentPageLayout';

import DiaryTopControlPanel from "../../../components/diaryTopControlPanel";
import ItemTopRows from "../../../components/itemTopRows";
import PageCommons from "../../../components/pageCommons";
import TurningPageControls from "../../../components/turningPageControls";

import { clearContainer, initContainer } from '../../../reduxStore/containerSlice';
import { abort, clearPage, setContainerData, decryptPageItemThunk, getPageItemThunk, getPageCommentsThunk } from "../../../reduxStore/pageSlice";

import { debugLog } from "../../../lib/helper";

export default function DiaryPage() {
    const debugOn = true;
    debugLog(debugOn, "Rendering item");
    const dispatch = useDispatch();
    const router = useRouter();

    const [pageItemId, setPageItemId] = useState(null);
    const [navigationInSameContainer, setNavigationInSameContainer] = useState(false);
    const [today] = useState(parse(format(new Date(), 'yyyy-LL-dd'), 'yyyy-LL-dd', new Date()));
    const [pageDate, setPageDate] = useState();
    const [distance, setDistance] = useState(null);
    const [pageStyle, setPageStyle] = useState(''); 
    const [pageCleared, setPageCleared] = useState(false); 
    const [containerCleared, setContainerCleared] = useState(false);
    const [workspaceKeyReady, setWorkspaceKeyReady] = useState(false);
    
    const searchKey = useSelector( state => state.auth.searchKey);
    const searchIV = useSelector( state => state.auth.searchIV);
    const expandedKey = useSelector( state => state.auth.expandedKey );

    const navigationMode = useSelector( state => state.page.navigationMode);
    const space = useSelector( state => state.page.space);
    const container = useSelector( state => state.page.container);
    const itemCopy = useSelector( state => state.page.itemCopy);

    const containerInWorkspace = useSelector( state => state.container.container);
    const workspace = useSelector( state => state.container.workspace);
    const workspaceKey = useSelector( state => state.container.workspaceKey);

    const gotoAnotherDate = (anotherDate) => {
        if (!(pageItemId && pageDate)) return;

        let idParts, nextPageId;
        idParts = pageItemId.split(':');
        idParts.splice(-1);
        const newDate = new Date(pageDate.valueOf());
        switch (anotherDate) {
            case '-1':
                newDate.setDate(newDate.getDate() - 1);
                idParts.push(format(newDate, 'yyyy-LL-dd'));
                break;
            case '+1':
                newDate.setDate(newDate.getDate() + 1);
                idParts.push(format(newDate, 'yyyy-LL-dd'));
                break;
            default:
                idParts.push(anotherDate);

        }

        nextPageId = idParts.join(':');
        debugLog(debugOn, "setNavigationInSameContainer ...");
        setNavigationInSameContainer(true);
        router.push(`/diary/p/${nextPageId}`);
    }

    const gotoNextPage = () =>{
        debugLog(debugOn, "Next Page ");
        gotoAnotherDate('+1');
    }

    const gotoPreviousPage = () => {
        debugLog(debugOn, "Previous Page ");
        gotoAnotherDate('-1');
    }

    const handleDateChanged = (date) => {    
        let newDate;
        if(isSameDay(date, pageDate)) return; 
        debugLog(debugOn, "date chagned: ", date);
        newDate = format(date, 'yyyy-LL-dd');
        gotoAnotherDate(newDate);
    }

    useEffect(() => {
        const handleRouteChange = (url, { shallow }) => {
          console.log(
            `App is changing to ${url} ${
              shallow ? 'with' : 'without'
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

    useEffect(()=>{
        if(router.query.itemId) {
            let dateStr, date, distance, dd;
            dispatch(clearPage());
            setWorkspaceKeyReady(false);
            debugLog(debugOn, "set pageItemId: ", router.query.itemId);
            setPageItemId(router.query.itemId);
            setPageCleared(true);
            dateStr = router.query.itemId.split(':').pop();
            date = parse(dateStr, 'yyyy-LL-dd', new Date());
            setPageDate(date);

            if (isSameDay(date, today)) {
                distance = 'Today';
            } else if(today > date) {
                distance = Math.ceil((today - date) / (1000 * 60 * 60 * 24));
                if (distance === 1)
                    distance = '1 day ago'
                else if (distance === 2)
                    distance = '2 days ago'
                else distance = null;
            } else {
                distance = Math.ceil((date - today) / (1000 * 60 * 60 * 24));
                if (distance === 1)
                    distance = 'Tomorrow'
                else distance = null;
            }

            setDistance(distance);

            dd = parseInt(dateStr.split('-')[2]);
            if(dd%2) {
                setPageStyle(BSafesStyle.leftPagePanel);
            } else {
                setPageStyle(BSafesStyle.rightPagePanel);
            }
        }
    }, [router.query.itemId]);

    useEffect(()=>{
        if(pageItemId && pageCleared) {
            debugLog(debugOn, "Dispatch getPageItemThunk ...");
            dispatch(getPageItemThunk({itemId:pageItemId, navigationInSameContainer}));
        }
    }, [pageItemId, pageCleared]);

    useEffect(()=>{
        if(pageCleared && navigationMode) {
            debugLog(debugOn, "setContainerData ...");
            dispatch(setContainerData({itemId:pageItemId, container:{space: workspace, id: containerInWorkspace} }));
        }
    }, [navigationMode]);

    useEffect(()=>{
        if(space && pageCleared) {
            if(container === containerInWorkspace ) {
                setWorkspaceKeyReady(true);
                return;
            }
        
            dispatch(clearContainer());
            setContainerCleared(true);
        }
    }, [space]);

    useEffect(()=>{
        if(containerCleared) {
            if (space.substring(0, 1) === 'u') {
                debugLog(debugOn, "Dispatch initWorkspace ...");
                dispatch(initContainer({container, workspaceId: space, workspaceKey: expandedKey, searchKey, searchIV }));
                setWorkspaceKeyReady(true);
            } else {
            }
        }        
    }, [containerCleared]);

    useEffect(()=>{
        debugLog(debugOn, "useEffect [workspaceKeyReady] ...");
        if(workspaceKeyReady && workspaceKey && itemCopy && pageCleared) {
            setPageCleared(false);
            setContainerCleared(false);
            debugLog(debugOn, "Dispatch decryptPageItemThunk ...");
            dispatch(decryptPageItemThunk({itemId:pageItemId, workspaceKey}));
            dispatch(getPageCommentsThunk({itemId:pageItemId}));
        }
    }, [workspaceKeyReady, itemCopy]);

    return (
        <div className={BSafesStyle.pageBackground}>
            <ContentPageLayout>            
                <Container fluid>
                    <br />
                    <DiaryTopControlPanel
                                showListIcon
                                startDate={pageDate}
                                setStartDate={handleDateChanged}
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
                    <Row>
                        <Col lg={{span:10, offset:1}}>
                            <div className={`${BSafesStyle.pagePanel} ${BSafesStyle.diaryPanel} ${pageStyle}`}>
                                <ItemTopRows />
                                <Row className="mt-5">
                                    <Col xs={12} sm={{ span: 10, offset: 1 }} md={{ span: 10, offset: 1 }}>
                                        {distance && <h2>{distance}</h2>}
                                        <h4>{pageDate && format(pageDate, 'EEEE, LLL. dd, yyyy')}</h4>
                                    </Col>
                                </Row>
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
    );
}