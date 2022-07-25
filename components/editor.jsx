import { useEffect, useRef, useState } from "react";
import { Button } from 'react-bootstrap';

import jquery from "jquery"

import { debugLog } from "../lib/helper";
import { read } from "fs";

export default function Editor({editorId, mode, content, onContentChanged, onPenClicked}) {
    const debugOn = true;    
    const editorRef = useRef(null);

    const [ editorOn, setEditorOn ] = useState(false);

    debugLog(debugOn, "Rendering editor, mode: ", mode);
    
    const writing = () => {
        $(editorRef.current).froalaEditor();
        if(!editorOn){
            debugLog(debugOn, "setEditorOn")
            setEditorOn(true);
        }
    }

    const saving = () => {
        let content = $(editorRef.current).froalaEditor('html.get');
        debugLog(debugOn, "editor content: ", content );
        onContentChanged(editorId, content);
    }

    const readOnly = () => {
        if(editorOn) {        
            $(editorRef.current).froalaEditor('destroy');
            $(editorRef.current).html(content);
            setEditorOn(false);           
        }
    }

    switch (mode) {
        case "ReadOnly":
            readOnly();
            break;
        case "Writing":
            writing();
            break;
        case "Saving":
            saving();
            break;
        default:
    }

    useEffect(() => {
        window.$ = window.jQuery = jquery;``
    },[]);

    const handlePenClicked = () => {
        onPenClicked(editorId);
    }

    return (
        <div>
            <Button variant="outline-dark" onClick={handlePenClicked}>P</Button>
            <div ref={editorRef} dangerouslySetInnerHTML={{__html: content}}>
                
            </div>
        </div>
    );
}