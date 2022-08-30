import React, { useEffect, useState } from "react";
import Container from 'react-bootstrap/Container'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Button from 'react-bootstrap/Button'

import Scripts from './scripts'
import Editor from './editor';

import { debugLog } from '../lib/helper';

export default function PageCommons() {
    const debugOn = true;

    const [titleEditorMode, setTitleEditorMode] = useState("ReadOnly");
    const [titleEditorContent, setTitleEditorContent] = useState("Hello Title");

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
    
    var handleContentChanged = (editorId, content) => {
        debugLog(debugOn, `editor-id: ${editorId} content: ${content}`);
        
        setTimeout(()=>{
          if(editingEditorId === "main") {
            setMainEditorContent(content);
            setMainEditorMode("ReadOnly");
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
            <Scripts />
        </>
    )
}