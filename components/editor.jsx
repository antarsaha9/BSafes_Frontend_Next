import { useEffect, useRef, useState } from "react";

import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Button from 'react-bootstrap/Button';

import jquery from "jquery"

import { debugLog } from "../lib/helper";

export default function Editor({editorId, mode, content, onContentChanged, onPenClicked, showPen=true, editable=true}) {
    const debugOn = true;    
    const editorRef = useRef(null);

    const [ editorOn, setEditorOn ] = useState(false);

    debugLog(debugOn, "Rendering editor, id,  mode: ", `${editorId} ${mode}`);
    
    const writing = () => {
        if(editorOn) return;
        $(editorRef.current).froalaEditor();
        if(!editorOn){
            debugLog(debugOn, "setEditorOn")
            setEditorOn(true);
        }
    }

    const saving = () => {
        let content = $(editorRef.current).froalaEditor('html.get');
        debugLog(debugOn, "editor content: ", content );
        setTimeout(()=> {
            onContentChanged(editorId, content);
        }, 0) 
    }

    const readOnly = () => {
        if(editorOn) {        
            $(editorRef.current).froalaEditor('destroy');
            $(editorRef.current).html(content);
            setEditorOn(false);  
        }
    }

    useEffect(()=> {
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
    }, [mode])
 

    useEffect(() => {
        window.$ = window.jQuery = jquery;``
    },[]);

    const handlePenClicked = () => {
        onPenClicked(editorId);
    }

    return (
        <>
            {  (showPen)&&(editable)?
                
                <Row>
                    <Col>
                        <Button variant="link" className="text-dark pull-right" onClick={handlePenClicked}><i className="fa fa-pencil" aria-hidden="true"></i></Button>
                    </Col>
                </Row>
                
                :<></>
            }
            <Row>
                <div ref={editorRef} dangerouslySetInnerHTML={{__html: content}}>
                </div>
            </Row>
        </>
    );
}
