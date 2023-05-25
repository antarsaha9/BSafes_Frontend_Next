import { useEffect, useRef, useState } from "react";
import { useSelector, useDispatch } from 'react-redux'

import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Button from 'react-bootstrap/Button'
import Spinner from 'react-bootstrap/Spinner';

import Editor from './editor';
import ImagePanel from "./imagePanel";
import PageCommonControls from "./pageCommonControls";
import AttachmentPanel from "./attachmentPanel";
import Comments from "./comments";

import BSafesStyle from '../styles/BSafes.module.css'
import { updateContentImagesDisplayIndex, updateContentVideosDisplayIndex, downloadContentVideoThunk, setImageWordsMode, saveImageWordsThunk, saveContentThunk, saveTitleThunk, uploadImagesThunk, uploadAttachmentsThunk, setCommentEditorMode, saveCommentThunk } from "../reduxStore/pageSlice";
import { debugLog } from '../lib/helper';
import { de } from "date-fns/locale";

export default function PageCommons() {
    const debugOn = true;
    const dispatch = useDispatch();

    const workspaceKey = useSelector( state => state.container.workspaceKey);
    const workspaceSearchKey = useSelector( state => state.container.searchKey);
    const workspaceSearchIV = useSelector( state => state.container.searchIV);

    const activity = useSelector( state => state.page.activity);

    const [titleEditorMode, setTitleEditorMode] = useState("ReadOnly");
    const titleEditorContent = useSelector(state => state.page.title);
    const [contentEditorMode, setContentEditorMode] = useState("ReadOnly");
    const contentEditorContent = useSelector(state => state.page.content);
    const [editingEditorId, setEditingEditorId] = useState(null);

    const contentImagesDownloadQueue = useSelector( state => state.page.contentImagesDownloadQueue);
    const contentImagesDisplayIndex = useSelector( state => state.page.contentImagesDisplayIndex);

    const contentVideosDownloadQueue = useSelector( state => state.page.contentVideosDownloadQueue);
    const contentVideosDisplayIndex = useSelector( state => state.page.contentVideosDisplayIndex);

    const imagePanelsState = useSelector(state => state.page.imagePanels);
    const attachmentPanelsState = useSelector(state => state.page.attachmentPanels);
    const comments = useSelector(state => state.page.comments);

    const pswpRef = useRef(null);

    const imageFilesInputRef = useRef(null);
    const [imagesDragActive, setImagesDragActive] = useState(false);

    const attachmentsInputRef = useRef(null);
    const [attachmentsDragActive, setAttachmentsDragActive] = useState(false);

    const onImageClicked = (queueId) => {
        debugLog(debugOn, "onImageClicked: ", queueId);

        const slides = [];
        let startingIndex;
        for(let i=0; i< imagePanelsState.length; i++) {
            const thisPanel = imagePanelsState[i];
            if(thisPanel.status !== "Uploaded" &&  thisPanel.status !== "Downloaded") continue;
            const item = {};
            item.src = thisPanel.src;
            item.w = thisPanel.width;
            item.h = thisPanel.height;
            slides.push(item);
            if(thisPanel.queueId === queueId) {
                startingIndex = slides.length - 1;
            }
        }
        const pswpElement = pswpRef.current;
        const options = {
            // optionName: 'option value'
            // for example:
            index: startingIndex // start at first slide
        };
        const gallery = new PhotoSwipe(pswpElement, PhotoSwipeUI_Default, slides, options);
        gallery.init();
    }

    const handlePenClicked = (editorId) => {
        debugLog(debugOn, `pen ${editorId} clicked`);
        if(editorId === 'content'){
            setContentEditorMode("Writing");
            setEditingEditorId("content");
        } else if(editorId === 'title') {
            setTitleEditorMode("Writing");
            setEditingEditorId("title");
        } else if(editorId.startsWith("image_")) {
            const imageIndex = parseInt(editorId.split("_")[1]);
            dispatch(setImageWordsMode({index: imageIndex, mode: "Writing"}));
            setEditingEditorId(editorId);
        } else if(editorId.startsWith("comment_")) {
            dispatch(setCommentEditorMode({index: editorId, mode: "Writing"}));
            setEditingEditorId(editorId);
        }
    }
    
    const handleContentChanged = (editorId, content) => {
        debugLog(debugOn, `editor-id: ${editorId} content: ${content}`);
        
        if(editingEditorId === "content") {
            if(content !== contentEditorContent) {
                dispatch(saveContentThunk(content, workspaceKey));
            } else {
                setEditingEditorMode("ReadOnly");
                setEditingEditorId(null);
            }
        } else if(editingEditorId === "title") {
            if(content !== titleEditorContent) {
                dispatch(saveTitleThunk(content, workspaceKey, workspaceSearchKey, workspaceSearchIV));
            } else {
                setEditingEditorMode("ReadOnly");
                setEditingEditorId(null);
            }
        } else if(editingEditorId.startsWith("image_")){
            const imageIndex = parseInt(editingEditorId.split("_")[1]);
            if(content !== imagePanelsState[imageIndex].words) {
                dispatch(saveImageWordsThunk({index: imageIndex, content: content}));
            } else {
                dispatch(setImageWordsMode({index: imageIndex, mode: "ReadOnly"}));
                setEditingEditorId(null);
            }
        } else if(editingEditorId.startsWith("comment_")){
            if(editingEditorId !== 'comment_New') {
                let index = parseInt(editingEditorId.split('_')[1]);
                if(comments[index].content === content){ 
                    dispatch(setCommentEditorMode({index: editingEditorId, mode: "ReadOnly"}));
                    setEditingEditorId(null);
                    return;
                }         
            }
            dispatch(saveCommentThunk({index: editingEditorId, content}));
        }    
    }

    const imagePanels = imagePanelsState.map((item, index) =>
        <ImagePanel key={item.queueId} panelIndex={"image_" + index} panel={item} onImageClicked={onImageClicked} editorMode={item.editorMode} onPenClicked={handlePenClicked} onContentChanged={handleContentChanged} editable={!editingEditorId && (activity === "Done")} />
    )

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
                if(editingEditorId.startsWith("image_")){
                    const imageIndex = parseInt(editingEditorId.split("_")[1]);
                    switch(mode) {
                        case "Saving":
                        case "ReadOnly":
                            dispatch(setImageWordsMode({index: imageIndex, mode}))
                            break;
                        default:
                    }
                    
                } else if(editingEditorId.startsWith("comment_")){
                    switch(mode) {
                        case "Writing":
                        case "Saving":
                        case "ReadOnly":
                            dispatch(setCommentEditorMode({index: editingEditorId, mode}))
                            break;
                        default:
                    }
                } else {

                }
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
        imageFilesInputRef.current.value = null;
        imageFilesInputRef.current?.click();
    };
    
    const uploadImages = (files, where) => {
        dispatch(uploadImagesThunk({files, where, workspaceKey}));
    };

    const handleImageFiles = (e) => {
        e.preventDefault();
        debugLog(debugOn, "handleImageFiles: ", e.target.id);
        const files = e.target.files;
	    if (files.length) {
            uploadImages(files, 'top');
        }
    }

    const attachmentPanels = attachmentPanelsState.map((item, index) =>
        <AttachmentPanel key={item.queueId} panelIndex={"attachment_" + index} panel={item} />
    )

    const handleAttachmentButton = (e) => {
        debugLog(debugOn, "handleAttachmentBtn");
        e.preventDefault();
        attachmentsInputRef.current.value = null;
        attachmentsInputRef.current?.click();
    };

    const uploadAttachments = (files) => {
        dispatch(uploadAttachmentsThunk({files, workspaceKey}));
    };

    const handleAttachments = (e) => {
        e.preventDefault();
        debugLog(debugOn, "handleAttachments: ", e.target.id);
        const files = e.target.files;
	    if (files.length) {
            uploadAttachments(files);
        }
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
    
    const buildContentVideos = () => {
        const videoDownloads = document.getElementsByClassName('bSafesDownloadVideo');
        Array.from(videoDownloads).forEach(element => {
            const elementClone = element.cloneNode(true); // Remove all possible event listeners
            let s3Key, chunks, fileName, fileType, fileSize;
            elementClone.onclick = (e) => {
                const id =  e.target.id;
                const idParts = id.split('&');
                if(idParts[0] === 'chunks') {
                    s3Key = idParts[3];
                    chunks = parseInt(idParts[1]);
                    fileName = idParts[2];
                    fileSize = parseInt(idParts[5]);
                    fileType = idParts[4];
                    dispatch(downloadContentVideoThunk({id, s3Key, chunks, fileName, fileType, fileSize}));
                } else {
                    s3Key = idParts[0];
                    dispatch(downloadContentVideoThunk({id, s3Key}));
                }
	            
            };
            element.replaceWith(elementClone);
        });
    }

    useEffect(() => {
        debugLog(debugOn, "pageCommons mounted.");
    }, []);

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activity]);

    useEffect(()=>{
        if(contentEditorContent === null) return;
        //buildContentVideos();
    // eslint-disable-next-line react-hooks/exhaustive-deps    
    }, [contentEditorContent]);

    useEffect(()=> {
        let image, imageElement, imageElementClone, contentImageContainer, progressElement, progressBarElement;
        let i = contentImagesDisplayIndex;
        if(i < contentImagesDownloadQueue.length) {
            image = contentImagesDownloadQueue[i];
            imageElement = document.getElementById(image.id);
            if(!imageElement) {
                dispatch(updateContentImagesDisplayIndex(i+1));
                return;
            }
            if(image.status === "Downloading") {
                contentImageContainer = document.getElementById('imageContainer_' + image.id);
                progressElement = document.getElementById('progress_' + image.id);
                if(contentImageContainer){
                    if(!progressElement) {
                        progressElement = document.createElement('div');
                        progressElement.className = 'progress';
                        progressElement.id = 'progress_' + image.id;
                        progressElement.style.width = '250px';
                        progressElement.style.margin = 'auto';
                        progressElement.innerHTML = `<div class="progress-bar" id="progressBar_${image.id}" style="width: ${image.progress}%;"></div>`;
                        contentImageContainer.appendChild(progressElement);
                    }
                    progressBarElement = document.getElementById('progressBar_' + image.id);
                    if(progressBarElement) progressBarElement.style.width = image.progress + '%';
                } else {
                    imageElementClone = imageElement.cloneNode(true);
                    contentImageContainer = document.createElement('div');
                    contentImageContainer.style.position = 'relative';
                    contentImageContainer.style.textAlign = 'center';
                
                    contentImageContainer.id = 'imageContainer_' + image.id;
                    contentImageContainer.appendChild(imageElementClone);
                    imageElement.replaceWith(contentImageContainer);   
                    
                    progressElement = document.createElement('div');
                    progressElement.className = 'progress';
                    progressElement.id = 'progress_' + image.id;
                    progressElement.style.width = '250px';
                    progressElement.style.margin = 'auto';
                    progressElement.innerHTML = `<div class="progress-bar" id="progressBar_${image.id}" style="width: ${image.progress}%;"></div>`;
                    contentImageContainer.appendChild(progressElement);
                }
                return;
            } else if((image.status === "Downloaded") || (image.status === "DownloadFailed")) {
                contentImageContainer = document.getElementById('imageContainer_' + image.id);
                progressElement = document.getElementById('progress_' + image.id);
                if(progressElement) contentImageContainer.removeChild(progressElement);
                
                if(image.status === "Downloaded") {
                    imageElement.src = image.src;
                }

                dispatch(updateContentImagesDisplayIndex(i+1));
            } 
            if(imageElement.classList.contains('bSafesDownloadVideo')){
                
                const handleVideoClick = (e) => {
                    const id =  e.target.id;
                    const idParts = id.split('&');
                    if(idParts[0] === 'chunks') {
                        let s3Key = idParts[3];
                        let chunks = parseInt(idParts[1]);
                        let fileName = idParts[2];
                        let fileSize = parseInt(idParts[5]);
                        let fileType = idParts[4];
                        dispatch(downloadContentVideoThunk({id, s3Key, chunks, fileName, fileType, fileSize}));
                    } else {
                        let s3Key = idParts[0];
                        dispatch(downloadContentVideoThunk({id, s3Key}));
                    }
                    
                }; 

                let playIcon = document.createElement('i');
                playIcon.className = 'contentVideoPlayIcon';
                playIcon.classList.add('fa');
                playIcon.classList.add('fa-play-circle-o');
                playIcon.classList.add('fa-3x');
                playIcon.setAttribute('aria-hidden', "true");
                playIcon.id = image.id;
                contentImageContainer.appendChild(playIcon);
                playIcon.onclick = handleVideoClick;
                imageElement.onclick = handleVideoClick;
            }
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps    
    }, [contentImagesDownloadQueue]);

    useEffect(()=> {
        let video, videoElement, videoElementClone, contentVideoContainer, progressElement, progressBarElement;
        let i = contentVideosDisplayIndex;
        if(i < contentVideosDownloadQueue.length) {
            video = contentVideosDownloadQueue[i];
            videoElement = document.getElementById(video.id);
            if(!videoElement) {
                dispatch(updateContentImagesDisplayIndex(i+1));
                return;
            }
            if(video.status === "Downloading") {
                contentVideoContainer = document.getElementById('videoContainer_' + video.id);
                progressElement = document.getElementById('progress_' + video.id);
                debugLog(debugOn, "Content video downloading progress: ", video.progress);
                if(contentVideoContainer){
                    if(!progressElement) {
                        progressElement = document.createElement('div');
                        progressElement.className = 'progress';
                        progressElement.id = 'progress_' + video.id;
                        progressElement.style.width = '250px';
                        progressElement.style.margin = 'auto';
                        progressElement.innerHTML = `<div class="progress-bar" id="progressBar_${video.id}" style="width: ${video.progress}%;"></div>`;
                        contentVideoContainer.appendChild(progressElement);
                    }
                    progressBarElement = document.getElementById('progressBar_' + video.id);
                    if(progressBarElement) progressBarElement.style.width = video.progress + '%';
                } else {
                    videoElementClone = videoElement.cloneNode(true);
                    contentVideoContainer = document.createElement('div');
                    contentVideoContainer.style.position = 'relative';
                
                    contentVideoContainer.id = 'videoContainer_' + video.id;
                    contentVideoContainer.appendChild(videoElementClone);
                    videoElement.replaceWith(contentVideoContainer);   
                    
                    progressElement = document.createElement('div');
                    progressElement.className = 'progress';
                    progressElement.id = 'progress_' + video.id;
                    progressElement.style.width = '250px';
                    progressElement.style.margin = 'auto';
                    progressElement.innerHTML = `<div class="progress-bar" id="progressBar_${video.id}" style="width: ${video.progress}%;"></div>`;
                    contentVideoContainer.appendChild(progressElement);
                }
            } else if((video.status === "Downloaded") || (video.status === "DownloadedFromServiceWorker")) {
                contentVideoContainer = document.getElementById('videoContainer_' + video.id);
                progressElement = document.getElementById('progress_' + video.id);
                if(progressElement) contentVideoContainer.removeChild(progressElement);
                videoElement = document.getElementById(video.id);
                let playIcon = contentVideoContainer.parentNode.getElementsByTagName('i')[0];
                if(playIcon) contentVideoContainer.parentNode.removeChild(playIcon);

                const videoSpan = document.createElement('span'); 
                
                videoSpan.className = 'fr-video';
                videoSpan.classList.add('fr-draggable');
                
                videoSpan.setAttribute('contenteditable', 'true');
                videoSpan.setAttribute('draggable', 'true');
                
                const newVideoElement = document.createElement('video');
                newVideoElement.className = 'bSafesVideo';
                newVideoElement.classList.add('fr-draggable');
                newVideoElement.classList.add('fr-dvi');
                newVideoElement.classList.add('fr-fvc');
                newVideoElement.setAttribute('controls', '');
                newVideoElement.innerHTML = 'Your browser does not support HTML5 video.';
                newVideoElement.id = videoElement.id;
                newVideoElement.src = video.src;
                newVideoElement.style = videoElement.style;
                
	            if (videoElement.classList.contains('fr-dib')) videoSpan.classList.add('fr-dvb');
	            if (videoElement.classList.contains('fr-dii')) videoSpan.classList.add('fr-dvi');
	            if (videoElement.classList.contains('fr-fil')) videoSpan.classList.add('fr-fvl');
	            if (videoElement.classList.contains('fr-fic')) videoSpan.classList.add('fr-fvc');
	            if (videoElement.classList.contains('fr-fir')) videoSpan.classList.add('fr-fvr');

                videoSpan.appendChild(newVideoElement);
                videoElement.replaceWith(videoSpan);
                newVideoElement.onprogress =(e) => {
                    debugLog(debugOn, "content video progress");
                    let timeRanges = newVideoElement.buffered;
                    for(let i=0; i< timeRanges.length; i++) {
                        debugLog(debugOn, `start: ${timeRanges.start(i)}, end: ${timeRanges.end(i)}`);
                    }
                }
                newVideoElement.onloadeddata = (e) => {
                    newVideoElement.play();
                }

                dispatch(updateContentVideosDisplayIndex(i+1));
            }          
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps    
    }, [contentVideosDownloadQueue]);

    useEffect(()=>{
        if(contentEditorMode === "ReadOnly"){
            debugLog(debugOn, "ReadOnly");
            
            //buildContentVideos();
           
            contentImagesDownloadQueue.forEach(image => {
                if(image.status === "Downloaded") {
                    const imageElement = document.getElementById(image.id);
                    if(imageElement && imageElement.src.startsWith('http')) {
                        imageElement.src = image.src;
                    }
                }
            });
            
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [contentEditorMode]);

    const photoSwipeGallery = () => {
        return (
            //<!-- Root element of PhotoSwipe. Must have class pswp. -->
            <div ref={pswpRef} className="pswp" tabIndex="-1" role="dialog" aria-hidden="true">
                {/*<!-- Background of PhotoSwipe. It's a separate element as animating opacity is faster than rgba(). -->*/}
                <div className="pswp__bg"></div>
                {/*<!-- Slides wrapper with overflow:hidden. -->*/}
                <div className="pswp__scroll-wrap">
                    {/*<!-- Container that holds slides. PhotoSwipe keeps only 3 of them in the DOM to save memory. Don't modify these 3 pswp__item elements, data is added later on. -->*/}
                    <div className="pswp__container">
                        <div className="pswp__item"></div>
                        <div className="pswp__item"></div>
                        <div className="pswp__item"></div>
                    </div>
    
                    {/*<!-- Default (PhotoSwipeUI_Default) interface on top of sliding area. Can be changed. -->*/}
                    <div className="pswp__ui pswp__ui--hidden">
                        <div className="pswp__top-bar">
                        {/*<!--  Controls are self-explanatory. Order can be changed. -->*/}
                            <div className="pswp__counter"></div>
                            <button className="pswp__button pswp__button--close" title="Close (Esc)"></button>
                            <button className="pswp__button pswp__button--share" title="Share"></button>
                            <button className="pswp__button pswp__button--fs" title="Toggle fullscreen"></button>
                            <button className="pswp__button pswp__button--zoom" title="Zoom in/out"></button>
                        {/*<!-- Preloader demo http://codepen.io/dimsemenov/pen/yyBWoR -->*/}
                        {/*<!-- element will get class pswp__preloader active when preloader is running -->*/}
                            <div className="pswp__preloader">
                                <div className="pswp__preloader__icn">
                                    <div className="pswp__preloader__cut">
                                    <div className="pswp__preloader__donut"></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="pswp__share-modal pswp__share-modal--hidden pswp__single-tap">
                            <div className="pswp__share-tooltip"></div> 
                        </div>
                        <button className="pswp__button pswp__button--arrow--left" title="Previous (arrow left)">
                        </button>
                        <button className="pswp__button pswp__button--arrow--right" title="Next (arrow right)">
                        </button>
                        <div className="pswp__caption">
                            <div className="pswp__caption__center"></div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }


    return (
        <>
            { (((activity !== 'Done' && activity !== 'Error'))) &&
                        
                <Spinner className={BSafesStyle.screenCenter} animation='border' />    
                  
            }
            <Row className="justify-content-center">
                <Col md="10">
                    <hr />
                </Col>
            </Row>
            <Row className="justify-content-center">
                <Col md="10" >
                    <Editor editorId="title" mode={titleEditorMode} content={titleEditorContent} onContentChanged={handleContentChanged} onPenClicked={handlePenClicked} editable={!editingEditorId && (activity === "Done")} />
                </Col> 
            </Row>
            <Row className="justify-content-center">
                <Col md="10">
                    <hr />
                </Col>
            </Row>
            <Row className="justify-content-center">
                <Col className="contenEditorRow"  xs="12" md="10" >
                    <Editor editorId="content" mode={contentEditorMode} content={contentEditorContent} onContentChanged={handleContentChanged} onPenClicked={handlePenClicked} editable={!editingEditorId && (activity === "Done")} />
                </Col> 
            </Row>
            <br />
            <br />
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
            <Row className="justify-content-center">
                <Col xs="12" sm="10" lg="8" >
                    {imagePanels}
                </Col>
            </Row>
            <br />
            <div className="attachments">
                <input ref={attachmentsInputRef} onChange={handleAttachments} type="file" multiple className="d-none editControl" id="attachments" />
                <Row>
                    <Col id="attachments" onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop} sm={{span:10, offset:1}} md={{span:8, offset:2}} className={`text-center ${attachmentsDragActive?BSafesStyle.attachmentsDragDropZoneActive:BSafesStyle.attachmentsDragDropZone}`}>
                        <Button id="1" onClick={handleAttachmentButton} variant="link" className="text-dark btn btn-labeled">
                            <h4><i id="1" className="fa fa-paperclip fa-lg" aria-hidden="true"></i></h4>              
                        </Button>
                    </Col>
                </Row>    	
            </div>
            <Row className="justify-content-center">
                <Col xs="12" md="8" >
                    { attachmentPanels }
                </Col>
            </Row>
            <br />
            {photoSwipeGallery()}
            <Comments handleContentChanged={handleContentChanged} handlePenClicked={handlePenClicked} editable={!editingEditorId && (activity === "Done")} />
            <PageCommonControls isEditing={editingEditorId} onWrite={handleWrite} onSave={handleSave} onCancel={handleCancel}/>
        </>
    )
}