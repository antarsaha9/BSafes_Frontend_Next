import { useEffect, useRef, useState } from "react";
import { useSelector } from 'react-redux'

import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Button from 'react-bootstrap/Button';

import jquery from "jquery"

const axios = require('axios');
const forge = require('node-forge');

import BSafesStyle from '../styles/BSafes.module.css'

import { debugLog, PostCall, convertUint8ArrayToBinaryString } from "../lib/helper";
import { encryptBinaryString, encryptLargeBinaryString } from "../lib/crypto";
import { rotateImage } from '../lib/wnImage';

export default function Editor({editorId, mode, content, onContentChanged, onPenClicked, showPen=true, editable=true}) {
    const debugOn = false;    
    const editorRef = useRef(null);
    const froalaKey = process.env.NEXT_PUBLIC_FROALA_KEY;

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
        window.bsafesFroala.bSafesPreflight = bSafesPreflightHook;
        window.bsafesFroala.rotateImage = rotateImageHook;
        window.bsafesFroala.convertUint8ArrayToBinaryString = convertUint8ArrayToBinaryString;
        window.bsafesFroala.encryptBinaryString = encryptBinaryStringHook;
        window.bsafesFroala.encryptLargeBinaryString = encryptLargeBinaryStringHook;
        window.bsafesFroala.preS3Upload = preS3UploadHook;
        window.bsafesFroala.postS3Upload = postS3UploadHook;
        window.bsafesFroala.uploadData = uploadDataHook;
    }, [scriptsLoaded])

    const handlePenClicked = () => {
        onPenClicked(editorId);
    }

    const bSafesPreflightHook = (fn) => {
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

    const rotateImageHook = async (link, exifOrientation, callback) => {
        try {
            const result = await rotateImage(link, exifOrientation);
            debugLog(debugOn, 'Rotation done');
            callback(null, result.blob, result.byteString);
            
        } catch(error) {
            debugLog(debugOn, 'rotateImage error:', error)
            callback(error);
        }
    }

    const encryptBinaryStringHook = (binaryString, key) => {
        return encryptBinaryString(binaryString, key);
    }

    const encryptLargeBinaryStringHook = (binaryString, key) => {
        return encryptLargeBinaryString(binaryString, key);
    }

    const preS3UploadHook = () => {
        return new Promise( async (resolve, reject) => {
            PostCall({
                api:'/memberAPI/preS3Upload',
            }).then( data => {
                debugLog(debugOn, data);
                if(data.status === 'ok') {  
                    const s3Key = data.s3Key;
                    const signedURL = data.signedURL;
                    const signedGalleryURL = data.signedGalleryURL;
                    const signedThumbnailURL = data.signedThumbnailURL;                                 
                    resolve({status:"ok", s3Key, signedURL, signedGalleryURL, signedThumbnailURL});
                } else {
                    debugLog(debugOn, "preS3Upload failed: ", data.error);
                    reject({status:"error", error:data.error});
                }
            }).catch( error => {
                debugLog(debugOn, "preS3Upload failed: ", error)
                reject({status:"error", error});
            })
        });
    }

    const postS3UploadHook = (s3Object) => {
        return new Promise( async (resolve, reject) => {
            s3Object.keyEnvelope = forge.util.encode64(s3Object.keyEnvelope);
            PostCall({
                api:'/memberAPI/postS3Upload',
                body: s3Object
            }).then( data => {
                debugLog(debugOn, data);
                if(data.status === 'ok') {                                  
                    resolve({status:"ok"});
                } else {
                    debugLog(debugOn, "postS3Upload failed: ", data.error);
                    reject(data.error);
                }
            }).catch( error => {
                debugLog(debugOn, "postS3Upload failed: ", error)
                reject(error);
            })
        });
    }

    const uploadDataHook = (data, signedURL, onProgress) => {
        return new Promise( async (resolve, reject) => {
            const config = {
                onUploadProgress: async (progressEvent) => {
                    onProgress(progressEvent);
                },
                headers: {
                    'Content-Type': 'binary/octet-stream'
                }
            }
            try {
                const result = await axios.put(signedURL, Buffer.from(data, 'binary'), config);  
                resolve(result);
            } catch (error) {
                reject(error);
            }
        });
    }

    return (
        <>
            {  (showPen)&&(editable)?
                
                <Row>
                    <Col>
                        <Button variant="link" className="text-dark pull-right" onClick={handlePenClicked}><i className="fa fa-pencil" aria-hidden="true"></i></Button>
                    </Col>
                </Row>
                
                :

                <Row>
                    <Col>
                        <Button variant="link" className="text-dark pull-right"></Button>
                    </Col>
                </Row>
            }
            <Row className={`${BSafesStyle.editorRow} fr-element fr-view`}>
                <div ref={editorRef} dangerouslySetInnerHTML={{__html: content}}>
                </div>
            </Row>
        </>
    );
}
