import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useSelector, useDispatch } from 'react-redux'

import Container from 'react-bootstrap/Container'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Dropdown from 'react-bootstrap/Dropdown'
import Tab from 'react-bootstrap/Tab'
import Tabs from 'react-bootstrap/Tabs'
import Pagination from 'react-bootstrap/Pagination'

import BSafesStyle from '../../../styles/BSafes.module.css'

import Scripts from "../../../components/scripts";
import ContentPageLayout from '../../../components/layouts/contentPageLayout';
import TopControlPanel from "../../../components/folderTopControlPanel";
import ItemTopRows from "../../../components/itemTopRows";
import Editor from "../../../components/editor";
import ContainerOpenButton from "../../../components/containerOpenButton";
import PageCommonControls from "../../../components/pageCommonControls";

import { clearContainer, initWorkspace } from "../../../reduxStore/containerSlice";
import { clearPage, getPageItemThunk, decryptPageItemThunk, saveTitleThunk, getContainerContentsThunk, searchContainerContentsThunk } from "../../../reduxStore/pageSlice";

import { debugLog } from "../../../lib/helper";
import { getLastAccessedItem } from "../../../lib/bSafesCommonUI";
import format from "date-fns/format";
import getDaysInMonth from "date-fns/getDaysInMonth";
import Link from "next/link";
import AddAnItemButton from "../../../components/addAnItemButton";
import NewItemModal from "../../../components/newItemModal";

export default function Folder() {
    const debugOn = true;
    debugLog(debugOn, "Rendering item");
    const dispatch = useDispatch();
    const router = useRouter();

    const [pageItemId, setPageItemId] = useState(null);
    const [pageCleared, setPageCleared] = useState(false);
    const [showNewItemModal, setShowNewItemModal] = useState(false);
    const [addAction, setAddAction] = useState(null);
    const [targetItem, setTargetItem] = useState(null);
    const [selectedItemType, setSelectedItemType] = useState(null);
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
    const handleCreateANewItem = async (title) => {
        debugLog(debugOn, "createANewItem", title);
        setShowNewItemModal(false);

        const item = await createANewItem(title, workspaceId, selectedItemType, addAction, targetItem, workspaceKey, searchKey, searchIV);
        const link = getItemLink(item);

        router.push(link);
    }
    const addAnItem = (itemType, addAction, targetItem = null) => {

        setSelectedItemType(itemType);
        setAddAction(addAction);
        setTargetItem(targetItem);
        setShowNewItemModal(true);

    }
    return (
        <div>
            <div className={BSafesStyle.pageBackground}>
                <ContentPageLayout>
                    <Container>
                        <br />
                        <TopControlPanel {...{ startDate, setStartDate, handleSearch }} closeDiary={() => setIsOpen(false)} datePickerViewMode={"monthYear"} showSearchIcon />
                        <br />
                        <div className={`${BSafesStyle.pagePanel} ${BSafesStyle.diaryPanel} ${BSafesStyle.containerContentsPanel}`}>
                            <br />
                            <br />
                            <h2 className="text-center">Contents</h2>
                            <div className="d-flex justify-content-center">
                                <AddAnItemButton pageOnly addAnItem={addAnItem} />
                            </div>
                            <NewItemModal show={showNewItemModal} handleClose={() => setShowNewItemModal(false)} handleCreateANewItem={handleCreateANewItem} />
                            <Tabs
                                defaultActiveKey="all"
                                className="mb-3 mx-4"
                            >
                                <Tab eventKey="all" title="All" >
                                    <div className="searchResult">
                                        <div className="resultItems">

                                            {Array.from(Array(5)).map(() => <Row className="mt-1">
                                                <Col xs={{ span: 7, offset: 1 }}>
                                                    <a href="#" className="text-decoration-none text-black">
                                                        <div class="">
                                                            <p class="containerContentsPageTitle my-0" >
                                                                <i class="fa fa-file-text-o me-2" aria-hidden="true"></i>
                                                                Hello World</p>
                                                        </div>
                                                    </a>
                                                </Col>
                                                <Col xs={3}>
                                                    <Dropdown className="pull-right px-2">
                                                        <Dropdown.Toggle variant="link" bsPrefix="p-0 text-decoration-none text-black" id="dropdown-basic">
                                                            +
                                                        </Dropdown.Toggle>

                                                        <Dropdown.Menu>
                                                            <Dropdown.Item href="#/action-1">Add before</Dropdown.Item>
                                                            <Dropdown.Item href="#/action-2">Add After</Dropdown.Item>
                                                        </Dropdown.Menu>
                                                    </Dropdown>

                                                    <div class="checkbox pull-right my-0 ">
                                                        <input type="checkbox" class="form-check-input" />
                                                    </div>
                                                </Col>
                                                <Col xs={{ span: 10, offset: 1 }}>
                                                    <hr class="my-0" />
                                                </Col>
                                            </Row>)}
                                        </div>
                                    </div>
                                    <div className="d-flex justify-content-center mt-4">
                                        <Pagination size="sm">{[1].map(page => (
                                            <Pagination.Item key={page} active={page === page}>
                                                {page}
                                            </Pagination.Item>
                                        ))}</Pagination>

                                    </div>

                                </Tab>
                            </Tabs>
                        </div>
                    </Container>
                </ContentPageLayout>
                <Scripts />
            </div>
        </div>
    )
}
