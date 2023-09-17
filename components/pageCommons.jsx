import { useEffect, useRef, useState } from "react";
import { useSelector, useDispatch } from 'react-redux'

import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Button from 'react-bootstrap/Button'

import { Blocks } from  'react-loader-spinner';

import PhotoSwipe from "photoswipe";
import PhotoSwipeUI_Default from "photoswipe/dist/photoswipe-ui-default";

import Editor from './editor';
import ImagePanel from "./imagePanel";
import PageCommonControls from "./pageCommonControls";
import AttachmentPanel from "./attachmentPanel";
import Comments from "./comments";

import BSafesStyle from '../styles/BSafes.module.css'

import { updateContentImagesDisplayIndex, downloadContentVideoThunk, setImageWordsMode, saveImageWordsThunk, saveContentThunk, saveTitleThunk, uploadImagesThunk, uploadAttachmentsThunk, setCommentEditorMode, saveCommentThunk, playingContentVideo } from "../reduxStore/pageSlice";
import { debugLog } from '../lib/helper';

export default function PageCommons() {
    const debugOn = true;
    const dispatch = useDispatch();

    const workspaceKey = useSelector( state => state.container.workspaceKey);
    const workspaceSearchKey = useSelector( state => state.container.searchKey);
    const workspaceSearchIV = useSelector( state => state.container.searchIV);

    const activity = useSelector( state => state.page.activity);

    const pageItemId = useSelector(state => state.page.id);
    const oldVersion = useSelector(state=>state.page.oldVersion);
    const [titleEditorMode, setTitleEditorMode] = useState("ReadOnly");
    const titleEditorContent = useSelector(state => state.page.title);
    const titleText = useSelector(state => state.page.titleText);
    const [contentEditorMode, setContentEditorMode] = useState("ReadOnly");
    const contentEditorContent = useSelector(state => state.page.content);
    const [contentEditorContentWithImagesAndVideos, setcontentEditorContentWithImagesAndVideos] = useState(null);
    
    const [editingEditorId, setEditingEditorId] = useState(null);

    const contentImagesDownloadQueue = useSelector( state => state.page.contentImagesDownloadQueue);
    const contentImagesDisplayIndex = useSelector( state => state.page.contentImagesDisplayIndex);
    const contentImagesAllDisplayed = (contentImagesDisplayIndex === contentImagesDownloadQueue.length);

    const contentVideosDownloadQueue = useSelector( state => state.page.contentVideosDownloadQueue);

    const imagePanelsState = useSelector(state => state.page.imagePanels);
    const attachmentPanelsState = useSelector(state => state.page.attachmentPanels);
    const comments = useSelector(state => state.page.comments);

    const spinnerRef = useRef(null);
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
            history: false,
            index: startingIndex // start at first slide
        };
        const gallery = new PhotoSwipe(pswpElement, PhotoSwipeUI_Default, slides, options);
        gallery.init();
    }

    const handleVideoClick = (e) => {
        let playVideoElement = e.target;
        if(e.target.tagName === 'I') {
            playVideoElement = e.target.parentNode;
        }
        const videoId = playVideoElement.id.replace('playVideoCenter_',"");
        const containerElement = playVideoElement.parentNode;
        playVideoElement.remove();
        
        let spinnerElement = createSpinnerForImage(videoId);
        containerElement.appendChild(spinnerElement);
        const id =  videoId;
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

    function createSpinnerForImage(imageId) {
        let spinnerElement = spinnerRef.current.cloneNode(true);
        spinnerElement.className = 'bsafesImageSpinner';
        spinnerElement.id = 'spinner_' + imageId;
        spinnerElement.style.position = 'absolute';
        spinnerElement.style.textAlign = 'center';
        spinnerElement.removeAttribute('hidden');
        return spinnerElement;
    }

    function createPlayVideoButton(image) {        
        let playVideoCenterElement = document.createElement('div');
        let playVideoId = 'playVideoCenter_' + image.id;
        let playVideoButtonId = 'playVideoButton_' + image.id;
        playVideoCenterElement.className = 'bsafesPlayVideo';
        playVideoCenterElement.id = playVideoId;
        playVideoCenterElement.style.position = 'absolute';
        playVideoCenterElement.style.width = '100px';
        playVideoCenterElement.style.borderRadius = '10px';
        playVideoCenterElement.style.textAlign = 'center';
        playVideoCenterElement.style.background = 'white';
        playVideoCenterElement.style.opacity = '0.5';
        playVideoCenterElement.innerHTML = `<i class="fa fa-play-circle-o fa-4x text-danger" id=${playVideoButtonId} aria-hidden="true"></i>`;
        return playVideoCenterElement;
    }

    function beforeWritingContent() {
        const spinners = document.querySelectorAll('.bsafesImageSpinner');
        spinners.forEach((spinner) => {
            spinner.remove();
        });
        
        const playVideos = document.querySelectorAll('.bsafesPlayVideo');
        playVideos.forEach((playVideo) => {
            playVideo.remove();
        });
        
        let contentByDOM = document.querySelector('.contenEditorRow').querySelector('.inner-html').innerHTML;
        setcontentEditorContentWithImagesAndVideos(contentByDOM);
        setContentEditorMode("Writing");
    }

    function afterContentReadOnly() {
        
    }

    const handlePenClicked = (editorId) => {
        debugLog(debugOn, `pen ${editorId} clicked`);
        if(editorId === 'content'){
            beforeWritingContent();
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
        <ImagePanel key={item.queueId} panelIndex={"image_" + index} panel={item} onImageClicked={onImageClicked} editorMode={item.editorMode} onPenClicked={handlePenClicked} onContentChanged={handleContentChanged} editable={!editingEditorId && (activity === 0)} />
    )

    const handleWrite = () =>{
        debugLog(debugOn, "handleWrite");
        beforeWritingContent();
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

    const attachmentPanelsNewOnTop = attachmentPanels.reverse();

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
        debugLog(debugOn, "handleDrag", e.type);
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
                const images = [];
                for(const file of e.dataTransfer.files) {
                    if (!file.type.match(imageType)) {
                        debugLog(debugOn, "Not an image.");
                    }
                    else images.push(file);
                }
                uploadImages(images, 'top');
            } else if (e.target.id === 'attachments') {
                const attachments = [];
                for(const file of e.dataTransfer.files) {
                    attachments.push(file);
                }
                uploadAttachments(attachments, 'top');
            }
        }
    };

    const handleContentWritingModeReady = (e) => {
        return;
    }

    const handleContentReadOnlyModeReady = (e) => {
        const bSafesDownloadVideoImages = document.getElementsByClassName('bSafesDownloadVideo');
        for(let i=0; i<bSafesDownloadVideoImages.length; i++){
            let image = bSafesDownloadVideoImages[i];
            let containerElement = image.parentNode;
            let playVideoElement = createPlayVideoButton(image);
            containerElement.appendChild(playVideoElement);
            playVideoElement.onclick = handleVideoClick;
        }
        return;
    }
    
    useEffect(() => {
        debugLog(debugOn, "pageCommons mounted.");
    }, []);

    useEffect(()=> {
        setcontentEditorContentWithImagesAndVideos(null);
    }, [pageItemId])

    useEffect(() => {
        if(activity === 0) {
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
        afterContentReadOnly();
        setcontentEditorContentWithImagesAndVideos(contentEditorContent);
    // eslint-disable-next-line react-hooks/exhaustive-deps    
    }, [contentEditorContent]);

    useEffect(()=> {
        let image, imageElement, containerElement;
        let i = contentImagesDisplayIndex;
        
        const videoControlsElements = document.querySelectorAll(".videoControls");
            videoControlsElements.forEach((item) => {
            item.remove();
        }); 

        if(i < contentImagesDownloadQueue.length) {
            image = contentImagesDownloadQueue[i];
            imageElement = document.getElementById(image.id);
            if(!imageElement) {
                dispatch(updateContentImagesDisplayIndex(i+1));
                return;
            }

            if(!imageElement.parentNode.classList.contains('bsafesMediaContainer')){
                containerElement = document.createElement('div');
                containerElement.className = 'bsafesMediaContainer';
                containerElement.style.display = 'flex';
                containerElement.style.alignItems = 'center';
                containerElement.style.justifyContent = 'center';
                let imageElementClone = imageElement.cloneNode(true);
                containerElement.appendChild(imageElementClone);
                imageElement.replaceWith(containerElement);
                imageElement = imageElementClone;
                let spinnerElement = createSpinnerForImage(image.id);
                containerElement.appendChild(spinnerElement);
            } else {
                containerElement = imageElement.parentNode;
                let spinnerElement =  document.getElementById('spinner_' + image.id);
                if(!spinnerElement) {
                    let spinnerElement = createSpinnerForImage(image.id);
                    containerElement.appendChild(spinnerElement);
                }
            }
            if(image.status === "Downloading") {
  
                return;
            } else if((image.status === "Downloaded") || (image.status === "DownloadFailed")) {
             
                let spinnerElement =  document.getElementById('spinner_' + image.id);
                if(spinnerElement) spinnerElement.remove();
                if(image.status === "Downloaded") {
                    imageElement.src = image.src;
                }
                if(imageElement.classList.contains('bSafesDownloadVideo')){
                    let playVideoCenterElement = null;
                    playVideoCenterElement = document.getElementById('playVideoCenter_' + image.id)
                    
                    if(!playVideoCenterElement && contentEditorMode === 'ReadOnly') {
                        playVideoCenterElement = createPlayVideoButton(image);
                        containerElement.appendChild(playVideoCenterElement);

                    } 
                    if(contentEditorMode === 'ReadOnly') playVideoCenterElement.onclick = handleVideoClick;
                }
                dispatch(updateContentImagesDisplayIndex(i+1));
            } 
            
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps    
    }, [contentImagesDownloadQueue]);

    useEffect(()=> {
        let video, videoElement;
        
        for(let i=0; i< contentVideosDownloadQueue.length; i++) {
            video = contentVideosDownloadQueue[i];
            const videoId = video.id;
            videoElement = document.getElementById(videoId);

            if(video.status === "Downloading") {                    

            } else if((video.status === "Downloaded") || (video.status === "DownloadedFromServiceWorker")) {
                let spinnerElement = document.getElementById('spinner_' + videoId);
                if(spinnerElement) spinnerElement.remove();
                if(!videoElement.classList.contains('fr-video')){
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
                    newVideoElement.id = videoId;
                    newVideoElement.src = video.src;
                    newVideoElement.style = videoElement.style;
                    
                    newVideoElement.addEventListener("loadeddata", (event) => {
                        newVideoElement.play();  
                    });

	                if (videoElement.classList.contains('fr-dib')) videoSpan.classList.add('fr-dvb');
	                if (videoElement.classList.contains('fr-dii')) videoSpan.classList.add('fr-dvi');
	                if (videoElement.classList.contains('fr-fil')) videoSpan.classList.add('fr-fvl');
	                if (videoElement.classList.contains('fr-fic')) videoSpan.classList.add('fr-fvc');
	                if (videoElement.classList.contains('fr-fir')) videoSpan.classList.add('fr-fvr');

                    videoSpan.appendChild(newVideoElement);
                    videoElement.replaceWith(videoSpan);
                    dispatch(playingContentVideo({itemId: pageItemId, indexInQueue: i}));
                }
                
            }
        }
        
    // eslint-disable-next-line react-hooks/exhaustive-deps    
    }, [contentVideosDownloadQueue]);

    useEffect(()=>{
        if(contentEditorMode === "ReadOnly"){
            debugLog(debugOn, "ReadOnly");
            afterContentReadOnly();
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
            <Row className="justify-content-center">
                <Col sm="10">
                    <hr />
                </Col>
            </Row>
            <Row className="justify-content-center">
                <Col sm="10" >
                    <Editor editorId="title" mode={titleEditorMode} content={titleEditorContent} onContentChanged={handleContentChanged} onPenClicked={handlePenClicked} editable={!editingEditorId && (activity === 0) && (!oldVersion) } />
                </Col> 
            </Row>
            <Row className="justify-content-center">
                <Col sm="10">
                    <hr />
                </Col>
            </Row>
            <Row className="justify-content-center">
                <Col className="contenEditorRow"  xs="12" sm="10" >
                    <Editor editorId="content" mode={contentEditorMode} content={contentEditorContentWithImagesAndVideos || contentEditorContent} onContentChanged={handleContentChanged} onPenClicked={handlePenClicked} editable={!editingEditorId && (activity === 0) && (!oldVersion) && contentImagesAllDisplayed}  writingModeReady={handleContentWritingModeReady} readOnlyModeReady={handleContentReadOnlyModeReady}/>
                </Col> 
            </Row>
            <br />
            <br />
            { (!editingEditorId && (activity === 0) && (!oldVersion)) && 
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
            }
            <Row className="justify-content-center">
                <Col xs="12" sm="10" lg="8" >
                    {imagePanels}
                </Col>
            </Row>
            <br />
            { (!editingEditorId && (activity === 0) && (!oldVersion)) && 
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
            }
            <Row className="justify-content-center">
                <Col xs="12" md="8" >
                    { attachmentPanelsNewOnTop }
                </Col>
            </Row>
            <br />
            {photoSwipeGallery()}
            <Comments handleContentChanged={handleContentChanged} handlePenClicked={handlePenClicked} editable={!editingEditorId && (activity === 0) && (!oldVersion)} />
            {   true &&
                <PageCommonControls isEditing={editingEditorId} onWrite={handleWrite} onSave={handleSave} onCancel={handleCancel} canEdit={(!editingEditorId && (activity === 0) && (!oldVersion) && contentImagesAllDisplayed)}/>
            }
            <div ref={spinnerRef} className='bsafesMediaSpinner' hidden>
                <Blocks
                    visible={true}
                    height="80"
                    width="80"
                    ariaLabel="blocks-loading"
                    wrapperStyle={{}}
                    wrapperClass="blocks-wrapper"
                />
            </div> 
        </>
    )
}