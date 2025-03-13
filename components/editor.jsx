import { useEffect, useRef, useState } from "react";
import { useSelector, useDispatch } from 'react-redux'

import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Button from 'react-bootstrap/Button';
import ButtonGroup from 'react-bootstrap/ButtonGroup';
import Image from 'react-bootstrap/Image';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Tooltip from 'react-bootstrap/Tooltip';
import Modal from "react-bootstrap/Modal";

import jquery from "jquery"

import BSafesStyle from '../styles/BSafes.module.css'

import { getEditorConfig } from "../lib/bSafesCommonUI";
import { debugLog, PostCall, convertUint8ArrayToBinaryString, getBrowserInfo, arraryBufferToStr } from "../lib/helper";
import { putS3Object } from "../lib/s3Helper";
import { generateNewItemKey, compareArraryBufferAndUnit8Array, encryptBinaryString, encryptLargeBinaryString, encryptChunkBinaryStringToBinaryStringAsync } from "../lib/crypto";
import { rotateImage, downScaleImage } from '../lib/wnImage';

import { newItemKey, putS3ObjectInServiceWorkerDB } from "../reduxStore/pageSlice";

let Excalidraw = null;
export default function Editor({ editorId, mode, content, onContentChanged, onPenClicked, showPen = true, editable = true, hideIfEmpty = false, writingModeReady = null, readOnlyModeReady = null, onDraftSampled = null, onDraftClicked = null, onDraftDelete = null, showDrawIcon = false, showWriteIcon = false }) {
    const debugOn = false;
    const dispatch = useDispatch();

    const editorRef = useRef(null);
    const ExcalidrawRef = useRef(null);
    const [draftInterval, setDraftInterval] = useState(null);
    const [intervalState, setIntervalState] = useState(null);
    const froalaKey = useSelector(state => state.auth.froalaLicenseKey);
    const workspace = useSelector(state => state.container.workspace);
    const itemId = useSelector(state => state.page.id);
    const itemKey = useSelector(state => state.page.itemKey);
    const itemIV = useSelector(state => state.page.itemIV);
    const draft = useSelector(state => state.page.draft);
    const contentType = useSelector(state => state.page.contentType) || 'WritingPage';

    debugLog(debugOn, `editor key: ${froalaKey}`);

    const [editorOn, setEditorOn] = useState(false);
    const [scriptsLoaded, setScriptsLoaded] = useState(false);
    const [originalContent, setOriginalContent] = useState(null);

    debugLog(debugOn, "Rendering editor, id,  mode: ", `${editorId} ${mode}`);

    const writing = () => {
        if (!scriptsLoaded) return;
        if (editorOn) return;
        let froalaOptions;
        switch (editorId) {
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
                if (!itemKey) {
                    const thisItemKey = generateNewItemKey();
                    dispatch(newItemKey({ itemKey: thisItemKey }));
                }
                $(editorRef.current).html(content);
                const fullOptions = ['fullscreen', 'bold', 'italic', 'underline', 'strikeThrough', 'subscript', 'superscript', 'fontFamily', 'fontSize', 'lineHeight', '|', 'color', 'emoticons', 'paragraphStyle', '|', 'paragraphFormat', 'align', 'formatOL', 'formatUL', 'outdent', 'indent', 'quote', 'insertHR', '-', 'insertLink', 'insertImage', 'insertVideo', 'insertTable', 'undo', 'redo', 'clearFormatting'/*, 'html'*/];
                const minimumOptions = ['bold', 'italic', 'color', 'emoticons', 'paragraphFormat', 'fontFamily', 'formatOL', 'formatUL', 'insertLink', 'insertImage', 'insertVideo', 'insertTable', 'undo', 'redo'];

                const isMinimumOption = (window.innerWidth < 480);
                froalaOptions = {
                    key: froalaKey,
                    toolbarButtons: fullOptions,
                    toolbarButtonsMD: fullOptions,
                    toolbarButtonsSM: fullOptions,
                    toolbarButtonsXS: isMinimumOption ? minimumOptions : fullOptions,
                    fontFamily: {
                        'Arial,Helvetica,sans-serif': 'Arial',
                        "'Edu SA Beginner Variable', cursive": 'Edu SA Beginner',
                        'Georgia,serif': 'Georgia',
                        'Impact,Charcoal,sans-serif': 'Impact',
                        "'Montserrat Variable', sans-serif": 'Montserrat',
                        "'Noto Serif Variable', serif": 'Noto Serif',
                        "'Oswald Variable', sans-serif": 'Oswald',
                        "'Roboto Flex Variable', sans-serif": 'Roboto Flex',
                        "'Times New Roman',Times,serif": 'Times New Roman',
                        "'Dancing Script Variable', cursive": 'Dancing Script',
                    },
                    fontFamilySelection: false,
                    tableStyles: {
                        'fr-dashed-borders': 'Dashed Borders',
                        'fr-alternate-rows': 'Alternate Rows',
                        'fr-no-borders': 'No Borders'
                    },
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
                    toolbarButtons: ['bold', 'italic', 'underline', 'strikeThrough', 'undo', 'redo'],
                    toolbarButtonsMD: ['bold', 'italic', 'underline', 'strikeThrough', 'undo', 'redo'],
                    toolbarButtonsSM: ['bold', 'italic', 'underline', 'strikeThrough', 'undo', 'redo'],
                    toolbarButtonsXS: ['bold', 'italic', 'underline', 'strikeThrough', 'undo', 'redo']
                };
        }
        froalaOptions.videoInsertButtons = ['videoBack', '|', 'videoUpload']
        froalaOptions.imageInsertButtons = ['imageBack', '|', 'imageUpload']
        $(editorRef.current).froalaEditor(froalaOptions);
        if (editorId === 'content') {
            const contentSample = $(editorRef.current).froalaEditor('html.get');
            setOriginalContent(contentSample);
        }

        editorRef.current.style.overflowX = null;
        if (!editorOn) {
            debugLog(debugOn, "setEditorOn")
            setEditorOn(true);
        }
        if (writingModeReady) writingModeReady();
    }

    const drawing = () => {
        if (content && content?.metadata?.ExcalidrawSerializedJSON) {
            const savedJSON = JSON.parse(content?.metadata?.ExcalidrawSerializedJSON);
            const res = Excalidraw.restore(savedJSON);
            function restoreExcalidraw(params) {
                if (!ExcalidrawRef.current) {
                    debugLog(debugOn, 'excalidrawApi not defined, rechecking');
                    setTimeout(() => {
                        restoreExcalidraw(params);
                    }, 500);
                } else {
                    ExcalidrawRef.current.updateScene(res);
                    if (res.files)
                        ExcalidrawRef.current.addFiles(Object.values(res.files));
                    //ExcalidrawRef.current.scrollToContent();
                }
            }
            setTimeout(() => {
                restoreExcalidraw(res);
            }, 500);
        }
    }

    const saving = () => {
        if (editorId === "content" && contentType === "DrawingPage") {
            debugLog(debugOn, "Saving drawing page ...");
            if (!ExcalidrawRef.current) {
                return;
            }
            const elements = ExcalidrawRef.current.getSceneElements();
            if (!elements || !elements.length) {
                return;
            }
            Excalidraw.exportToCanvas({
                elements,
                appState: {
                    exportWithDarkMode: false,
                },
                files: ExcalidrawRef.current.getFiles(),
            }).then(canvas => {
                canvas.toBlob(blob => {
                    blob.name = 'excalidraw.png';
                    const serialized = Excalidraw.serializeAsJSON(ExcalidrawRef.current.getSceneElements(), ExcalidrawRef.current.getAppState(), ExcalidrawRef.current.getFiles(), 'local');
                    blob.src = window.URL.createObjectURL(blob);
                    blob.metadata = {
                        ExcalidrawExportedImage: true,
                        ExcalidrawSerializedJSON: serialized
                    };
                    onContentChanged(editorId, blob);
                })
            })
        } else {
            let content = $(editorRef.current).froalaEditor('html.get');
            debugLog(debugOn, "editor content: ", content);
            setTimeout(() => {
                onContentChanged(editorId, content);
            }, 0)
        }
    }

    const readOnly = () => {
        if (editorOn) {
            $(editorRef.current).froalaEditor('destroy');
            $(editorRef.current).html(content);
            editorRef.current.style.overflowX = 'auto';
            if (draftInterval) {
                clearInterval(draftInterval);
                setDraftInterval(null);
                setIntervalState(null);
            }
            setOriginalContent(null);
            setEditorOn(false);
            if (readOnlyModeReady) readOnlyModeReady();
        }
    }

    useEffect(() => {
        switch (mode) {
            case "ReadOnly":
                readOnly();
                break;
            case "Writing":
                if (editorId === 'content' && contentType === "DrawingPage")
                    drawing();
                else
                    writing();
                break;
            case "Saving":
                saving();
                break;
            default:
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [mode])

    useEffect(() => {
        if (itemId && itemKey) {
            $('.container').data('itemId', itemId);
            $('.container').data('itemKey', itemKey);
        }
    }, [itemId, itemKey, itemIV]);

    useEffect(() => {
        window.$ = window.jQuery = jquery; ``

        import('../lib/importScripts').then(async ic => {
            await ic.Froala;
            await ic.FroalaPlugins;
            await ic.Codemirror;
            await ic.Photoswipe;
            await ic.Others;
            Excalidraw = (await ic.Excalidraw)[0];

            setScriptsLoaded(true);

        });
    }, []);

    useEffect(() => {
        if (!(scriptsLoaded && window)) return;

        debugLog(debugOn, `bsafesFroala: ${window.bsafesFroala.name}`)
        window.bsafesFroala.bSafesPreflight = bSafesPreflightHook;
        window.bsafesFroala.rotateImage = rotateImageHook;
        window.bsafesFroala.downScaleImage = downScaleImageHook;
        window.bsafesFroala.convertUint8ArrayToBinaryString = convertUint8ArrayToBinaryString;
        window.bsafesFroala.compareArraryBufferAndUnit8Array = compareArraryBufferAndUnit8ArrayHook;
        window.bsafesFroala.encryptBinaryString = encryptBinaryStringHook;
        window.bsafesFroala.encryptLargeBinaryString = encryptLargeBinaryStringHook;
        window.bsafesFroala.encryptChunkBinaryStringToBinaryStringAsync = encryptChunkBinaryStringToBinaryStringAsyncHook;
        window.bsafesFroala.preS3Upload = preS3UploadHook;
        window.bsafesFroala.preS3ChunkUpload = preS3ChunkUploadHook;
        window.bsafesFroala.uploadData = uploadDataHook;
        window.bsafesFroala.getBrowserInfo = getBrowserInfoHook;
        window.bsafesFroala.arraryBufferToStr = arraryBufferToStrHook;
        window.bsafesFroala.getEditorConfig = getEditorConfigHook;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [scriptsLoaded])

    useEffect(() => {
        if (originalContent !== null) {
            if (editorId === 'content') {
                setIntervalState('Start');
            }
        }
    }, [originalContent])

    useEffect(() => {
        let content;
        debugLog(debugOn, 'interval state:', intervalState);
        switch (intervalState) {
            case 'Start':
                const interval = setInterval(() => {
                    debugLog(debugOn, "Saving draft ...");
                    content = $(editorRef.current).froalaEditor('html.get');
                    //debugLog(debugOn, "editor content: ", content );
                    if (content !== originalContent) {
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

    const handlePenClicked = (purpose) => {
        onPenClicked(editorId, purpose);
    }

    const bSafesPreflightHook = (fn) => {
        debugLog(debugOn, "bSafesPreflight");
        if (!workspace.startsWith("d:")) {
            PostCall({
                api: '/memberAPI/preflight',
                dispatch
            }).then(data => {
                debugLog(debugOn, data);
                if (data.status === 'ok') {
                    debugLog(debugOn, "bSafesPreflight ok: ");
                    fn(null);
                } else {
                    debugLog(debugOn, "woo... bSafesPreflight failed: ", data.error);
                    fn(data.error);
                }
            }).catch(error => {
                debugLog(debugOn, "woo... bSafesPreflight failed.")
                fn(error);
            })
        } else {
            fn(null);
        }

    }

    const rotateImageHook = async (link, exifOrientation, callback) => {
        try {
            const result = await rotateImage(link, exifOrientation);
            debugLog(debugOn, 'Rotation done');
            callback(null, result.blob, result.byteString);

        } catch (error) {
            debugLog(debugOn, 'rotateImage error:', error)
            callback(error);
        }
    }

    const downScaleImageHook = (img, exifOrientation, size) => {
        return new Promise(async (resolve, reject) => {
            try {
                const result = await downScaleImage(img, exifOrientation, size);
                debugLog(debugOn, 'downScaleImage done');
                resolve(result)
            } catch (error) {
                debugLog(debugOn, 'downScaleImage error:', error)
                reject(error);
            }
        });
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
        return new Promise(async (resolve, reject) => {
            if (!workspace.startsWith("d:")) {
                PostCall({
                    api: '/memberAPI/preS3Upload',
                    dispatch
                }).then(data => {
                    debugLog(debugOn, data);
                    if (data.status === 'ok') {
                        const s3Key = data.s3Key;
                        const signedURL = data.signedURL;
                        const signedGalleryURL = data.signedGalleryURL;
                        const signedThumbnailURL = data.signedThumbnailURL;
                        resolve({ status: "ok", s3Key, signedURL, signedGalleryURL, signedThumbnailURL });
                    } else {
                        debugLog(debugOn, "preS3Upload failed: ", data.error);
                        reject({ status: "error", error: data.error });
                    }
                }).catch(error => {
                    debugLog(debugOn, "preS3Upload failed: ", error)
                    reject({ status: "error", error });
                })
            } else {
                const demoOwner = workspace.split(":")[1];
                const s3Key = `${demoOwner}:3:${Date.now()}L`;
                const signedURL = "";
                const signedGalleryURL = "";
                const signedThumbnailURL = "";
                resolve({ status: "ok", s3Key, signedURL, signedGalleryURL, signedThumbnailURL });
            }

        });
    }

    const preS3ChunkUploadHook = (itemId, chunkIndex, timeStamp) => {
        return new Promise((resolve, reject) => {
            let s3Key, s3KeyPrefix, signedURL;
            if (!workspace.startsWith("d:")) {
                PostCall({
                    api: '/memberAPI/preS3ChunkUpload',
                    body: {
                        itemId,
                        chunkIndex: chunkIndex.toString(),
                        timeStamp: timeStamp
                    },
                    dispatch
                }).then(data => {
                    debugLog(debugOn, data);
                    if (data.status === 'ok') {
                        s3Key = data.s3Key;
                        s3KeyPrefix = s3Key.split('_chunk_')[0];
                        signedURL = data.signedURL;
                        resolve({ s3Key, s3KeyPrefix, signedURL });
                    } else {
                        debugLog(debugOn, "preS3ChunkUpload failed: ", data.error);
                        reject(data.error);
                    }
                }).catch(error => {
                    debugLog(debugOn, "preS3ChunkUpload failed: ", error)
                    reject(error);
                })
            } else {
                const demoOwner = workspace.split(":")[1];
                if (chunkIndex === 0) {
                    s3KeyPrefix = `${demoOwner}:3:${Date.now()}L`;
                } else {
                    s3KeyPrefix = `${demoOwner}:3:${timeStamp}`;
                }
                s3Key = `${s3KeyPrefix}_chunk_${chunkIndex}`;
                signedURL = "";
                resolve({ s3Key, s3KeyPrefix, signedURL });
            }

        });;
    }

    const uploadDataHook = (data, s3Key, signedURL, onProgress) => {
        return new Promise(async (resolve, reject) => {
            if (!workspace.startsWith("d:")) {
                const config = {
                    onUploadProgress: async (progressEvent) => {
                        onProgress(progressEvent);
                    },
                    headers: {
                        'Content-Type': 'binary/octet-stream'
                    }
                }
                try {
                    const result = await putS3Object(s3Key, signedURL, data, config, null);
                    resolve(result);
                } catch (error) {
                    reject(error);
                }
            } else {
                try {
                    const result = await putS3ObjectInServiceWorkerDB(s3Key, data, onProgress);
                    resolve(result);
                } catch (error) {
                    reject(error);
                }
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
            {scriptsLoaded ?
                <>
                    {(showPen) && (editable) ?

                        <Row>
                            <Col xs={6}>
                                {(editorId === 'title' && content === '<h2></h2>') && <h6 className='m-0 text-secondary'>Title</h6>}
                                {(editorId === 'content' && content === null) && <h6 className='m-0 text-secondary'>Write {showDrawIcon ? `or Draw` : ``}</h6>}
                            </Col>
                            <Col xs={6}>
                                {showWriteIcon && <OverlayTrigger
                                    placement="top"
                                    delay={{ show: 250, hide: 400 }}
                                    overlay={(props) => (
                                        <Tooltip id="button-tooltip" {...props}>
                                            Write
                                        </Tooltip>
                                    )}
                                ><Button variant="link" className="text-dark pull-right p-0" onClick={handlePenClicked.bind(null, 'froala')}><i className="fa fa-pencil" aria-hidden="true"></i></Button></OverlayTrigger>}
                                {showDrawIcon && <span className='pull-right mx-2'><OverlayTrigger
                                    placement="top"
                                    delay={{ show: 250, hide: 400 }}
                                    overlay={(props) => (
                                        <Tooltip id="button-tooltip" {...props}>
                                            Draw
                                        </Tooltip>
                                    )}
                                ><Button variant="link" className="text-dark p-0 mx-3" onClick={handlePenClicked.bind(null, 'excalidraw')}><i className="fa fa-paint-brush" aria-hidden="true"></i></Button></OverlayTrigger> </span>}
                                {(editorId === 'content' && draft !== null) &&
                                    <ButtonGroup className='pull-right mx-3' size="sm">
                                        <Button variant="outline-danger" className='m-0' onClick={onDraftClicked}>Draft</Button>
                                        <Button variant="danger" onClick={onDraftDelete}>X</Button>
                                    </ButtonGroup>
                                }
                            </Col>
                        </Row>
                        :
                        <Row>
                            <span> . </span>
                        </Row>
                    }
                    {((contentType !== 'DrawingPage' || editorId === 'title') && ((mode === 'Writing' || mode === 'Saving') || mode === 'ReadOnly' || !(hideIfEmpty && (!content || content.length === 0)))) &&
                        <Row className={`${(editorId === 'title') ? BSafesStyle.titleEditorRow : BSafesStyle.editorRow} fr-element fr-view`}>
                            <div className="inner-html" ref={editorRef} dangerouslySetInnerHTML={{ __html: content }} style={{ overflowX: 'auto' }}>
                            </div>
                        </Row>
                    }
                    {
                        editorId === 'content' && contentType === 'DrawingPage' && editorId === 'content' &&
                        <Row className={`${BSafesStyle.editorRow} w-100`} style={{ height: '60vh' }}>
                            {(mode == 'Writing' || mode === 'Saving') ?
                                <div style={{position: "fixed", zIndex:"100", top: "0", left: "0", height: "100%", width: "100%"}}>
                                    <Excalidraw.Excalidraw excalidrawAPI={(excalidrawApi) => {
                                        ExcalidrawRef.current = excalidrawApi;
                                    }}
                                    />
                                </div>
                                :
                                content &&
                                <Image style={{ objectFit: 'scale-down', maxHeight: '100%', maxWidth: '100%' }} alt="Image broken" src={content.src} fluid />
                            }
                        </Row>
                    }
                </> : ""
            }
        </>
    );
}
