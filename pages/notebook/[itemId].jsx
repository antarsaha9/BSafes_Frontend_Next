import { useEffect, useState } from "react";
import {useRouter} from "next/router";
import { useSelector, useDispatch } from 'react-redux'

import Container from 'react-bootstrap/Container'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'

import BSafesStyle from '../../styles/BSafes.module.css'

import Scripts from "../../components/scripts";
import ContentPageLayout from '../../components/layouts/contentPageLayout';
import TopControlPanel from "../../components/topControlPanel";
import ItemTopRows from "../../components/itemTopRows";
import Editor from "../../components/editor";
import PageCommonControls from "../../components/pageCommonControls";

import { initContainer, initWorkspace } from "../../reduxStore/containerSlice";
import { initPage, getPageItemThunk, decryptPageItemThunk } from "../../reduxStore/pageSlice";
import { debugLog } from "../../lib/helper";

export default function Notebook() {
    const debugOn = true;
    debugLog(debugOn, "Rendering item");
    const dispatch = useDispatch();
    const router = useRouter();

    const [pageItemId, setPageItemId] = useState(null); 

    const {itemId} = router.query;
    if(itemId && !pageItemId) {
        setPageItemId(itemId);
    }

    const searchKey = useSelector( state => state.auth.searchKey);
    const searchIV = useSelector( state => state.auth.searchIV);
    const expandedKey = useSelector( state => state.auth.expandedKey );

    const space = useSelector( state => state.page.space);
    const workspaceKey = useSelector( state => state.container.workspaceKey);

    const activity = useSelector( state => state.page.activity);
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
                dispatch(saveTitleThunk(content, searchKey, searchIV));
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

    useEffect(()=>{
        dispatch(initPage());
        dispatch(initContainer());
    }, []);

    useEffect(()=>{
        if(pageItemId) {
            dispatch(getPageItemThunk({itemId}));
        }
    }, [pageItemId]);

    useEffect(()=>{
        if(space) {
            if (space.substring(0, 1) === 'u') {
                dispatch(initWorkspace({space, workspaceKey: expandedKey, searchKey, searchIV }));
	        } else {
            }
        }
    }, [space]);

    useEffect(()=>{
        if(workspaceKey) {
            dispatch(decryptPageItemThunk({workspaceKey}));
        }
    }, [workspaceKey]);

    return (
        <div className={BSafesStyle.pageBackground}>
            <ContentPageLayout>            
                <Container> 
                    <br />
                    <TopControlPanel></TopControlPanel>
                    <br />
                    <div className={`${BSafesStyle.notebookPanel} ${BSafesStyle.notebookCoverPanel} ${BSafesStyle.containerCoverPanel} ${BSafesStyle.containerPanel}`}>
                        <ItemTopRows />
                        <br />
                        <br />
                        <Row className="justify-content-center">
                            <Col className={BSafesStyle.containerTitleLabel} xs="12" sm="10" md="8" >
                                <Editor editorId="title" mode={titleEditorMode} content={titleEditorContent} onContentChanged={handleContentChanged} onPenClicked={handlePenClicked} editable={!editingEditorId && (activity === "Done")} />
                            </Col> 
                        </Row>
                    </div>
                    <PageCommonControls isEditing={editingEditorId} onWrite={handleWrite} onSave={handleSave} onCancel={handleCancel}/>
                </Container>           
            </ContentPageLayout>
            <Scripts />
        </div>
        
    )
}
