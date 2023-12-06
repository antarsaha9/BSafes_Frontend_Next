import { useEffect, useRef, useState } from "react";
import { useSelector, useDispatch } from 'react-redux'

import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Button from 'react-bootstrap/Button';
import ButtonGroup from 'react-bootstrap/ButtonGroup';

import jquery from "jquery"

const axios = require('axios');
const forge = require('node-forge');

import BSafesStyle from '../styles/BSafes.module.css'

import { getEditorConfig } from "../lib/bSafesCommonUI";
import { debugLog, PostCall, convertUint8ArrayToBinaryString, getBrowserInfo, arraryBufferToStr} from "../lib/helper";
import { compareArraryBufferAndUnit8Array, encryptBinaryString, encryptLargeBinaryString, encryptChunkBinaryStringToBinaryStringAsync } from "../lib/crypto";
import { rotateImage } from '../lib/wnImage';


export default function Editor({editorId, mode, content, onContentChanged, onPenClicked, showPen=true, editable=true, hideIfEmpty=false, writingModeReady=null, readOnlyModeReady=null, onDraftSampled=null , onDraftClicked=null, onDraftDelete=null}) {
    const debugOn = true;    
    const dispatch = useDispatch();

    const editorRef = useRef(null);
    const [draftInterval, setDraftInterval] = useState(null);
    const [intervalState, setIntervalState] = useState(null);
    const expandedKey = useSelector( state => state.auth.expandedKey);
    const froalaKey = useSelector( state => state.auth.froalaLicenseKey);
    const itemId = useSelector( state => state.page.id);
    const itemKey = useSelector( state => state.page.itemKey);
    const itemIV = useSelector( state => state.page.itemIV);
    const draft = useSelector( state=>state.page.draft);

    debugLog(debugOn, `editor key: ${froalaKey}`);
   
    const [ editorOn, setEditorOn ] = useState(false);
    const [ scriptsLoaded, setScriptsLoaded ] = useState(false);
    const [ originalContent, setOriginalContent] = useState(null);

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
                $(editorRef.current).html(content);
                froalaOptions = {
                    key: froalaKey,
                    toolbarButtons: ['fullscreen', 'bold', 'italic', 'underline', 'strikeThrough', 'subscript', 'superscript', 'fontFamily', 'fontSize', 'lineHeight', '|', 'color', 'emoticons', 'paragraphStyle', '|', 'paragraphFormat', 'align', 'formatOL', 'formatUL', 'outdent', 'indent', 'quote', 'insertHR', '-', 'insertLink', 'insertImage', 'insertVideo', 'insertTable', 'undo', 'redo', 'clearFormatting'/*, 'html'*/],
                    toolbarButtonsMD: ['fullscreen', 'bold', 'italic', 'underline', 'strikeThrough', 'subscript', 'superscript', 'fontFamily', 'fontSize', 'lineHeight', '|', 'color', 'emoticons', 'paragraphStyle', '|', 'paragraphFormat', 'align', 'formatOL', 'formatUL', 'outdent', 'indent', 'quote', 'insertHR', '-', 'insertLink', 'insertImage', 'insertVideo', 'insertTable', 'undo', 'redo', 'clearFormatting'/*, 'html'*/],
                    toolbarButtonsSM: ['fullscreen', 'bold', 'italic', 'underline', 'strikeThrough', 'subscript', 'superscript', 'fontFamily', 'fontSize', 'lineHeight', '|', 'color', 'emoticons', 'paragraphStyle', '|', 'paragraphFormat', 'align', 'formatOL', 'formatUL', 'outdent', 'indent', 'quote', 'insertHR', '-', 'insertLink', 'insertImage', 'insertVideo', 'insertTable', 'undo', 'redo', 'clearFormatting'/*, 'html'*/],
                    toolbarButtonsXS: [ 'bold', 'italic', 'color', 'emoticons', 'paragraphFormat', 'align', 'formatOL', 'formatUL', 'insertLink', 'insertImage', 'insertVideo', 'insertTable', 'undo', 'redo'],
                    //toolbarButtonsXS: ['bold', 'fontSize', 'color', 'paragraphStyle', 'paragraphFormat', 'align', 'formatOL', 'formatUL', 'insertLink', 'insertImage', 'insertVideo', 'undo'],
                    fontFamily: {
                        'Arial,Helvetica,sans-serif': 'Arial',
                        'Georgia,serif': 'Georgia', 'Impact,Charcoal,sans-serif': 'Impact',
                        'Tahoma,Geneva,sans-serif': 'Tahoma',
                        "'Times New Roman',Times,serif": 'Times New Roman',
                        'Verdana,Geneva,sans-serif': 'Verdana',
                        "Open Sans, serif": 'Open Sans',
                        "La Belle Aurore": 'La Belle Aurore',
                        "Cormorant Garamond": 'Cormorant Garamond',
                        "Roboto,sans-serif": 'Roboto',
                        "Oswald,sans-serif": 'Oswald',
                        "Montserrat,sans-serif": 'Montserrat',
                        "'Open Sans Condensed',sans-serif": 'Open Sans Condensed'
                    },
                    fontFamilySelection: false
                };
                break;
            default:
                froalaOptions = {
                    key: froalaKey,
                    /*
                    toolbarButtons: ['fullscreen', 'bold', 'italic', 'underline', 'strikeThrough', 'subscript', 'superscript', 'fontFamily', 'fontSize', '|', 'color', 'emoticons', 'paragraphStyle', '|', 'paragraphFormat', 'align', 'formatOL', 'formatUL', 'outdent', 'indent', 'quote', 'insertHR', '-', 'insertLink', 'insertImage', 'insertVideo', 'insertFile', 'insertTable', 'undo', 'redo', 'clearFormatting', 'html'],
                    toolbarButtonsMD: ['fullscreen', 'bold', 'italic', 'underline', 'strikeThrough', 'subscript', 'superscript', 'fontFamily', 'fontSize', '|', 'color', 'emoticons', 'paragraphStyle', '|', 'paragraphFormat', 'align', 'formatOL', 'formatUL', 'outdent', 'indent', 'quote', 'insertHR', '-', 'insertLink', 'insertImage', 'insertVideo', 'insertTable', 'undo', 'redo', 'clearFormatting', 'html'],
                    toolbarButtonsSM: ['fullscreen', 'bold', 'italic', 'underline', 'strikeThrough', 'subscript', 'superscript', 'fontFamily', 'fontSize', '|', 'color', 'emoticons', 'paragraphStyle', '|', 'paragraphFormat', 'align', 'formatOL', 'formatUL', 'outdent', 'indent', 'quote', 'insertHR', '-', 'insertLink', 'insertImage', 'insertVideo', 'insertTable', 'undo', 'redo', 'clearFormatting', 'html'],
                    toolbarButtonsXS: ['bold', 'fontSize', 'color', 'paragraphStyle', 'paragraphFormat', 'align', 'formatOL', 'formatUL', 'insertLink', 'insertImage', 'insertVideo', 'undo']
                    */
                    toolbarButtons: [ 'bold', 'italic', 'underline', 'strikeThrough',  'undo', 'redo'],
                    toolbarButtonsMD: [ 'bold', 'italic', 'underline', 'strikeThrough',  'undo', 'redo'],
                    toolbarButtonsSM: [ 'bold', 'italic', 'underline', 'strikeThrough',  'undo', 'redo'],
                    toolbarButtonsXS: [ 'bold', 'italic', 'underline', 'strikeThrough',  'undo', 'redo']
                };

        }
        
        $(editorRef.current).froalaEditor(froalaOptions);
        if(editorId === 'content'){
            const contentSample = $(editorRef.current).froalaEditor('html.get');
            setOriginalContent(contentSample);
        }
          
        editorRef.current.style.overflowX = null;
        if(!editorOn){
            debugLog(debugOn, "setEditorOn")
            setEditorOn(true);
        }
        if(writingModeReady) writingModeReady();
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
            editorRef.current.style.overflowX = 'auto';
            if(draftInterval){
                clearInterval(draftInterval);
                setDraftInterval(null);
                setIntervalState(null);
            }
            setOriginalContent(null);
            setEditorOn(false);  
            if(readOnlyModeReady) readOnlyModeReady();
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

        import('../lib/importScripts').then(async ic=>{
            await ic.Froala;
            await ic.FroalaPlugins;
            await ic.Codemirror;
            await ic.Photoswipe;
            await ic.Others;

            setScriptsLoaded(true);

        });
    },[]);

    useEffect(()=>{
        if(!(scriptsLoaded && window)) return;

        debugLog(debugOn, `bsafesFroala: ${window.bsafesFroala.name}`)
        window.bsafesFroala.bSafesPreflight = bSafesPreflightHook;
        window.bsafesFroala.rotateImage = rotateImageHook;
        window.bsafesFroala.convertUint8ArrayToBinaryString = convertUint8ArrayToBinaryString;
        window.bsafesFroala.compareArraryBufferAndUnit8Array = compareArraryBufferAndUnit8ArrayHook;
        window.bsafesFroala.encryptBinaryString = encryptBinaryStringHook;
        window.bsafesFroala.encryptLargeBinaryString = encryptLargeBinaryStringHook;
        window.bsafesFroala.encryptChunkBinaryStringToBinaryStringAsync = encryptChunkBinaryStringToBinaryStringAsyncHook;
        window.bsafesFroala.preS3Upload = preS3UploadHook;
        window.bsafesFroala.preS3ChunkUpload = preS3ChunkUploadHook;
        window.bsafesFroala.postS3Upload = postS3UploadHook;
        window.bsafesFroala.uploadData = uploadDataHook;
        window.bsafesFroala.getBrowserInfo = getBrowserInfoHook;
        window.bsafesFroala.arraryBufferToStr = arraryBufferToStrHook;
        window.bsafesFroala.getEditorConfig = getEditorConfigHook;
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [scriptsLoaded])

    useEffect(()=> {
        if( originalContent !== null){
            if(editorId === 'content'){
                setIntervalState('Start');
            }
        }
    }, [originalContent])

    useEffect(()=> {
        let content;
        debugLog(debugOn, 'interval state:', intervalState);
        switch(intervalState) {
            case 'Start': 
                const interval = setInterval(()=>{
                    debugLog(debugOn, "Saving draft ...");
                    content = $(editorRef.current).froalaEditor('html.get');
                    //debugLog(debugOn, "editor content: ", content );
                    if(content !== originalContent) {
                        debugLog(debugOn, 'Content changed');
                        onDraftSampled(content);
                        setOriginalContent(content);
                        setIntervalState('Stop');
                    }  
                }, 1000);
                setDraftInterval(interval);
                break;
            case 'Stop':
                clearInterval(draftInterval);
                setDraftInterval(null);
                break;
            default:
        }
    }, [intervalState])

    const handlePenClicked = () => {
        onPenClicked(editorId);
    }

    const bSafesPreflightHook = (fn) => {
        debugLog(debugOn, "bSafesPreflight");
        PostCall({
            api:'/memberAPI/preflight',
            dispatch
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

    const compareArraryBufferAndUnit8ArrayHook = (thisBuffer, thisArray) => {
        return compareArraryBufferAndUnit8Array(thisBuffer, thisArray);
    }

    const encryptBinaryStringHook = (binaryString, key) => {
        return encryptBinaryString(binaryString, key);
    }

    const encryptLargeBinaryStringHook = (binaryString, key) => {
        return encryptLargeBinaryString(binaryString, key);
    }

    const encryptChunkBinaryStringToBinaryStringAsyncHook = (arrayBuffer, key) => {
        return encryptChunkBinaryStringToBinaryStringAsync(arrayBuffer, key);
    }

    const preS3UploadHook = () => {
        return new Promise( async (resolve, reject) => {
            PostCall({
                api:'/memberAPI/preS3Upload',
                dispatch
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

    const preS3ChunkUploadHook = (itemId, chunkIndex, timeStamp) => {
        return new Promise((resolve, reject) => {
            let s3Key, s3KeyPrefix, signedURL;
            PostCall({
              api:'/memberAPI/preS3ChunkUpload',
              body: {
                  itemId,
                  chunkIndex: chunkIndex.toString(),
                  timeStamp: timeStamp
              },
              dispatch
            }).then( data => {
              debugLog(debugOn, data);
              if(data.status === 'ok') {   
                  s3Key = data.s3Key;                        
                  s3KeyPrefix = s3Key.split('_chunk_')[0];
                  signedURL = data.signedURL;
                  resolve({s3Key, s3KeyPrefix, signedURL});
              } else {
                  debugLog(debugOn, "preS3ChunkUpload failed: ", data.error);
                  reject(data.error);
              }
            }).catch( error => {
              debugLog(debugOn, "preS3ChunkUpload failed: ", error)
              reject(error);
            })
        });;
    }

    const postS3UploadHook = (s3Object) => {
        return new Promise( async (resolve, reject) => {
            s3Object.keyEnvelope = forge.util.encode64(s3Object.keyEnvelope);
            PostCall({
                api:'/memberAPI/postS3Upload',
                body: s3Object,
                dispatch
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

    const getBrowserInfoHook = () => {
        return getBrowserInfo();
    }

    const arraryBufferToStrHook = (arrayBuffer) => {
        return arraryBufferToStr(arrayBuffer);
    }

    const getEditorConfigHook = () => {
        return getEditorConfig();
    }
    return (
        <>
        {scriptsLoaded?
            <>
            {  (showPen)&&(editable)?
                
                <Row>
                    <Col xs={6}>
                        {(editorId==='title' && content==='<h2></h2>') &&<h6 className='m-0 text-secondary'>Title</h6>}
                        {(editorId==='content' && content === null) &&<h6 className='m-0 text-secondary'>Content</h6>}
                    </Col>
                    <Col xs={6}>
                        <Button variant="link" className="text-dark pull-right p-0" onClick={handlePenClicked}><i className="fa fa-pencil" aria-hidden="true"></i></Button>
                        {(editorId==='content' && draft !== null) &&
                            <ButtonGroup className='pull-right mx-3' size="sm">
                                <Button variant="outline-danger" className='m-0' onClick={onDraftClicked}>Draft</Button>
                                <Button variant="danger" onClick={onDraftDelete}>X</Button>
                            </ButtonGroup>
                        }
                    </Col>
                </Row>
                :
                ""
                
            }
            { ((mode === 'Writing' || mode === 'Saving') || mode === 'ReadOnly' || !(hideIfEmpty && (!content || content.length === 0))) &&
                <Row className={`${(editorId ==='title')?BSafesStyle.titleEditorRow:BSafesStyle.editorRow} fr-element fr-view`}>
                    <div className="inner-html" ref={editorRef} dangerouslySetInnerHTML={{__html: content}} style={{overflowX:'auto'}}>
                    </div>
                </Row>
            }
            </>:""
        }
        </>
    );
}
