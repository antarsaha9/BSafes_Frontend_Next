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

import BSafesStyle from '../../styles/BSafes.module.css'

import Scripts from "../../components/scripts";
import ContentPageLayout from '../../components/layouts/contentPageLayout';
import TopControlPanel from "../../components/topControlPanel";
import ItemTopRows from "../../components/itemTopRows";
import Editor from "../../components/editor";
import ContainerOpenButton from "../../components/containerOpenButton";
import PageCommonControls from "../../components/pageCommonControls";

import { clearContainer, initContainer} from "../../reduxStore/containerSlice";
import { abort, clearPage, getPageItemThunk, decryptPageItemThunk, saveTitleThunk } from "../../reduxStore/pageSlice";

import { debugLog } from "../../lib/helper";
import { getLastAccessedItem } from "../../lib/bSafesCommonUI";

export default function Folder() {
    const debugOn = false;
    debugLog(debugOn, "Rendering item");
    const dispatch = useDispatch();
    const router = useRouter();

    const [pageItemId, setPageItemId] = useState(null);
    const [pageCleared, setPageCleared] = useState(false);
    const [containerCleared, setContainerCleared] = useState(false);
    const [workspaceKeyReady, setWorkspaceKeyReady] = useState(false);

    const searchKey = useSelector( state => state.auth.searchKey);
    const searchIV = useSelector( state => state.auth.searchIV);
    const expandedKey = useSelector( state => state.auth.expandedKey );

    const space = useSelector( state => state.page.space);
    const container = useSelector( state => state.page.container);

    const containerInWorkspace = useSelector( state => state.container.container);
    const workspaceKey = useSelector( state => state.container.workspaceKey);
    const workspaceSearchKey = useSelector( state => state.container.searchKey);
    const workspaceSearchIV = useSelector( state => state.container.searchIV);

    const activity = useSelector( state => state.page.activity);
    const [editingEditorId, setEditingEditorId] = useState(null);

    const itemCopy = useSelector( state => state.page.itemCopy);
    const [titleEditorMode, setTitleEditorMode] = useState("ReadOnly");
    const titleEditorContent = useSelector(state => state.page.title);

    const handlePenClicked = (editorId) => {
        debugLog(debugOn, `pen ${editorId} clicked`);
        if(editorId === 'title') {
            setTitleEditorMode("Writing");
            setEditingEditorId("title");
        } 
    }

    const handleContentChanged = (editorId, content) => {
        debugLog(debugOn, `editor-id: ${editorId} content: ${content}`);
        
        if(editingEditorId === "title") {
            if(content !== titleEditorContent) {
                dispatch(saveTitleThunk(content, workspaceKey, workspaceSearchKey, workspaceSearchIV));
            } else {
                setEditingEditorMode("ReadOnly");
                setEditingEditorId(null);
            }
        }  
    }

    const setEditingEditorMode = (mode) => {
        switch(editingEditorId) {
            case 'title':
                setTitleEditorMode(mode);
                break;
            default:
        }
    }

    const handleWrite = () =>{
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

    const handleOpen = async () => {
        debugLog(debugOn, "handleOpen");
        try {
            const item = await getLastAccessedItem(pageItemId);
            if(item) {
                debugLog(debugLog, item);
            } else {
                const link = `/folder/contents/${pageItemId}`;
                router.push(link);
            }
        } catch (error) {
            debugLog(debugOn, error)
        }
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
            dispatch(clearPage());
            setWorkspaceKeyReady(false);
            debugLog(debugOn, "set pageItemId: ", router.query.itemId);
            setPageItemId(router.query.itemId);
            setPageCleared(true);
        }
    }, [router.query.itemId]);

    useEffect(()=>{
        if(pageItemId && pageCleared) {
            debugLog(debugOn, "Dispatch getPageItemThunk ...");
            dispatch(getPageItemThunk({itemId:pageItemId}));
        }
    }, [pageCleared, pageItemId]);

    useEffect(() => {
        if(activity === "Done") {
            if(editingEditorId) {
                setEditingEditorMode("ReadOnly");
                setEditingEditorId(null);
            }
        } else if (activity === "Error") {
            if(editingEditorId) {
                setEditingEditorMode("Writing");
            }
        }
    }, [activity]);

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
        debugLog(debugOn, "useEffect [workspaceKey] ...");
        if(workspaceKeyReady && workspaceKey && pageCleared && itemCopy) {
            setPageCleared(false);
            debugLog(debugOn, "Dispatch decryptPageItemThunk ...");
            dispatch(decryptPageItemThunk({itemId:pageItemId, workspaceKey}));
        }
    }, [workspaceKeyReady]);

    return (
        <div>
            <div className={BSafesStyle.pageBackground}>
                <ContentPageLayout>
                    <Container fluid> 
                        <br />
                        <TopControlPanel></TopControlPanel>
                        <br />
                        <Row>
                            <Col lg={{span:10, offset:1}}>                       
                            { 
                                <div className={`${BSafesStyle.folderPanel} ${BSafesStyle.folderCoverPanel} ${BSafesStyle.containerCoverPanel}`}>
                                    <div className={BSafesStyle.folderTab}>
				                    </div>
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
                                            <ContainerOpenButton handleOpen={handleOpen} />
                                        </Col>
                                    </Row>
                                    <PageCommonControls isEditing={editingEditorId} onWrite={handleWrite} onSave={handleSave} onCancel={handleCancel} />
                                </div>
                            }
                            </Col>
                        </Row>
                    </Container> 
                </ContentPageLayout>
                <Scripts />
            </div>
        </div>
    )
}