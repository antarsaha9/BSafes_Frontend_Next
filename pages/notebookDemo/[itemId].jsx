import { useEffect, useState } from "react";
import {useRouter} from "next/router";
import { useSelector, useDispatch } from 'react-redux'

import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'

import BSafesStyle from '../../styles/BSafes.module.css'

import Scripts from "../../components/scripts";
import ContentPageLayout from '../../components/layouts/contentPageLayout';
import PageItemWrapper from "../../components/pageItemWrapper";

import TopControlPanel from "../../components/topControlPanel";
import ItemTopRows from "../../components/itemTopRows";
import Editor from "../../components/editor";
import ContainerOpenButton from "../../components/containerOpenButton";
import PageCommonControls from "../../components/pageCommonControls";

import { setDemoMode } from "../../reduxStore/auth";
import { saveTitleThunk } from "../../reduxStore/pageSlice";

import { debugLog } from "../../lib/helper";
import { setupDemo} from "../../lib/demoHelper"
import { getCoverAndContentsLink} from "../../lib/bSafesCommonUI";

export default function Notebook() {
    const debugOn = false;
    debugLog(debugOn, "Rendering item");
    const dispatch = useDispatch();
    const router = useRouter();

    const pageItemId = useSelector( state => state.page.id);
    const container = useSelector( state => state.page.container);
    
    const workspaceKey = useSelector( state => state.container.workspaceKey);
    const workspaceSearchKey = useSelector( state => state.container.searchKey);
    const workspaceSearchIV = useSelector( state => state.container.searchIV);

    const activity = useSelector( state => state.page.activity);
    const activityErrors = useSelector( state => state.page.activityErrors);
    const [editingEditorId, setEditingEditorId] = useState(null);

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

        const idParts = pageItemId.split(":");
        const firstPage = `/notebook/p/np:${idParts[1]}:${idParts[2]}:${idParts[3]}:1`;
        router.push(firstPage);
            
    }

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

    useEffect(() => {
        if(setupDemo()){
            dispatch(setDemoMode(true));
        }
    }, []);

    useEffect(() => {
        if(activity === 0) {
            if((activityErrors === 0) && editingEditorId) {
                setEditingEditorMode("ReadOnly");
                setEditingEditorId(null);
            } else if(editingEditorId) {
                setEditingEditorMode("Writing");
            }
        } 
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activity]);

    return (
        <div>
            <div className={BSafesStyle.pageBackground}>
                <ContentPageLayout>
                    <PageItemWrapper itemId={router.query.itemId}> 
                        <br />
                        <TopControlPanel onCoverClicked={handleCoverClicked} onContentsClicked={handleContentsClicked} ></TopControlPanel>
                        <br />  
                        <Row>
                            <Col lg={{span:10, offset:1}}>                       
                            { 
                                <div className={`${BSafesStyle.notebookPanel} ${BSafesStyle.notebookCoverPanel} ${BSafesStyle.containerCoverPanel}`}>
                                    <ItemTopRows />
                                    <br />
                                    <br />
                                    <Row className="justify-content-center">
                                        <Col className={BSafesStyle.containerTitleLabel} xs="10" sm="10" md="8" >
                                            <Editor editorId="title" mode={titleEditorMode} content={titleEditorContent} onContentChanged={handleContentChanged} onPenClicked={handlePenClicked} editable={!editingEditorId && (activity === 0)} />
                                        </Col> 
                                    </Row>
                                    <br />
                                    <Row>
                                        <Col>
                                            <ContainerOpenButton handleOpen={handleOpen}/>
                                        </Col>
                                    </Row>
                                    <PageCommonControls isEditing={editingEditorId} onWrite={handleWrite} onSave={handleSave} onCancel={handleCancel}/>
                                </div> 
                            }
                            </Col>
                        </Row>
                    </PageItemWrapper> 
                </ContentPageLayout>
                <Scripts />
            </div>
        </div>
    )
}
