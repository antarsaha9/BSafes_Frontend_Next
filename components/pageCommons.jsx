import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from 'react-redux'

import Container from 'react-bootstrap/Container'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Button from 'react-bootstrap/Button'

import Scripts from './scripts'
import Editor from './editor';
import PageCommonControls from "./pageCommonControls";

import { saveContentThunk, saveTitleThunk } from "../reduxStore/pageSlice";
import { debugLog, updateComponentAfterRender } from '../lib/helper';

export default function PageCommons() {
    const debugOn = true;
    const dispatch = useDispatch();

    const searchKey = useSelector( state => state.auth.searchKey);
    const searchIV = useSelector( state => state.auth.searchIV);

    const activity = useSelector( state => state.page.activity);

    const [titleEditorMode, setTitleEditorMode] = useState("ReadOnly");
    const titleEditorContent = useSelector(state => state.page.title);

    const [contentEditorMode, setContentEditorMode] = useState("ReadOnly");
    const contentEditorContent = useSelector(state => state.page.content);
  
    const [editingEditorId, setEditingEditorId] = useState(null);

    const handlePenClicked = (editorId) => {
        debugLog(debugOn, `pen ${editorId} clicked`);
        if(editorId === 'content'){
            setContentEditorMode("Writing");
            setEditingEditorId("content");
        } else if(editorId === 'title') {
            setTitleEditorMode("Writing");
            setEditingEditorId("title");
        } else {
            const editorsCopy = [...imageTextEditors];
            let thisEditor = editorsCopy.find((item) => item.editorId === editorId);
            thisEditor.editorMode = "Writing";
            setImageTextEditors(editorsCopy);
            setEditingEditorId(editorId);
        }
    }
    
    const handleContentChanged = (editorId, content) => {
        debugLog(debugOn, `editor-id: ${editorId} content: ${content}`);
        
        if(editingEditorId === "content") {
            if(content !== contentEditorContent) {
                updateComponentAfterRender(()=> {
                    dispatch(saveContentThunk(content));
                });
            } else {
                updateComponentAfterRender(()=> {
                    setEditingEditorMode("ReadOnly");
                    setEditingEditorId(null);
                });
            }
        } else if(editingEditorId === "title") {
            if(content !== titleEditorContent) {
                updateComponentAfterRender(()=> {
                    dispatch(saveTitleThunk(content, searchKey, searchIV));
                });
            } else {
                updateComponentAfterRender(()=> {
                    setEditingEditorMode("ReadOnly");
                    setEditingEditorId(null);
                });
            }
        } else {
            const editorsCopy = [...imageTextEditors];
            let thisEditor = editorsCopy.find((item) => item.editorId === editingEditorId);
            thisEditor.editorContent = content;
            thisEditor.editorMode = "ReadOnly";
            setEditingEditorId("");
            setImageTextEditors(editorsCopy);
        }     
    }

    const handleWrite = () =>{
        debugLog(debugOn, "handleWrite");
        setContentEditorMode("Writing");
        setEditingEditorId("content");
    }

    const setEditingEditorMode = (mode) => {
        switch(editingEditorId) {
            case 'content':
                setContentEditorMode(mode);
                break;
            case 'title':
                setTitleEditorMode(mode);
                break;
            default:
        }
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

    return (
        <>
            <Row className="justify-content-center">
                <Col xs="12" sm="10" md="8" >
                    <Editor editorId="title" mode={titleEditorMode} content={titleEditorContent} onContentChanged={handleContentChanged} onPenClicked={handlePenClicked} editable={!editingEditorId} />
                </Col> 
            </Row>
            <Row className="justify-content-center">
                <Col sm="10" md="8">
                    <hr />
                </Col>
            </Row>
            <Row className="justify-content-center">
                <Col xs="12" sm="10" md="8" >
                    <Editor editorId="content" mode={contentEditorMode} content={contentEditorContent} onContentChanged={handleContentChanged} onPenClicked={handlePenClicked} editable={!editingEditorId} />
                </Col> 
            </Row>
            <PageCommonControls isEditing={editingEditorId} onWrite={handleWrite} onSave={handleSave} onCancel={handleCancel}/>
            <Scripts />
        </>
    )
}