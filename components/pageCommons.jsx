import { useEffect, useRef, useState } from "react";
import { useSelector, useDispatch } from 'react-redux'

import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Button from 'react-bootstrap/Button'
import Alert from 'react-bootstrap/Alert';

import { Blocks } from 'react-loader-spinner';

import PhotoSwipe from "photoswipe";
import PhotoSwipeUI_Default from "photoswipe/dist/photoswipe-ui-default";

import Editor from './editor';
import VideoPanel from "./videoPanel";
import ImagePanel from "./imagePanel";
import PageCommonControls from "./pageCommonControls";
import AttachmentPanel from "./attachmentPanel";
import Comments from "./comments";

import BSafesStyle from '../styles/BSafes.module.css'

import { setIOSActivity, updateContentImagesDisplayIndex, downloadVideoThunk, setImageWordsMode, saveImageWordsThunk, saveDraftThunk, saveContentThunk, saveTitleThunk, uploadVideosThunk, setVideoWordsMode, saveVideoWordsThunk, uploadImagesThunk, uploadAttachmentsThunk, setCommentEditorMode, saveCommentThunk, playingContentVideo, getS3SignedUrlForContentUploadThunk, setS3SignedUrlForContentUpload, loadDraftThunk, clearDraft, setDraftLoaded, startDownloadingContentImagesForDraftThunk, loadOriginalContentThunk, setContentType } from "../reduxStore/pageSlice";
import { debugLog } from '../lib/helper';

export default function PageCommons() {
    const debugOn = true;
    const dispatch = useDispatch();

    const workspaceKey = useSelector(state => state.container.workspaceKey);
    const workspaceSearchKey = useSelector(state => state.container.searchKey);
    const workspaceSearchIV = useSelector(state => state.container.searchIV);

    const activity = useSelector(state => state.page.activity);

    const pageItemId = useSelector(state => state.page.id);
    const itemCopy = useSelector(state => state.page.itemCopy);
    const oldVersion = useSelector(state => state.page.oldVersion);
    const [titleEditorMode, setTitleEditorMode] = useState("ReadOnly");
    const titleEditorContent = useSelector(state => state.page.title);
    const [contentEditorMode, setContentEditorMode] = useState("ReadOnly");
    const contentEditorContent = useSelector(state => state.page.content);
    const [contentEditorContentWithImagesAndVideos, setcontentEditorContentWithImagesAndVideos] = useState(null);

    const [editingEditorId, setEditingEditorId] = useState(null);
    const [readyForSaving, setReadyForSaving] = useState(false);

    const S3SignedUrlForContentUpload = useSelector(state => state.page.S3SignedUrlForContentUpload);
    const contentImagesDownloadQueue = useSelector(state => state.page.contentImagesDownloadQueue);
    const contentImagesDisplayIndex = useSelector(state => state.page.contentImagesDisplayIndex);
    const contentImagesAllDownloaded = useSelector(state => state.page.contentImagesAllDownloaded);
    const contentImagesAllDisplayed = (contentImagesDisplayIndex === contentImagesDownloadQueue.length);
    const contentVideosDownloadQueue = useSelector(state => state.page.contentVideosDownloadQueue);
    const videoPanelsState = useSelector(state => state.page.videoPanels);
    const imagePanelsState = useSelector(state => state.page.imagePanels);
    const attachmentPanelsState = useSelector(state => state.page.attachmentPanels);
    const comments = useSelector(state => state.page.comments);
    const draft = useSelector(state => state.page.draft);
    const draftLoaded = useSelector(state => state.page.draftLoaded);
    const [renderingDraft, setRenderingDraft] = useState(false);
    const contentType = useSelector(state => state.page.contentType);

    const spinnerRef = useRef(null);
    const pswpRef = useRef(null);

    const videoFilesInputRef = useRef(null);
    const [videosDragActive, setVideosDragActive] = useState(false);

    const imageFilesInputRef = useRef(null);
    const [imagesDragActive, setImagesDragActive] = useState(false);

    const attachmentsInputRef = useRef(null);
    const [attachmentsDragActive, setAttachmentsDragActive] = useState(false);

    const onVideoClicked = (queueId) => {
        debugLog(debugOn, "onVideoClicked: ", queueId);
        for (const thisPanel of videoPanelsState) {
            if (thisPanel.queueId === queueId) {
                const id = thisPanel.queueId;
                const s3KeyPrefix = thisPanel.s3KeyPrefix;
                const numberOfChunks = thisPanel.numberOfChunks;
                dispatch(downloadVideoThunk({ id, s3KeyPrefix, numberOfChunks, fileName: thisPanel.fileName, fileType: thisPanel.fileType, fileSize: thisPanel.fileSize }));
                break;
            }
        }
    }

    const onImageClicked = (queueId) => {
        debugLog(debugOn, "onImageClicked: ", queueId);

        const slides = [];
        let startingIndex;
        for (let i = 0; i < imagePanelsState.length; i++) {
            const thisPanel = imagePanelsState[i];
            if (thisPanel.status !== "Uploaded" && thisPanel.status !== "Downloaded") continue;
            const item = {};
            item.src = thisPanel.src;
            item.w = thisPanel.width;
            item.h = thisPanel.height;
            slides.push(item);
            if (thisPanel.queueId === queueId) {
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
        if (e.target.tagName === 'I') {
            playVideoElement = e.target.parentNode;
        }
        const videoId = playVideoElement.id.replace('playVideoCenter_', "");
        const containerElement = playVideoElement.parentNode;
        playVideoElement.remove();

        let spinnerElement = createSpinnerForImage(videoId);
        containerElement.appendChild(spinnerElement);
        const id = videoId;
        const idParts = id.split('&');
        if (idParts[0] === 'chunks') {
            let s3KeyPrefix = idParts[3];
            let numberOfChunks = parseInt(idParts[1]);
            let fileName = idParts[2];
            let fileSize = parseInt(idParts[5]);
            let fileType = idParts[4];
            dispatch(downloadVideoThunk({ fromContent: true, id, s3KeyPrefix, numberOfChunks, fileName, fileType, fileSize }));
        } else {
            let s3Key = idParts[0];
            dispatch(downloadVideoThunk({ id, s3Key }));
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

        let contentByDOM = document.querySelector('.contenEditorRow').querySelector('.inner-html');
        if (contentByDOM)
            setcontentEditorContentWithImagesAndVideos(contentByDOM.innerHTML);
        dispatch(getS3SignedUrlForContentUploadThunk());
        setContentEditorMode("Writing");

    }

    const handleDraftSample = (content) => {
        debugLog(debugOn, "draft content: ", content);
        dispatch(saveDraftThunk({ content }))
    }

    const handleDraftClicked = () => {
        dispatch(loadDraftThunk());
    }

    const handleDraftDelete = () => {
        dispatch(clearDraft());
    }

    function afterContentReadOnly() {

    }

    const handlePenClicked = (editorId, purpose) => {
        debugLog(debugOn, `pen ${editorId} clicked ${purpose}`);
        let thisReadyForSaving = true;
        if(editorId === 'content') {
            if (purpose === 'froala')
                dispatch(setContentType('WritingPage'));
            else if (purpose === 'excalidraw') {
                dispatch(setContentType('DrawingPage'));
            }
        } 
        if (editorId === 'content') {
            beforeWritingContent();
            setEditingEditorId("content");
            thisReadyForSaving = false;
        } else if (editorId === 'title') {
            setTitleEditorMode("Writing");
            setEditingEditorId("title");
        } else if (editorId.startsWith("video_")) {
            const videoIndex = parseInt(editorId.split("_")[1]);
            dispatch(setVideoWordsMode({ index: videoIndex, mode: "Writing" }));
            setEditingEditorId(editorId);
        } else if (editorId.startsWith("image_")) {
            const imageIndex = parseInt(editorId.split("_")[1]);
            dispatch(setImageWordsMode({ index: imageIndex, mode: "Writing" }));
            setEditingEditorId(editorId);
        } else if (editorId.startsWith("comment_")) {
            dispatch(setCommentEditorMode({ index: editorId, mode: "Writing" }));
            setEditingEditorId(editorId);
        }
        setReadyForSaving(thisReadyForSaving);
    }

    const handleContentChanged = (editorId, content) => {
        debugLog(debugOn, `editor-id: ${editorId} content: ${content}`);

        if (editingEditorId === "content") {
            if (contentType === "DrawingPage" || content !== contentEditorContent) {
                dispatch(saveContentThunk({ content, workspaceKey }));
            } else {
                setEditingEditorMode("ReadOnly");
                setEditingEditorId(null);
            }
        } else if (editingEditorId === "title") {
            if (content !== titleEditorContent) {
                dispatch(saveTitleThunk(content, workspaceKey, workspaceSearchKey, workspaceSearchIV));
            } else {
                setEditingEditorMode("ReadOnly");
                setEditingEditorId(null);
            }
        } else if (editingEditorId.startsWith("video_")) {
            const videoIndex = parseInt(editingEditorId.split("_")[1]);
            console.log(content, videoPanelsState[videoIndex].words)
            if (content !== videoPanelsState[videoIndex].words) {
                dispatch(saveVideoWordsThunk({ index: videoIndex, content: content }));
            } else {
                dispatch(setVideoWordsMode({ index: videoIndex, mode: "ReadOnly" }));
                setEditingEditorId(null);
            }
        } else if (editingEditorId.startsWith("image_")) {
            const imageIndex = parseInt(editingEditorId.split("_")[1]);
            if (content !== imagePanelsState[imageIndex].words) {
                dispatch(saveImageWordsThunk({ index: imageIndex, content: content }));
            } else {
                dispatch(setImageWordsMode({ index: imageIndex, mode: "ReadOnly" }));
                setEditingEditorId(null);
            }
        } else if (editingEditorId.startsWith("comment_")) {
            if (editingEditorId !== 'comment_New') {
                let index = parseInt(editingEditorId.split('_')[1]);
                if (comments[index].content === content) {
                    dispatch(setCommentEditorMode({ index: editingEditorId, mode: "ReadOnly" }));
                    setEditingEditorId(null);
                    return;
                }
            }
            dispatch(saveCommentThunk({ index: editingEditorId, content }));
        }
    }

    const videoPanels = videoPanelsState.map((item, index) =>
        <VideoPanel key={item.queueId} panelIndex={"video_" + index} panel={item} onVideoClicked={onVideoClicked} editorMode={item.editorMode} onPenClicked={handlePenClicked} onContentChanged={handleContentChanged} editable={!editingEditorId && (activity === 0)} />
    )

    const imagePanels = imagePanelsState.map((item, index) =>
        <ImagePanel key={item.queueId} panelIndex={"image_" + index} panel={item} onImageClicked={onImageClicked} editorMode={item.editorMode} onPenClicked={handlePenClicked} onContentChanged={handleContentChanged} editable={!editingEditorId && (activity === 0)} />
    )

    const handleWrite = () => {
        debugLog(debugOn, "handleWrite");
        beforeWritingContent();
        setEditingEditorId("content");
    }

    const setEditingEditorMode = (mode) => {
        switch (editingEditorId) {
            case 'content':
                setContentEditorMode(mode);
                break;
            case 'title':
                setTitleEditorMode(mode);
                break;
            default:
                if (editingEditorId.startsWith("video_")) {
                    const videoIndex = parseInt(editingEditorId.split("_")[1]);
                    switch (mode) {
                        case "Saving":
                        case "ReadOnly":
                            dispatch(setVideoWordsMode({ index: videoIndex, mode }))
                            break;
                        default:
                    }
                } else if (editingEditorId.startsWith("image_")) {
                    const imageIndex = parseInt(editingEditorId.split("_")[1]);
                    switch (mode) {
                        case "Saving":
                        case "ReadOnly":
                            dispatch(setImageWordsMode({ index: imageIndex, mode }))
                            break;
                        default:
                    }

                } else if (editingEditorId.startsWith("comment_")) {
                    switch (mode) {
                        case "Writing":
                        case "Saving":
                        case "ReadOnly":
                            dispatch(setCommentEditorMode({ index: editingEditorId, mode }))
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
        dispatch(setDraftLoaded(false));
        setReadyForSaving(false);
    }

    const handleCancel = () => {
        debugLog(debugOn, "handleCancel");
        dispatch(setS3SignedUrlForContentUpload(null));
        setEditingEditorMode("ReadOnly");
        setEditingEditorId(null);
        if(!draft && !contentEditorContent){
            dispatch(setContentType(""))
        }
        if (draftLoaded) {
            dispatch(loadOriginalContentThunk());
        }
        dispatch(setDraftLoaded(false));
        setReadyForSaving(false);
    }

    const handleVideoButton = (e) => {
        debugLog(debugOn, "handleVideoBtn");
        e.preventDefault();
        videoFilesInputRef.current.value = null;
        videoFilesInputRef.current?.click();
    };

    const uploadVideos = (files, where) => {
        dispatch(uploadVideosThunk({ files, where, workspaceKey }));
    };

    const handleVideoFiles = (e) => {
        e.preventDefault();
        debugLog(debugOn, "handleVideoFiles: ", e.target.id);
        const files = e.target.files;
        if (files.length) {
            uploadVideos(files, 'top');
        }
    }

    const handleImageButton = (e) => {
        debugLog(debugOn, "handleImageBtn");
        e.preventDefault();
        imageFilesInputRef.current.value = null;
        imageFilesInputRef.current?.click();
    };

    const uploadImages = (files, where) => {
        dispatch(uploadImagesThunk({ files, where, workspaceKey }));
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
        dispatch(uploadAttachmentsThunk({ files, workspaceKey }));
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
        if (e.target.id === "videos") {
            setVideosDragActive(active);
        } else if (e.target.id === "images") {
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

    const handleDrop = function (e) {
        debugLog(debugOn, "handleDrop: ", e.target.id);
        e.preventDefault();
        e.stopPropagation();
        setDragActive(e, false);

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            debugLog(debugOn, "handleDrop, at least one file.");
            // at least one file has been dropped so do something
            // handleFiles(e.dataTransfer.files);
            if (e.target.id === 'videos') {
                const videoType = /video.*/;
                const videos = [];
                for (const file of e.dataTransfer.files) {
                    if (!file.type.match(videoType)) {
                        debugLog(debugOn, "Not an image.");
                    }
                    else videos.push(file);
                }
                uploadVideos(videos, 'top');
            } else if (e.target.id === 'images') {
                const imageType = /image.*/;
                const images = [];
                for (const file of e.dataTransfer.files) {
                    if (!file.type.match(imageType)) {
                        debugLog(debugOn, "Not an image.");
                    }
                    else images.push(file);
                }
                uploadImages(images, 'top');
            } else if (e.target.id === 'attachments') {
                debugLog(debugOn, "handleDrop attachments: ", e.dataTransfer.files.length);
                const attachments = [];
                for (const file of e.dataTransfer.files) {
                    attachments.push(file);
                }
                uploadAttachments(attachments);
            }
        }
        setDragActive(e, false);
    };

    const handleContentWritingModeReady = (e) => {
        return;
    }

    const buildContentImagesGallery = (selectedId) => {
        debugLog(debugOn, "buildContentImagesGallery");
        const slides = [];
        let startingIndex;
        const images = document.querySelectorAll(".bSafesImage");
        images.forEach((image) => {
            if (image.src.startsWith("blob")) {
                const item = {};
                const id = image.id;
                const idParts = id.split('&');
                const dimension = idParts[1];
                const dimensionParts = dimension.split('x');
                item.src = image.src;
                item.w = dimensionParts[0];
                item.h = dimensionParts[1];
                slides.push(item);
                if ((image.id === selectedId)) {
                    startingIndex = slides.length - 1;
                }
            }
        });
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

    const handleContentReadOnlyModeReady = (e) => {
        const bSafesDownloadVideoImages = document.getElementsByClassName('bSafesDownloadVideo');
        for (let i = 0; i < bSafesDownloadVideoImages.length; i++) {
            let image = bSafesDownloadVideoImages[i];
            let containerElement = image.parentNode;
            let playVideoElement = createPlayVideoButton(image);
            containerElement.appendChild(playVideoElement);
            playVideoElement.onclick = handleVideoClick;
        }

        const images = document.querySelectorAll(".bSafesImage");
        images.forEach((item) => {
            if (item.src.startsWith("blob")) {
                item.onclick = () => {
                    buildContentImagesGallery(item.id);
                }
            }
        });

        return;
    }

    const iOSActivityWebCallFromIOS = (data) => {
        debugLog(debugOn, "iOSActivityWebCallFromIOS", data);
        dispatch(setIOSActivity(data.activity))
    }

    useEffect(() => {
        debugLog(debugOn, "pageCommons mounted.");
        if (process.env.NEXT_PUBLIC_platform === 'iOS') {
            window.bsafesNative.iOSActivityWebCall = iOSActivityWebCallFromIOS
        }
    }, []);

    useEffect(() => {
        setcontentEditorContentWithImagesAndVideos(null);
    }, [pageItemId])

    useEffect(() => {
        if (activity === 0) {
            if (editingEditorId) {
                setEditingEditorMode("ReadOnly");
                setEditingEditorId(null);
            }
        } else if (activity === "Error") {
            if (editingEditorId) {
                setEditingEditorMode("Writing");
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activity]);

    useEffect(() => {
        if (contentEditorContent === null) return;
        afterContentReadOnly();
        setcontentEditorContentWithImagesAndVideos(contentEditorContent);
        // eslint-disable-next-line react-hooks/exhaustive-deps    
    }, [contentEditorContent]);

    useEffect(() => {
        if (draftLoaded && !renderingDraft) return;
        let image, imageElement, containerElement;
        let i = contentImagesDisplayIndex;

        const videoControlsElements = document.querySelectorAll(".videoControls");
        videoControlsElements.forEach((item) => {
            item.remove();
        });

        if (i < contentImagesDownloadQueue.length) {
            image = contentImagesDownloadQueue[i];
            imageElement = document.getElementById(image.id);
            if (!imageElement) {
                dispatch(updateContentImagesDisplayIndex(i + 1));
                return;
            }

            if (!imageElement.parentNode.classList.contains('bsafesMediaContainer')) {
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
                let spinnerElement = document.getElementById('spinner_' + image.id);
                if (!spinnerElement) {
                    let spinnerElement = createSpinnerForImage(image.id);
                    containerElement.appendChild(spinnerElement);
                }
            }
            if (image.status === "Downloading") {

                return;
            } else if ((image.status === "Downloaded") || (image.status === "DownloadFailed")) {

                let spinnerElement = document.getElementById('spinner_' + image.id);
                if (spinnerElement) spinnerElement.remove();
                if (image.status === "Downloaded") {
                    imageElement.src = image.src;
                }
                if (imageElement.classList.contains('bSafesDownloadVideo')) {
                    let playVideoCenterElement = null;
                    playVideoCenterElement = document.getElementById('playVideoCenter_' + image.id)

                    if (!playVideoCenterElement && contentEditorMode === 'ReadOnly') {
                        playVideoCenterElement = createPlayVideoButton(image);
                        containerElement.appendChild(playVideoCenterElement);

                    }
                    if (contentEditorMode === 'ReadOnly') playVideoCenterElement.onclick = handleVideoClick;
                } else {
                    imageElement.onload = () => {
                        imageElement.onclick = () => {
                            buildContentImagesGallery(imageElement.id);
                        }
                    }
                }
                dispatch(updateContentImagesDisplayIndex(i + 1));
            }

        }
        // eslint-disable-next-line react-hooks/exhaustive-deps    
    }, [contentImagesDownloadQueue, renderingDraft]);

    useEffect(() => {
        let video, videoElement;

        for (let i = 0; i < contentVideosDownloadQueue.length; i++) {
            video = contentVideosDownloadQueue[i];
            const videoId = video.id;
            videoElement = document.getElementById(videoId);

            if (video.status === "Downloading") {

            } else if ((video.status === "Downloaded") || (video.status === "DownloadedFromServiceWorker")) {
                let spinnerElement = document.getElementById('spinner_' + videoId);
                if (spinnerElement) spinnerElement.remove();
                if (!videoElement.classList.contains('fr-video')) {
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
                    dispatch(playingContentVideo({ itemId: pageItemId, indexInQueue: i }));
                }

            }
        }

        // eslint-disable-next-line react-hooks/exhaustive-deps    
    }, [contentVideosDownloadQueue]);

    useEffect(() => {
        if (contentEditorMode === "ReadOnly") {
            debugLog(debugOn, "ReadOnly");
            afterContentReadOnly();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [contentEditorMode]);

    useEffect(() => {
        if (!draftLoaded) return;
        setRenderingDraft(true);
    }, [draftLoaded]);

    useEffect(() => {
        if (renderingDraft) {
            dispatch(startDownloadingContentImagesForDraftThunk());
        }
    }, [renderingDraft]);

    useEffect(() => {
        if (contentImagesAllDownloaded && draftLoaded) {
            handleWrite();
            setWritingAfterDraftLoaded(false);
            setRenderingDraft(false);
        }
    }, [contentImagesAllDownloaded, draftLoaded]);

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
        <div className="pageCommons">
            <Row className="justify-content-center">
                <Col sm="10">
                    <hr />
                </Col>
            </Row>
            <Row className="justify-content-center">
                <Col sm="10" >
                    <Editor editorId="title" showWriteIcon={true} mode={titleEditorMode} content={titleEditorContent} onContentChanged={handleContentChanged} onPenClicked={handlePenClicked} editable={!editingEditorId && (activity === 0) && (!oldVersion)} />
                </Col>
            </Row>
            <Row className="justify-content-center">
                <Col sm="10">
                    <hr />
                </Col>
            </Row>
            <Row className="justify-content-center">
                <Col className={`${BSafesStyle.contentEditorRow} contenEditorRow`} xs="12" sm="10" >
                    <Editor editorId="content" showDrawIcon={!contentType || contentType === 'DrawingPage'} showWriteIcon={!contentType || contentType === 'WritingPage'} mode={contentEditorMode} content={contentEditorContentWithImagesAndVideos || contentEditorContent} onContentChanged={handleContentChanged} onPenClicked={handlePenClicked} editable={!editingEditorId && (activity === 0) && (!oldVersion) && contentImagesAllDisplayed} writingModeReady={handleContentWritingModeReady} readOnlyModeReady={handleContentReadOnlyModeReady} onDraftSampled={handleDraftSample} onDraftClicked={handleDraftClicked} onDraftDelete={handleDraftDelete} />
                </Col>
            </Row>
            <br />
            <br />
            {(!editingEditorId && (activity === 0) && (!oldVersion)) &&
                <div className="videos">
                    <input ref={videoFilesInputRef} onChange={handleVideoFiles} type="file" accept="video/*" multiple className="d-none editControl" id="videos" />
                    <Row>
                        <Col id="videos" onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop} sm={{ span: 10, offset: 1 }} md={{ span: 8, offset: 2 }} className={`text-center ${videosDragActive ? BSafesStyle.videosDragDropZoneActive : BSafesStyle.videosDragDropZone}`}>
                            <Button id="videos" onClick={handleVideoButton} variant="link" className="text-dark btn btn-labeled">
                                <h4><i id="videos" className="fa fa-video-camera fa-lg" aria-hidden="true"></i></h4>
                            </Button>
                        </Col>
                    </Row>
                </div>
            }
            <Row className="justify-content-center">
                <Col xs="12" md="8" >
                    {videoPanels}
                </Col>
            </Row>
            <br />
            {(!editingEditorId && (activity === 0) && (!oldVersion)) &&
                <div className="images">
                    <input ref={imageFilesInputRef} onChange={handleImageFiles} type="file" multiple accept="image/*" className="d-none editControl" id="images" />
                    <Row>
                        <Col id="images" onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop} sm={{ span: 10, offset: 1 }} md={{ span: 8, offset: 2 }} className={`text-center ${imagesDragActive ? BSafesStyle.imagesDragDropZoneActive : BSafesStyle.imagesDragDropZone}`}>
                            <Button id="images" onClick={handleImageButton} variant="link" className="text-dark btn btn-labeled">
                                <h4><i id="images" className="fa fa-picture-o fa-lg" aria-hidden="true"></i></h4>
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
            {(!editingEditorId && (activity === 0) && (!oldVersion)) &&
                <div className="attachments">
                    <input ref={attachmentsInputRef} onChange={handleAttachments} type="file" multiple className="d-none editControl" id="attachments" />
                    <Row>
                        <Col id="attachments" onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop} sm={{ span: 10, offset: 1 }} md={{ span: 8, offset: 2 }} className={`text-center ${attachmentsDragActive ? BSafesStyle.attachmentsDragDropZoneActive : BSafesStyle.attachmentsDragDropZone}`}>
                            <Button id="attachments" onClick={handleAttachmentButton} variant="link" className="text-dark btn btn-labeled">
                                <h4><i id="attachments" className="fa fa-paperclip fa-lg" aria-hidden="true"></i></h4>
                            </Button>
                        </Col>
                    </Row>
                </div>
            }
            <Row className="justify-content-center">
                <Col xs="12" md="8" >
                    {attachmentPanels}
                </Col>
            </Row>
            <br />
            {photoSwipeGallery()}
            {false && itemCopy && <Comments handleContentChanged={handleContentChanged} handlePenClicked={handlePenClicked} editable={!editingEditorId && (activity === 0) && (!oldVersion)} />}
            {true &&
                <PageCommonControls isEditing={editingEditorId} onWrite={handleWrite} readyForSaving={(S3SignedUrlForContentUpload !== null) || readyForSaving} onSave={handleSave} onCancel={handleCancel} canEdit={(!editingEditorId && (activity === 0) && (!oldVersion) && contentImagesAllDisplayed)} />
            }
            {!contentImagesAllDisplayed &&
                <div className='fixed-bottom'>
                    <Alert variant='info'>
                        Loading contents, please wait ...
                    </Alert>
                </div>
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
        </div>
    )
}