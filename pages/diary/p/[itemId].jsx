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
import { clearPage, getPageItemThunk, decryptPageItemThunk, saveTitleThunk } from "../../../reduxStore/pageSlice";

import { debugLog } from "../../../lib/helper";
import { getLastAccessedItem } from "../../../lib/bSafesCommonUI";
import parse from "date-fns/parse";
import format from "date-fns/format";
import isSameDay from "date-fns/isSameDay";
import LoadingSpinner from "../../../components/LoadingSpinner";
import PageCommons from "../../../components/pageCommons";

export default function Notebook() {
    const debugOn = true;
    debugLog(debugOn, "Rendering item");
    // const dispatch = useDispatch();
    const router = useRouter();
    const [today] = useState(new Date());
    const [pageDate, setPageDate] = useState();
    const [pageItemId, setPageItemId] = useState(null);
    useEffect(() => {
        if (router.isReady && !pageItemId) {
            const { itemId } = router.query;
            setPageItemId(itemId);
            setPageDate(parse(itemId.split(':').pop(), 'yyyy-MM-dd', new Date()));
        }
    }, [router.isReady]);
    // const [pageCleared, setPageCleared] = useState(false); 
    // const [isOpen, setIsOpen] = useState(false);

    // const { itemId } = router.query;
    // if(itemId && !pageItemId) {
    //     setPageItemId(itemId);
    // }

    // const searchKey = useSelector( state => state.auth.searchKey);
    // const searchIV = useSelector( state => state.auth.searchIV);
    // const expandedKey = useSelector( state => state.auth.expandedKey );

    // const space = useSelector( state => state.page.space);
    // const workspaceKey = useSelector( state => state.container.workspaceKey);
    // const workspaceSearchKey = useSelector( state => state.container.searchKey);
    // const workspaceSearchIV = useSelector( state => state.container.searchIV);

    const activity = useSelector(state => state.page.activity);
    const [editingEditorId, setEditingEditorId] = useState(null);

    const [titleEditorMode, setTitleEditorMode] = useState("ReadOnly");
    const titleEditorContent = useSelector(state => state.page.title);
    var distance = Math.ceil((today - pageDate) / (1000 * 60 * 60 * 24));
    if (isSameDay(pageDate, today))
        distance = 'Today';
    else if (distance === 1)
        distance = '1 day ago'
    else if (distance === 2)
        distance = '2 days ago'
    else distance = null;
    const handleContentChanged = (editorId, content) => {
        debugLog(debugOn, `editor-id: ${editorId} content: ${content}`);

        if (editingEditorId === "title") {
            if (content !== titleEditorContent) {
                dispatch(saveTitleThunk(content, workspaceSearchKey, workspaceSearchIV));
            } else {
                setEditingEditorMode("ReadOnly");
                setEditingEditorId(null);
            }
        }
    }
    const handlePenClicked = (editorId) => {
        debugLog(debugOn, `pen ${editorId} clicked`);
        if (editorId === 'title') {
            setTitleEditorMode("Writing");
            setEditingEditorId("title");
        }
    }
    const setEditingEditorMode = (mode) => {
        switch (editingEditorId) {
            case 'title':
                setTitleEditorMode(mode);
                break;
            default:
        }
    }

    return (
        <div>
            <div className={BSafesStyle.pageBackground}>
                <ContentPageLayout>
                    {pageItemId ?
                        <Container>
                            <br />
                            <TopControlPanel showListIcon />
                            <br />
                            <div className={`${BSafesStyle.diaryPanel} ${BSafesStyle.pagePanel} ${BSafesStyle.rightPagePanel} ${BSafesStyle.containerPanel}`}>
                                <ItemTopRows />
                                <Row style={{ marginTop: '20px' }} className=" mx-0">
                                    <Col xs={12} sm={{ span: 10, offset: 1 }} md={{ span: 8, offset: 2 }}>
                                        {distance && <h2>{distance}</h2>}
                                        <h4>{format(pageDate, 'EEEE, LLL. dd, yyyy')}</h4>
                                    </Col>
                                </Row>
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
