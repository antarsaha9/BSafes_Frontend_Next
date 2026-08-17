import { useEffect, useRef, useState } from "react";
import { useSelector, useDispatch } from 'react-redux'
import { useRouter } from "next/router";

import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Button from 'react-bootstrap/Button';
import ButtonGroup from 'react-bootstrap/ButtonGroup';
import Image from 'react-bootstrap/Image';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Tooltip from 'react-bootstrap/Tooltip';

const forge = require('node-forge');

import { Blocks } from 'react-loader-spinner';

import jquery from "jquery"

import BSafesStyle from '../styles/BSafes.module.css'

import { getEditorConfig, newResultItem } from "../lib/bSafesCommonUI";
import { debugLog, PostCall, convertUint8ArrayToBinaryString, getBrowserInfo, arraryBufferToStr } from "../lib/helper";
import { putS3Object } from "../lib/s3Helper";
import { generateNewItemKey, compareArraryBufferAndUnit8Array, encryptBinaryString, encryptLargeBinaryString, encryptChunkBinaryStringToBinaryStringAsync } from "../lib/crypto";
import { rotateImage, downScaleImage } from '../lib/wnImage';
import { products } from "../lib/productID";

import { newItemKey, putS3ObjectInServiceWorkerDB, setInitialContentRendered, setPageCommonControlsBottom, saveAFileThunk, setDrawingTemplateImage, setDraftInterval } from "../reduxStore/pageSlice";
import { setEditorScriptsLoaded } from "../reduxStore/scriptsSlice";

let Excalidraw = null;
let FontsConfig = null;
/**
 * Editor Component
 * 
 * @param {Object} props - The properties object.
 * @param {string} props.editorId - Unique identifier for the editor.
 * @param {"Writing" | "ReadOnly" | "Saving" | "GeneratingDrawingImage"} props.mode - The mode of the editor.
 * @param {string} props.content - Initial content of the editor.
 * @param {function(string, string): void} props.onContentChanged - Callback when content changes.
 * @param {function(string, string): void} props.onPenClicked - Callback when the pen is clicked.
 * @param {boolean} [props.showPen=true] - Whether to show the pen icon.
 * @param {boolean} [props.editable=true] - Whether the editor is editable.
 * @param {boolean} [props.hideIfEmpty=false] - Whether to hide the editor if empty.
 * @param {function() | null} [props.writingModeReady=null] - Callback when writing mode is ready.
 * @param {function() | null} [props.readOnlyModeReady=null] - Callback when read-only mode is ready.
 * @param {function(string) | null} [props.onDraftSampled=null] - Callback when a draft is sampled.
 * @param {function() | null} [props.onDraftClicked=null] - Callback when a draft is clicked.
 * @param {function() | null} [props.onDraftDelete=null] - Callback when a draft is deleted.
 * @param {boolean} [props.showDrawIcon=false] - Whether to show the drawing icon.
 * @param {boolean} [props.showWriteIcon=false] - Whether to show the writing icon.
 * @param {function(Object) | null} [props.onDrawingClicked=null] - Callback when the drawing icon is clicked.
 * @param {blob} [props.drawingSnapshot=null] - Snapshot of an Excalidraw drawing.
 */


export default function Editor({ editorId, mode, content, onContentChanged, onPenClicked, showPen = true, editable = true, hideIfEmpty = false, writingModeReady = null, readOnlyModeReady = null, onDraftSampled = null, onDraftClicked = null, onDraftDelete = null, showDrawIcon = false, showWriteIcon = false, onDrawingClicked = null, drawingImageDone = null, drawingSnapshot = null }) {
    const debugOn = false;
    const dispatch = useDispatch();
    const router = useRouter();

    const editorRef = useRef(null);
    const monitorExcalidrawCallback = useRef();
    const bottomBarRectBottomRef = useRef();

    const ExcalidrawRef = useRef(null);
    const [intervalState, setIntervalState] = useState(null);
    const froalaKey = useSelector(state => state.auth.froalaLicenseKey);
    const workspace = useSelector(state => state.container.workspace);
    const itemId = useSelector(state => state.page.id);
    const itemKey = useSelector(state => state.page.itemKey);
    const itemIV = useSelector(state => state.page.itemIV);
    const draft = useSelector(state => state.page.draft);
    const contentType = useSelector(state => state.page.contentType) || 'WritingPage';
    const pageTemplate = useSelector(state => state.page.pageTemplate);
    const draftInterval = useSelector(state => state.page.draftInterval);
    const productId = useSelector(state => state.product.currentProduct);

    debugLog(debugOn, `editor key: ${froalaKey}`);

    const [editorOn, setEditorOn] = useState(false);
    const [scriptsLoaded, setScriptsLoaded] = useState(false);
    const [originalContent, setOriginalContent] = useState(null);
    const [viewportWidth, setViewportWidth] = useState(0);
    const [monitorExcalidrawInterval, setMonitorExcalidrawInterval] = useState(null);
    const [bottomBarRectBottom, setBottomBarRectBottom] = useState(0);
    const [needToUpdatePageCommonControls, setNeedToUpdatePageCommonControls] = useState(false);
    debugLog(debugOn, "Rendering editor, id,  mode: ", `${editorId} ${mode}`);

    let product = {};
    if (productId) {
        product = products[productId];
    }

    const updatePageCommonControlsBottom = () => {
        if (!window || !document || !ExcalidrawRef.current) return;
        if (window.innerWidth !== viewportWidth) {
            const elements = ExcalidrawRef.current.getSceneElements();
            ExcalidrawRef.current.scrollToContent(elements[0], {
                fitToContent: true
            });
            setViewportWidth(window.innerWidth);
        }
        debugLog(debugOn, "updatePageCommonControlsBottom, window.innerHeight", window.innerHeight);
        const targetDiv = document.getElementsByClassName("App-bottom-bar")[0].getElementsByClassName("Island")[0];
        const rect = targetDiv.getBoundingClientRect();
        debugLog(debugOn, "updatePageCommonControlsBottom, rect.bottom", rect.bottom);
        const pageCommonControlsBottom = window.innerHeight - rect.bottom + rect.height + 4;
        dispatch(setPageCommonControlsBottom(pageCommonControlsBottom));
    }

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
                const fullOptions = ['fullscreen', 'bold', 'italic', 'underline', 'strikeThrough', 'subscript', 'superscript', 'fontFamily', 'fontSize', 'lineHeight', '|', 'color', 'emoticons', 'paragraphStyle', '|', 'paragraphFormat', 'align', 'formatOL', 'formatUL', 'outdent', 'indent', 'quote', 'insertHR', '-', 'insertLink', 'insertImage', 'insertVideo', 'insertTable', 'undo', 'redo', 'clearFormatting'];
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
                    toolbarButtons: ['bold', 'italic', 'underline', 'strikeThrough', 'undo', 'redo'],
                    toolbarButtonsMD: ['bold', 'italic', 'underline', 'strikeThrough', 'undo', 'redo'],
                    toolbarButtonsSM: ['bold', 'italic', 'underline', 'strikeThrough', 'undo', 'redo'],
                    toolbarButtonsXS: ['bold', 'italic', 'underline', 'strikeThrough', 'undo', 'redo']
                };
        }
        froalaOptions.videoInsertButtons = ['videoBack', '|', 'videoUpload']
        froalaOptions.imageInsertButtons = ['imageBack', '|', 'imageUpload']
        $(editorRef.current).froalaEditor(froalaOptions);
        editorRef.current.style.overflowX = null;
        if (!editorOn) {
            debugLog(debugOn, "setEditorOn")
            setEditorOn(true);
        }
        if (writingModeReady) writingModeReady();
        if (editorId === 'content') {
            const contentSample = $(editorRef.current).froalaEditor('html.get');
            setOriginalContent(contentSample);
        }
        setTimeout(() => {
            $(editorRef.current).froalaEditor('events.focus', true);
        }, 500);
    }

    const drawing = () => {
        const loadExcalidrawState = () => {
            setTimeout(() => {
                const drawingContent = getDrawingContent();
                const contentSample = ({
                    metadata: {
                        ExcalidrawSerializedJSON: drawingContent
                    }
                });
                setOriginalContent(contentSample);

                if (!editorOn) {
                    debugLog(debugOn, "setEditorOn")
                    setEditorOn(true);
                }
            }, 1000);
        }
        if (content && content?.metadata?.ExcalidrawSerializedJSON) {
            const savedJSON = JSON.parse(content?.metadata?.ExcalidrawSerializedJSON);
            const res = Excalidraw.restore(savedJSON);
            function restoreExcalidraw(params) {
                if (!scriptsLoaded || !ExcalidrawRef.current) {
                    debugLog(debugOn, 'excalidrawApi not defined, rechecking');
                    setTimeout(() => {
                        restoreExcalidraw(params);
                    }, 500);
                } else {
                    ExcalidrawRef.current.updateScene(res);
                    if (res.files)
                        ExcalidrawRef.current.addFiles(Object.values(res.files));
                    loadExcalidrawState();
                    ExcalidrawRef.current.scrollToContent(savedJSON.elements[0], {
                        fitToContent: true,
                    });
                }
            }
            setTimeout(() => {
                restoreExcalidraw(res);
            }, 500);
        }
        else {
            loadExcalidrawState();
        }
        monitorExcalidrawCallback.current = () => {
            const appBottomBar = document.getElementsByClassName("App-bottom-bar");
            if (!appBottomBar || !appBottomBar.length) return;
            const Island = appBottomBar[0].getElementsByClassName("Island");
            if (!Island || !Island.length) return;
            const targetDiv = Island[0];
            const rect = targetDiv.getBoundingClientRect();
            debugLog(debugOn, "monitor excalidraw interval: ", `${bottomBarRectBottomRef.current}, ${rect.bottom}`);
            if (rect.bottom !== bottomBarRectBottomRef.current) {
                setBottomBarRectBottom(rect.bottom);
                bottomBarRectBottomRef.current = rect.bottom;
            }
        }
        const thisInterval = setInterval(() => {
            monitorExcalidrawCallback.current();
        }, 500);
        setMonitorExcalidrawInterval(thisInterval);
    }

    const getDrawingContent = () => {
        if (!ExcalidrawRef.current) {
            return;
        }
        const elements = ExcalidrawRef.current.getSceneElements();
        if (!elements || !elements.length) {
            return;
        }
        const serialized = Excalidraw.serializeAsJSON(ExcalidrawRef.current.getSceneElements(), ExcalidrawRef.current.getAppState(), ExcalidrawRef.current.getFiles(), 'local');
        return serialized;
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
            const serialized = Excalidraw.serializeAsJSON(ExcalidrawRef.current.getSceneElements(), ExcalidrawRef.current.getAppState(), ExcalidrawRef.current.getFiles(), 'local');
            const blob = {};
            blob.name = 'excalidraw.png';
            blob.metadata = {
                ExcalidrawSerializedJSON: serialized
            };
            onContentChanged(editorId, blob);
        } else {
            let content = $(editorRef.current).froalaEditor('html.get');
            debugLog(debugOn, "editor content: ", content);
            setTimeout(() => {
                onContentChanged(editorId, content);
            }, 0)
        }
    }

    const generateDrawingTemplateImage = () => {
        const templateJSON = JSON.parse(pageTemplate);
        Excalidraw.exportToCanvas({
            elements: templateJSON.elements,
            appState: {
                ...templateJSON.appState,
                exportWithDarkMode: false,
                exportBackground: true,
                exportScale: 2
            },
            files: templateJSON.files,
            maxWidthOrHeight: 2048
        }).then(canvas => {
            canvas.toBlob(blob => {
                dispatch(setDrawingTemplateImage({ src: window.URL.createObjectURL(blob) }))
                blob.name = 'excalidraw.png';
                drawingImageDone();
            })
        })
    }

    const readOnly = async () => {
        if (editorOn) {
            if ((editorId !== 'content') || (contentType === "WritingPage")) {
                $(editorRef.current).froalaEditor('destroy');
                $(editorRef.current).html(content);
                editorRef.current.style.overflowX = 'auto';
            }
            if (draftInterval) {
                clearInterval(draftInterval);
                dispatch(setDraftInterval(null));
                setIntervalState(null);
            }
            setOriginalContent(null);
            setEditorOn(false);
            if (readOnlyModeReady) readOnlyModeReady();
            if (monitorExcalidrawInterval) {
                clearInterval(monitorExcalidrawInterval);
                setMonitorExcalidrawInterval(null);
            }
        }
    }

    useEffect(() => {
        if (!scriptsLoaded) return;
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
            case "GeneratingDrawingImage":
                generateDrawingTemplateImage();
                break;
            default:
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [mode, scriptsLoaded])

    useEffect(() => {
        if (itemId && itemKey) {
            $('body').data('itemId', itemId);
            $('body').data('itemKey', itemKey);
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
            try {
                await new Promise((done) => {
                    const FontsConfigImport = import('../resolved_fonts.json')
                    FontsConfigImport.then((loadResult) => {
                        FontsConfig = loadResult.default
                        done()
                    }).catch((err) => {

                    })
                })
            } catch (error) {
                console.log({ error });
            }
            setScriptsLoaded(true);
            if (editorId === "content") {
                dispatch(setEditorScriptsLoaded(true));
            }
        });
        return () => {
            console.log("Editor Unmounted");
            if (editorId === "content") {
                setScriptsLoaded(false);
                dispatch(setEditorScriptsLoaded(false));
            }
        }
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
        dispatch(setInitialContentRendered(true));
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
                const interval = setInterval(async () => {
                    debugLog(debugOn, "Saving draft ...");
                    if (contentType === "WritingPage") {
                        content = $(editorRef.current).froalaEditor('html.get');
                        debugLog(debugOn, "editor content: ", content);
                        if (content !== originalContent) {
                            debugLog(debugOn, 'Content changed');
                            onDraftSampled(content);
                            setOriginalContent(content);
                            setIntervalState('Stop');
                        }
                    } else if (contentType === "DrawingPage") {
                        const drawingContent = getDrawingContent();
                        const content = ({
                            metadata: {
                                ExcalidrawSerializedJSON: drawingContent
                            }
                        });
                        if (drawingContent !== originalContent?.metadata?.ExcalidrawSerializedJSON) {
                            debugLog(debugOn, 'Content changed');
                            onDraftSampled(content);
                            setOriginalContent(content);
                            setIntervalState('Stop');
                        }
                        debugLog(debugOn, "drawing editor content: ", content);
                    }

                }, 1000);
                dispatch(setDraftInterval(interval));
                break;
            case 'Stop':
                clearInterval(draftInterval);
                dispatch(setDraftInterval(null));
                break;
            default:
        }
    }, [intervalState])

    useEffect(() => {
        if (bottomBarRectBottom) {
            debugLog(debugOn, "bottomBarRectBottom changed");
            setNeedToUpdatePageCommonControls(true);
        }
    }, [bottomBarRectBottom])

    useEffect(() => {
        if (needToUpdatePageCommonControls) {
            debugLog(debugOn, "needToUpdatePageCommonControls")
            updatePageCommonControlsBottom();
            setNeedToUpdatePageCommonControls(false);
        }
    }, [needToUpdatePageCommonControls]);

    const handlePenClicked = (purpose) => {
        onPenClicked(editorId, purpose);
    }

    const handleDrawingClicked = () => {
        const img = document.createElement('img');
        img.src = drawingSnapshot.src;
        img.onload = async () => {
            const w = img.width;
            const h = img.height;
            onDrawingClicked({ src: img.src, w, h })
        }
    }

    const bSafesPreflightHook = (fn) => {
        debugLog(debugOn, "bSafesPreflight");
        if (!workspace || (workspace && !workspace.startsWith("d:"))) {
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
            if (!workspace || (workspace && !workspace.startsWith("d:"))) {
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
            if (!workspace || (workspace && !workspace.startsWith("d:"))) {
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
            if (!workspace || (workspace && !workspace.startsWith("d:"))) {
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

    const saveAsJSON = () => {
        const elements = ExcalidrawRef.current.getSceneElements();
        if (!elements || !elements.length) {
            return;
        }
        let appState = ExcalidrawRef.current.getAppState();
        appState = {
            ...appState,
            forBSafes: true,
            forBSafesImageMaxWidthOrHeight: 120
        }
        const serialized = Excalidraw.serializeAsJSON(ExcalidrawRef.current.getSceneElements(), appState, ExcalidrawRef.current.getFiles(), 'local');
        const encoded = forge.util.encodeUtf8(serialized);
        const attachment = {
            fileName: "test.draw",
            fileSize: encoded.length,
            data: encoded
        }
        dispatch(saveAFileThunk({ attachment }));
    }
    return (
        <>
            {scriptsLoaded ?
                <div>
                    {(showPen) && (editable) ?
                        <>
                            <Row>
                                <Col xs={6}>
                                    {((productId === "")||(product.fixedSize === undefined)) && (editorId === 'title' && (!content || (content === '<h2></h2>'))) && <h6 className='m-0 text-secondary'>Title</h6>}
                                    {(editorId === 'content' && content === null) && <div className="px-3 pt-1"><h6 className='m-0 text-secondary'>Write {showDrawIcon ? `or Draw` : ``}</h6></div>}
                                </Col>
                                <Col xs={6}>
                                    <div className={`${editorId === "content" ? "px-3 pt-1" : ""}`}>
                                        {(editorId === "content" || ((productId === "")||(product.fixedSize === undefined))) && showWriteIcon && <OverlayTrigger
                                            placement="top"
                                            delay={{ show: 250, hide: 400 }}
                                            overlay={(props) => (
                                                <Tooltip id="button-tooltip" {...props}>
                                                    Write
                                                </Tooltip>
                                            )}
                                        ><Button id="write-1" variant="link" className="text-dark pull-right p-0" onClick={handlePenClicked.bind(null, 'froala')}><i className="fa fa-pencil" aria-hidden="true"></i></Button></OverlayTrigger>}
                                        {showDrawIcon && <span className='pull-right mx-2'><OverlayTrigger
                                            placement="top"
                                            delay={{ show: 250, hide: 400 }}
                                            overlay={(props) => (
                                                <Tooltip id="button-tooltip" {...props}>
                                                    Draw
                                                </Tooltip>
                                            )}
                                        ><Button id="draw-1" variant="link" className="text-dark p-0 mx-3" onClick={handlePenClicked.bind(null, 'excalidraw')}><i className="fa fa-paint-brush" aria-hidden="true"></i></Button></OverlayTrigger> </span>}
                                    </div>
                                    {(editorId === 'content' && draft) &&
                                        <ButtonGroup className='pull-right mx-3' size="sm">
                                            <Button variant="outline-danger" className='m-0' onClick={onDraftClicked}>Draft</Button>
                                            <Button variant="danger" onClick={onDraftDelete}>X</Button>
                                        </ButtonGroup>
                                    }
                                </Col>
                            </Row>
                        </>
                        :
                        <>{editorId === 'content' ?
                            <Row>
                                <span> . </span>
                            </Row> :
                            ""
                        }
                        </>

                    }
                    {(editorId === 'title' && ((mode === 'Writing' || mode === 'Saving') || mode === 'ReadOnly' || !(hideIfEmpty && (!content || content.length === 0)))) &&
                        <div style={{ position: "relative" }}>
                            <div style={{ paddingTop: "7px", marginRight: "7px" }} className={`${(editorId === 'title') ? BSafesStyle.titleEditorRow : BSafesStyle.editorRow} fr-element fr-view`}>
                                {((productId !== "") && (product.fixedSize)) && (!content || content === '<h2></h2>') &&
                                    <h6 className='m-0 text-secondary'>Title</h6>
                                }
                                <div className="inner-html" ref={editorRef} dangerouslySetInnerHTML={{ __html: content }} style={{ overflowX: 'auto' }}>
                                </div>
                            </div>
                            {showPen && editable && productId !== "" && product.fixedSize && showWriteIcon &&
                                <OverlayTrigger
                                    placement="top"
                                    delay={{ show: 250, hide: 400 }}
                                    overlay={(props) => (
                                        <Tooltip id="button-tooltip" {...props}>
                                            Write
                                        </Tooltip>
                                    )}
                                >
                                    <Button id="write-2" variant="link" style={{ position: "absolute", top: "0px", right: "-12px", width: "24px", zIndex: "" }} className="text-dark p-0" onClick={handlePenClicked.bind(null, 'froala')}><i className="fa fa-pencil" aria-hidden="true"></i></Button>
                                </OverlayTrigger>
                            }
                        </div>
                    }
                    {(editorId !== 'title' && (editorId !== 'content' || contentType === 'WritingPage') && ((mode === 'Writing' || mode === 'Saving') || mode === 'ReadOnly' || !(hideIfEmpty && (!content || content.length === 0)))) &&
                        <div className="px-2">
                            <Row style={{ margin: "0px" }} className={`${(editorId === 'title') ? BSafesStyle.titleEditorRow : BSafesStyle.editorRow} fr-element fr-view`}>
                                <div className="inner-html" ref={editorRef} dangerouslySetInnerHTML={{ __html: content }} style={{ overflowX: 'auto' }}>
                                </div>
                            </Row>
                        </div>
                    }
                    {editorId === 'content' && contentType === 'DrawingPage' &&
                        <>
                            {(mode == 'Writing' || mode === 'Saving' || mode === "GeneratingDrawingImage") ?
                                <div style={{ position: "fixed", zIndex: "100", top: "0", left: "0", height: "100%", width: "100%" }}>
                                    <Excalidraw.Excalidraw excalidrawAPI={(excalidrawApi) => {
                                        if (!ExcalidrawRef.current) {
                                            ExcalidrawRef.current = excalidrawApi;
                                            FontsConfig.forEach(font => {
                                                excalidrawApi.registerCustomFont(font.name, ...font.descripters);
                                            })
                                        }
                                        ExcalidrawRef.current = excalidrawApi;
                                    }}
                                    >
                                        <Excalidraw.MainMenu>
                                            <Excalidraw.MainMenu.Group title="Excalidraw items">
                                                <Excalidraw.MainMenu.DefaultItems.LoadScene />
                                                <Excalidraw.MainMenu.DefaultItems.Export />
                                                <Excalidraw.MainMenu.DefaultItems.SaveAsImage />
                                                <Excalidraw.MainMenu.Item onSelect={saveAsJSON}>
                                                    Save As JSON
                                                </Excalidraw.MainMenu.Item>
                                                <Excalidraw.MainMenu.DefaultItems.Help />
                                                <Excalidraw.MainMenu.DefaultItems.ClearCanvas />
                                                <Excalidraw.MainMenu.DefaultItems.ToggleTheme />
                                                <Excalidraw.MainMenu.DefaultItems.ChangeCanvasBackground />
                                            </Excalidraw.MainMenu.Group>
                                        </Excalidraw.MainMenu>
                                    </Excalidraw.Excalidraw>
                                </div>
                                :
                                <>
                                    {drawingSnapshot && drawingSnapshot.src &&
                                        <Image onClick={handleDrawingClicked} style={{ display: "block", margin: "auto", objectFit: 'scale-down', maxHeight: '100%', maxWidth: '100%' }} alt="Image broken" src={drawingSnapshot && drawingSnapshot.src} fluid />}
                                </>
                            }
                        </>
                    }
                </div> :
                <div className={BSafesStyle.screenBottomLeft}>
                    <Blocks
                        visible={true}
                        height="40"
                        width="40"
                        ariaLabel="blocks-loading"
                        wrapperStyle={{}}
                        wrapperClass="blocks-wrapper"
                    />
                </div>
            }
        </>
    );
}
