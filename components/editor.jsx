import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from 'react-redux'

import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Button from 'react-bootstrap/Button';

import jquery from "jquery"

import { debugLog, PostCall } from "../lib/helper";
import { preflightAsyncThunk } from "../reduxStore/auth";

export default function Editor({editorId, mode, content, onContentChanged, onPenClicked, showPen=true, editable=true}) {
    const debugOn = true;    
    const editorRef = useRef(null);
    const froalaKey = process.env.NEXT_PUBLIC_FROALA_KEY;
    const dispatch = useDispatch();

    const scriptsLoaded = useSelector(state => state.scripts.done);

    const expandedKey = useSelector( state => state.auth.expandedKey);
    const itemId = useSelector( state => state.page.id);
    const itemKey = useSelector( state => state.page.itemKey);
    const itemIV = useSelector( state => state.page.itemIV);

    debugLog(debugOn, `editor key: ${froalaKey}`);
    

    const [ editorOn, setEditorOn ] = useState(false);

    debugLog(debugOn, "Rendering editor, id,  mode: ", `${editorId} ${mode}`);
    
    const writing = () => {
        if(!scriptsLoaded) return;
        if(editorOn) return;
        let froalaOptions;
        switch(editorId) {
            case 'title':
                froalaOptions = {
                    key: froalaKey,
                    toolbarButtons: ['undo', 'redo'],
                    toolbarButtonsMD: ['undo', 'redo'],
                    toolbarButtonsSM: ['undo', 'redo'],
                    toolbarButtonsXS: ['undo', 'redo'],
                    placeholderText: "Page Title"
                  }
                break;
            case 'content':
                froalaOptions = {
                    key: froalaKey,
                    toolbarButtons: ['fullscreen', 'bold', 'italic', 'underline', 'strikeThrough', 'subscript', 'superscript', 'fontFamily', 'fontSize', '|', 'color', 'emoticons', 'paragraphStyle', '|', 'paragraphFormat', 'align', 'formatOL', 'formatUL', 'outdent', 'indent', 'quote', 'insertHR', '-', 'insertLink', 'insertImage', 'insertVideo', 'insertFile', 'insertTable', 'undo', 'redo', 'clearFormatting', 'html'],
                    toolbarButtonsMD: ['fullscreen', 'bold', 'italic', 'underline', 'strikeThrough', 'subscript', 'superscript', 'fontFamily', 'fontSize', '|', 'color', 'emoticons', 'paragraphStyle', '|', 'paragraphFormat', 'align', 'formatOL', 'formatUL', 'outdent', 'indent', 'quote', 'insertHR', '-', 'insertLink', 'insertImage', 'insertVideo', 'insertTable', 'undo', 'redo', 'clearFormatting', 'html'],
                    toolbarButtonsSM: ['fullscreen', 'bold', 'italic', 'underline', 'strikeThrough', 'subscript', 'superscript', 'fontFamily', 'fontSize', '|', 'color', 'emoticons', 'paragraphStyle', '|', 'paragraphFormat', 'align', 'formatOL', 'formatUL', 'outdent', 'indent', 'quote', 'insertHR', '-', 'insertLink', 'insertImage', 'insertVideo', 'insertTable', 'undo', 'redo', 'clearFormatting', 'html'],
                    toolbarButtonsXS: ['bold', 'fontSize', 'color', 'paragraphStyle', 'paragraphFormat', 'align', 'formatOL', 'formatUL', 'insertLink', 'insertImage', 'insertVideo', 'undo']
                };
                break;
            default:
                froalaOptions = {
                    key: froalaKey,
                    toolbarButtons: ['fullscreen', 'bold', 'italic', 'underline', 'strikeThrough', 'subscript', 'superscript', 'fontFamily', 'fontSize', '|', 'color', 'emoticons', 'paragraphStyle', '|', 'paragraphFormat', 'align', 'formatOL', 'formatUL', 'outdent', 'indent', 'quote', 'insertHR', '-', 'insertLink', 'insertImage', 'insertVideo', 'insertFile', 'insertTable', 'undo', 'redo', 'clearFormatting', 'html'],
                    toolbarButtonsMD: ['fullscreen', 'bold', 'italic', 'underline', 'strikeThrough', 'subscript', 'superscript', 'fontFamily', 'fontSize', '|', 'color', 'emoticons', 'paragraphStyle', '|', 'paragraphFormat', 'align', 'formatOL', 'formatUL', 'outdent', 'indent', 'quote', 'insertHR', '-', 'insertLink', 'insertImage', 'insertVideo', 'insertTable', 'undo', 'redo', 'clearFormatting', 'html'],
                    toolbarButtonsSM: ['fullscreen', 'bold', 'italic', 'underline', 'strikeThrough', 'subscript', 'superscript', 'fontFamily', 'fontSize', '|', 'color', 'emoticons', 'paragraphStyle', '|', 'paragraphFormat', 'align', 'formatOL', 'formatUL', 'outdent', 'indent', 'quote', 'insertHR', '-', 'insertLink', 'insertImage', 'insertVideo', 'insertTable', 'undo', 'redo', 'clearFormatting', 'html'],
                    toolbarButtonsXS: ['bold', 'fontSize', 'color', 'paragraphStyle', 'paragraphFormat', 'align', 'formatOL', 'formatUL', 'insertLink', 'insertImage', 'insertVideo', 'undo']
                };

        }
        $(editorRef.current).froalaEditor(froalaOptions);
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
 
    useEffect(()=>{
        if(itemId && itemKey) {
            $('.container').data('itemId', itemId);
	        $('.container').data('itemKey', itemKey);
	        $('.container').data('itemIV', itemIV);
        }
    }, [itemId, itemKey, itemIV]);

    useEffect(() => {
        window.$ = window.jQuery = jquery;``
    },[]);

    useEffect(()=>{
        if(!(scriptsLoaded && window)) return;
        debugLog(debugOn, `bsafesFroala: ${window.bsafesFroala.name}`)
        window.bsafesFroala.bSafesPreflight = bSafesPreflight;
    }, [scriptsLoaded])

    const handlePenClicked = () => {
        onPenClicked(editorId);
    }

    const bSafesPreflight = (fn) => {
        debugLog(debugOn, "bSafesPreflight");
        PostCall({
            api:'/memberAPI/preflight'
        }).then( data => {
            debugLog(debugOn, data);
            if(data.status === 'ok') {
                debugLog(debugOn, "bSafesPreflight ok: ");
                fn( null, expandedKey);
            } else {
                debugLog(debugOn, "woo... bSafesPreflight failed: ", data.error);
                fn(data.error);
            } 
        }).catch( error => {
            debugLog(debugOn, "woo... bSafesPreflight failed.")
            fn(error);
        })
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
