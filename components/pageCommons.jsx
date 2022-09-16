import React, { useEffect, useRef, useState } from "react";
import { useSelector, useDispatch } from 'react-redux'

import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Button from 'react-bootstrap/Button'

import Scripts from './scripts'
import Editor from './editor';
import PageCommonControls from "./pageCommonControls";

import BSafesStyle from '../styles/BSafes.module.css'
import { saveContentThunk, saveTitleThunk, uploadImagesThunk } from "../reduxStore/pageSlice";
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

    const imageFilesInputRef = useRef(null);
    const [imagesDragActive, setImagesDragActive] = useState(false);

    const attachmentsInputRef = useRef(null);
    const [attachmentsDragActive, setAttachmentsDragActive] = useState(false);

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

    const handleImageButton = (e) => {
        debugLog(debugOn, "handleImageBtn");
        e.preventDefault();
        imageFilesInputRef.current?.click();
    };
    
    const uploadImages = (files, where) => {
        dispatch(uploadImagesThunk({files, where}));
    };

    const handleImageFiles = (e) => {
        e.preventDefault();
        debugLog(debugOn, "handleImageFiles: ", e.target.id);
        const files = e.target.files;
	    if (files.length) {
            uploadImages(files, 'top');
        }
    }

    const handleAttachments = (e) => {
        e.preventDefault();
        debugLog(debugOn, "handleAttachments: ", e.target.id);
    }

    const setDragActive = (e, active) => {
        if(e.target.id === "images") {
            setImagesDragActive(active);
        } else {
            setAttachmentsDragActive(active);
        }
    }

    const handleDrag = (e) => {
        debugLog(debugOn, "handleDrag");
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {      
            setDragActive(e, true);
        } else if (e.type === "dragleave") {
            setDragActive(e, false);
        }
    }

    const handleDrop = function(e) {
        debugLog(debugOn, "handleDrop");
        e.preventDefault();
        e.stopPropagation();
        setDragActive(e,false);

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
          // at least one file has been dropped so do something
          // handleFiles(e.dataTransfer.files);
            if(e.target.id === 'images') {
                const imageType = /image.*/;
                const file = e.dataTransfer.files[0];
                if (!file.type.match(imageType)) {
                    debugLog(debugOn, "Not an image.");
                }
            } else {

            }
        }
    };

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
            <div className="images">
                <input ref={imageFilesInputRef} onChange={handleImageFiles} type="file" multiple accept="image/*" className="d-none editControl" id="images" />
                <Row>
                    <Col id="images" onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop} sm={{span:10, offset:1}} md={{span:8, offset:2}} className={`text-center ${imagesDragActive?BSafesStyle.imagesDragDropZoneActive:BSafesStyle.imagesDragDropZone}`}>
                        <Button id="1" onClick={handleImageButton} variant="link" className="text-dark btn btn-labeled">
                            <h4><i id="1" className="fa fa-picture-o fa-lg" aria-hidden="true"></i></h4>              
                        </Button>
                    </Col>
                </Row>	
            </div>
            <div className="attachments">
                <input ref={attachmentsInputRef} onChange={handleAttachments} type="file" multiple className="d-none editControl" id="attachments" />
                <Row>
                    <Col id="attachments" onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop} sm={{span:10, offset:1}} md={{span:8, offset:2}} className={`text-center ${attachmentsDragActive?BSafesStyle.attachmentsDragDropZoneActive:BSafesStyle.attachmentsDragDropZone}`}>
                        <Button id="1" onClick={handleImageButton} variant="link" className="text-dark btn btn-labeled">
                            <h4><i id="1" className="fa fa-paperclip fa-lg" aria-hidden="true"></i></h4>              
                        </Button>
                    </Col>
                </Row>	
            </div>
            <PageCommonControls isEditing={editingEditorId} onWrite={handleWrite} onSave={handleSave} onCancel={handleCancel}/>
            <Scripts />
        </>
    )
}