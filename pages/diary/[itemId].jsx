import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useSelector, useDispatch } from 'react-redux'

import Container from 'react-bootstrap/Container'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'

import BSafesStyle from '../../styles/BSafes.module.css'

import Scripts from "../../components/scripts";
import ContentPageLayout from '../../components/layouts/contentPageLayout';
import TopControlPanel from "../../components/diaryTopControlPanel";
import ItemTopRows from "../../components/itemTopRows";
import Editor from "../../components/editor";
import ContainerOpenButton from "../../components/containerOpenButton";
import PageCommonControls from "../../components/pageCommonControls";

import { clearContainer, initWorkspace } from "../../reduxStore/containerSlice";
import { clearPage, getPageItemThunk, decryptPageItemThunk, saveTitleThunk, getContainerContentsThunk, searchContainerContentsThunk } from "../../reduxStore/pageSlice";

import { debugLog } from "../../lib/helper";
import { getLastAccessedItem } from "../../lib/bSafesCommonUI";
import format from "date-fns/format";
import getDaysInMonth from "date-fns/getDaysInMonth";
import Link from "next/link";

export default function Diary() {
    const debugOn = true;
    debugLog(debugOn, "Rendering item");
    const dispatch = useDispatch();
    const router = useRouter();

    const [pageItemId, setPageItemId] = useState(null);
    const [pageCleared, setPageCleared] = useState(false);
    const { initialDisplay } = router.query;
    // const isOpen = !(initialDisplay && initialDisplay === 'cover');
    const [isOpen, setIsOpen] = useState(false);

    const searchKey = useSelector(state => state.auth.searchKey);
    const searchIV = useSelector(state => state.auth.searchIV);
    const expandedKey = useSelector(state => state.auth.expandedKey);

    const space = useSelector(state => state.page.space);
    const workspaceKey = useSelector(state => state.container.workspaceKey);
    const workspaceSearchKey = useSelector(state => state.container.searchKey);
    const workspaceSearchIV = useSelector(state => state.container.searchIV);

    const activity = useSelector(state => state.page.activity);
    const [editingEditorId, setEditingEditorId] = useState(null);

    const itemCopy = useSelector(state => state.page.itemCopy);
    const [titleEditorMode, setTitleEditorMode] = useState("ReadOnly");
    const titleEditorContent = useSelector(state => state.page.title);
    const containerContents = useSelector(state => state.page.containerContents);


    const handlePenClicked = (editorId) => {
        debugLog(debugOn, `pen ${editorId} clicked`);
        if (editorId === 'title') {
            setTitleEditorMode("Writing");
            setEditingEditorId("title");
        }
    }

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

    const setEditingEditorMode = (mode) => {
        switch (editingEditorId) {
            case 'title':
                setTitleEditorMode(mode);
                break;
            default:
        }
    }

    const handleWrite = () => {
        debugLog(debugOn, "handleWrite");
        setTitleEditorMode("Writing");
        setEditingEditorId("title");
    }

    const handleSave = () => {
        debugLog(debugOn, "handleSave");
        setEditingEditorMode("Saving");
    }

    const handleCancel = () => {
        debugLog(debugOn, "handleCancel");
        setEditingEditorMode("ReadOnly");
        setEditingEditorId(null);
    }

    const handleSearch = (value) => {
        dispatch(searchContainerContentsThunk(value, workspaceKey));
    }

    const handleOpen = async () => {
        debugLog(debugOn, "handleOpen");
        try {
            setIsOpen(true);
            const fromDate = new Date(startDate.getFullYear(), startDate.getMonth(), 1);
            const endDate = new Date(startDate.getFullYear(), startDate.getMonth(), getDaysInMonth(startDate));
            // if (!containerContents)
                dispatch(getContainerContentsThunk({
                    itemId: pageItemId,
                    size: 31,
                    from: 0,
                    fromDate,
                    endDate,
                }, expandedKey));
            // const item = await getLastAccessedItem(pageItemId);
            // if (item) {
            //     debugLog(debugLog, item);
            // } else {
            //     debugLog(debugLog, "lastAccessedItem not set");
            //     const idParts = pageItemId.split(":");
            //     const firstPage = `/diary/p/dp:${idParts[1]}:${idParts[2]}:${idParts[3]}:1`;
            //     router.push(firstPage);
            // }

        } catch (error) {
            debugLog(debugOn, error)
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

        // router.events.on('routeChangeStart', handleRouteChange)

        // // If the component is unmounted, unsubscribe
        // // from the event with the `off` method:
        // return () => {
        //     router.events.off('routeChangeStart', handleRouteChange)
        // }
    }, []);

    useEffect(() => {
        setIsOpen(!initialDisplay && initialDisplay !== 'cover');

    }, [initialDisplay, itemCopy])
    useEffect(() => {
        if (isOpen && itemCopy)
            handleOpen();
    }, [isOpen, itemCopy])
    useEffect(() => {
        if (router.query.itemId) {
            dispatch(clearPage());
            dispatch(clearContainer());
            debugLog(debugOn, "set pageItemId: ", router.query.itemId);
            setPageItemId(router.query.itemId);
            setPageCleared(true);
        }
    }, [router.query.itemId]);

    useEffect(() => {
        if (pageItemId && pageCleared) {
            debugLog(debugOn, "Dispatch getPageItemThunk ...");
            dispatch(getPageItemThunk({ itemId: pageItemId }));
        }
    }, [pageCleared, pageItemId]);

    useEffect(() => {
        if (activity === "Done") {
            if (editingEditorId) {
                setEditingEditorMode("ReadOnly");
                setEditingEditorId(null);
            }
        } else if (activity === "Error") {
            if (editingEditorId) {
                setEditingEditorMode("Writing");
            }
        }
    }, [activity]);

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
        if (workspaceKey && pageCleared && itemCopy) {
            setPageCleared(false);
            debugLog(debugOn, "Dispatch decryptPageItemThunk ...");
            dispatch(decryptPageItemThunk({ itemId: pageItemId, workspaceKey }));
        }
    }, [workspaceKey]);
    const [startDate, setStartDate] = useState(new Date());
    const showingMonthDate = startDate;
    console.log(showingMonthDate);
    const currentMonthYear = format(showingMonthDate, 'MMM. yyyy') //=> 'Nov'

    return (
        <div>
            <div className={BSafesStyle.pageBackground}>
                <ContentPageLayout>
                    <Container>
                        <br />
                        {isOpen && <TopControlPanel {...{ startDate, setStartDate, handleSearch }} closeDiary={() => setIsOpen(false)} datePickerViewMode={"monthYear"} showSearchIcon />}
                        <br />
                        {!isOpen &&
                            <div className={`${BSafesStyle.diaryPanel} ${BSafesStyle.diaryCoverPanel} ${BSafesStyle.containerCoverPanel} ${BSafesStyle.containerPanel}`}>
                                <ItemTopRows />
                                <br />
                                <br />
                                <Row className="justify-content-center">
                                    <Col className={BSafesStyle.containerTitleLabel} xs="10" sm="10" md="8" >
                                        <Editor editorId="title" mode={titleEditorMode} content={titleEditorContent} onContentChanged={handleContentChanged} onPenClicked={handlePenClicked} editable={!editingEditorId && (activity === "Done")} />
                                    </Col>
                                </Row>
                                <br />
                                <Row>
                                    <Col>
                                        <ContainerOpenButton handleOpen={()=>setIsOpen(true)} />
                                    </Col>
                                </Row>
                                <PageCommonControls isEditing={editingEditorId} onWrite={handleWrite} onSave={handleSave} onCancel={handleCancel} />
                            </div>
                        }
                        {isOpen &&
                            <div className={`${BSafesStyle.pagePanel} ${BSafesStyle.diaryPanel} ${BSafesStyle.containerContentsPanel}`}>
                                <br />
                                <br />
                                <h2 className="text-center">{currentMonthYear}</h2>

                                <Row>
                                    <Col xs={{ span: 3, offset: 1 }} sm={{ span: 3, offset: 1 }} md={{ span: 2, offset: 1 }}>
                                        Day
                                    </Col>
                                    <Col xs={{ span: 8, offset: 0 }} sm={{ span: 8, offset: 0 }} md={{ span: 9, offset: 0 }}>
                                        Title
                                    </Col>
                                </Row>
                                <div className="searchResult">
                                    <div className="resultItems">
                                        {(() => {
                                            const fromDate = new Date(showingMonthDate.valueOf());
                                            fromDate.setDate(0)
                                            console.log(containerContents);

                                            const list = containerContents.map((cont, index) => {

                                                // })
                                                // for (let index = 0; index < getDaysInMonth(fromDate); index++) {
                                                // fromDate.setDate(fromDate.getDate() + 1);
                                                const contDate = cont.date;
                                                const title = cont.title || '';
                                                const backgroundColor = showingMonthDate.getDate() === contDate.getDate() ? '#EBF5FB' : (contDate.getDay() % 6 === 0 ? '#d4d5d5' : null);
                                                const newId = pageItemId.replace('d:', 'dp:') + ':' + format(contDate, 'yyyy-LL-dd');
                                                const row = (
                                                    <Row key={index}>
                                                        <Col xs={{ span: 3, offset: 1 }} sm={{ span: 3, offset: 1 }} md={{ span: 2, offset: 1 }} style={{ backgroundColor }}>
                                                            <Link href={{ pathname: '/diary/p/[itemId]', query: { itemId: newId } }}>
                                                                <a className={`${BSafesStyle.containerContentsPageTitle} itemPage`} id="pageNumberLink" >{format(contDate, 'd EEEEE')}</a>
                                                            </Link>
                                                        </Col>
                                                        <Col xs={8} sm={8} md={9}>
                                                            <Link href={{ pathname: '/diary/p/[itemId]', query: { itemId: newId } }}>
                                                                <a className="itemLink blackText text-decoration-none">
                                                                    <p className={`${BSafesStyle.containerContentsPageTitle} my-0`} id="titleLink">{title}</p>
                                                                </a>
                                                            </Link>
                                                        </Col>
                                                        <Col xs={{ span: 10, offset: 1 }}>
                                                            <hr className={BSafesStyle.marginTopBottom0Px} />
                                                        </Col>
                                                    </Row>
                                                )
                                                return row;
                                            })
                                            return list;
                                        })()}
                                    </div>
                                </div>
                            </div>
                        }
                    </Container>
                </ContentPageLayout>
                <Scripts />
            </div>
        </div>
    )
}
