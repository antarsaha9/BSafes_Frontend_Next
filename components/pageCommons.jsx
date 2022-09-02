import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from 'react-redux'

import Container from 'react-bootstrap/Container'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Button from 'react-bootstrap/Button'

import Scripts from './scripts'
import Editor from './editor';
import PageCommonControls from "./pageCommonControls";

import { debugLog } from '../lib/helper';

export default function PageCommons() {
    const debugOn = true;

    const [titleEditorMode, setTitleEditorMode] = useState("ReadOnly");
    const titleEditorContent = useSelector(state => state.page.title);

    const [mainEditorMode, setMainEditorMode] = useState("ReadOnly");
    const [mainEditorContent, setMainEditorContent] = useState("Hello World");
  
    const [editingEditorId, setEditingEditorId] = useState("");

    const handlePenClicked = (editorId) => {
        debugLog(debugOn, `pen ${editorId} clicked`);
        if(editorId === 'main'){
            setMainEditorMode("Writing");
            setEditingEditorId("main");
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
        
        setTimeout(()=>{
          if(editingEditorId === "main") {
            setMainEditorContent(content);
            setMainEditorMode("ReadOnly");
            setEditingEditorId("");
          } else if(editingEditorId === "title") {
            setTitleEditorContent(content);
            setTitleEditorMode("ReadOnly");
            setEditingEditorId("");
          } else {
            const editorsCopy = [...imageTextEditors];
            let thisEditor = editorsCopy.find((item) => item.editorId === editingEditorId);
            thisEditor.editorContent = content;
            thisEditor.editorMode = "ReadOnly";
            setEditingEditorId("");
            setImageTextEditors(editorsCopy);
          }     
        },1000)
    }

    const handleWrite = () =>{
        debugLog(debugOn, "handleWrite");
        setMainEditorMode("Writing");
        setEditingEditorId("main");
    }

    const setEditingEditorMode = (mode) => {
        switch(editingEditorId) {
            case 'main':
                setMainEditorMode(mode);
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
        setEditingEditorId("");
    }

    return (
        <>
            <Row className="justify-content-center">
                <Col xs="12" sm="10" md="8" >
                    <Editor editorId="title" mode={titleEditorMode} content={titleEditorContent} onContentChanged={handleContentChanged} onPenClicked={handlePenClicked} editable={editingEditorId===""} />
                </Col> 
            </Row>
            <Row className="justify-content-center">
                <Col sm="10" md="8">
                    <hr />
                </Col>
            </Row>
            <Row className="justify-content-center">
                <Col xs="12" sm="10" md="8" >
                    <Editor editorId="main" mode={mainEditorMode} content={mainEditorContent} onContentChanged={handleContentChanged} onPenClicked={handlePenClicked} editable={editingEditorId===""} />
                </Col> 
            </Row>
            <PageCommonControls isEditing={editingEditorId!==""} onWrite={handleWrite} onSave={handleSave} onCancel={handleCancel}/>
            <Scripts />
        </>
    )
}