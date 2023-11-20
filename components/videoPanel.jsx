import { useEffect, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Button from 'react-bootstrap/Button'
import DropdownButton from 'react-bootstrap/DropdownButton'
import Dropdown from 'react-bootstrap/Dropdown'
import ProgressBar from 'react-bootstrap/ProgressBar'
import Image from 'react-bootstrap/Image'

import jquery from "jquery"
const axios = require('axios');

import Editor from './editor'

import { uploadVideosThunk, deleteAVideoThunk } from '../reduxStore/pageSlice'
import { debugLog } from '../lib/helper';

export default function VideoPanel({ panelIndex, panel, onVideoClicked, editorMode, onContentChanged, onPenClicked, editable = true }) {
    const debugOn = true;
    const dispatch = useDispatch();

    const videoFilesInputRef = useRef(null);
    const s3KeyPrefix = panel.s3KeyPrefix;

    const workspaceKey = useSelector(state => state.container.workspaceKey);
    const itemId = useSelector(state => state.page.id);

    const [snapshotTaken, setSnapshotTaken] = useState(false);

    const handleVideoClicked = () => {
        onVideoClicked(panel.queueId);
    }

    const handlePenClicked = () => {
        onPenClicked(panelIndex);
    }

    const handleDelete = () => {
        const confirmDelete = confirm('Are you sure you want to delete this video?');
        if (confirmDelete) {
            dispatch(deleteAVideoThunk({ panel }));
        }
    }

    const handleVideoButton = (e) => {
        debugLog(debugOn, "handleVideoBtn");
        e.preventDefault();
        videoFilesInputRef.current.value = null;
        videoFilesInputRef.current?.click();
    };

    const handleVideoFiles = (e) => {
        e.preventDefault();
        debugLog(debugOn, "handleVideoFiles: ", e.target.id);
        const files = e.target.files;
        if (files.length) {
            uploadVideos(files, panelIndex);
        }
    }

    const uploadVideos = (files, where) => {
        dispatch(uploadVideosThunk({ files, where, workspaceKey }));
    };

    const onLoadedMetadata = (e) => {
        debugLog(debugOn, 'onLoadedMetaData ..., autoplay muted ');
    }
    const onLoadedData = (e) => {
        debugLog(debugOn, 'onLoadedData ...');
    }

    const onCanPlay = (event) => {
        debugLog(debugOn, 'onCanPlay ...');
    };

    const onPlaying = (e) => {
        debugLog(debugOn, 'onPlaying ...');
        getVideoSnapshot(e.target)

    }

    async function getVideoSnapshot(video) {

        let $canvas = $('<canvas hidden id = "canvas" width = "640" height = "300"></canvas>');
        let canvas = $canvas[0];
        $canvas.insertAfter('body');
        let ratio = video.videoWidth/video.videoHeight;
    
        let myWidth = 640; 
        let myHeight = parseInt(myWidth/ratio,10);
        canvas.width = myWidth;
        canvas.height = myHeight;
        let context = canvas.getContext('2d');

        const uploadSnapshot = async (data) => {
          let timeStamp = s3KeyPrefix.split(':').pop(); 
          try {
            let result = await preS3ChunkUpload(itemId, getEditorConfig().videoThumbnailIndex, timeStamp);
            let signedURL = result.signedURL;
                      
            const config = {
                onUploadProgress: async (progressEvent) => {
                    let percentCompleted = Math.ceil(progressEvent.loaded*100/progressEvent.total);
                    debugLog(debugOn, `Upload progress: ${progressEvent.loaded}/${progressEvent.total} ${percentCompleted} `);
                },
                headers: {
                    'Content-Type': 'binary/octet-stream'
                }
            }

            await axios.put(signedURL, Buffer.from(data, 'binary'), config); 
        } catch (error) {
            console.log("uploadSnapshot failed");
          }
        }

        const takeAShot = () => {
          if(snapshotTaken) return;
          console.log("takeAShot...");
          console.log("snapshotTaken", snapshotTaken);
          
          context.fillRect(0,0,myWidth,myHeight);
          context.drawImage(video,0,0,myWidth,myHeight);
          console.log('myWidth, myHeight', myWidth, myHeight);
          let imageData = context.getImageData(0,0,myWidth, myHeight);
          let isBlank = true;
          for (let i=0; i< imageData.data.length; i++) {
            if((i+1)%4){
              if(imageData.data[i] !== 0) {
                isBlank = false;
                break;
              }
            }
          }
          if(isBlank) {
            setTimeout(takeAShot, 1000);
            console.log("Blank snapshot");
          } else {

            canvas.toBlob((blob) => {
              const reader = new FileReader();

              reader.onload = () => {
                uploadSnapshot(reader.result);
              };
              
              reader.readAsBinaryString(blob);
              setSnapshotTaken(true);
            });
          }
        }
        
        setTimeout(takeAShot, 100); 
    }

    useEffect(()=> {
        window.$ = window.jQuery = jquery;``
    }, []);


    return (
        <div>
            <input ref={videoFilesInputRef} onChange={handleVideoFiles} type="file" accept="video/*" className="d-none editControl" id="videos" />
            <Row className="">
                <Col>
                    {(panel.status === 'Uploaded' || panel.status === 'Downloaded' || panel.status === 'Downloading' || panel.status === 'DownloadingThumbnail' || panel.status === 'ThumbnailDownloaded') ?
                        <div className='d-flex justify-content-center align-items-center w-100' >
                            {panel.play ?
                                <>
                                    {panel.src ?
                                        <video alt="Video broken" playsInline controls autoPlay muted  poster={panel.thumbnail} src={panel.src} onPlaying={onPlaying} onCanPlay={onCanPlay} onLoadedMetadata={onLoadedMetadata} onLoadedData={onLoadedData} className='w-100' /> :
                                        <>
                                            <Image alt="image broken" src={panel.thumbnail} fluid />    
                                        </>
                                    }
                                </> :
                                <>
                                    <Image alt="image broken" src={panel.thumbnail} fluid />
                                    <div style={{
                                        position: 'absolute',
                                        width: '100px',
                                        borderRadius: '10px',
                                        textAlign: 'center',
                                        background: 'white',
                                        opacity: '0.5',
                                        cursor: 'pointer'
                                    }}
                                        onClick={handleVideoClicked}>
                                        <i className="fa fa-play-circle-o fa-4x text-danger" aria-hidden="true"></i>
                                    </div>
                                </>
                            }
                        </div>
                        : ""
                    }
                    {(panel.status === "Uploading") ? <ProgressBar now={panel.progress} /> : ""}
                    {(panel.status === "WaitingForUpload" || panel.status === "WaitingForDownload") && <i class="fa fa-video-camera" aria-hidden="true"></i>}
                </Col>
            </Row>
            <Row>
                <Col xs={8} sm={9}>
                    <div className="pt-2">
                        <Editor editorId={panelIndex} mode={editorMode} content={panel.words} onContentChanged={onContentChanged} showPen={false} editable={editable} hideIfEmpty={true} />
                    </div>
                </Col>
                <Col xs={4} sm={3} className="p-0">
                    {(panel.status !== 'Uploading' || panel.status === 'WaitingForUpload') ?
                        <div>

                            {editable ?
                                <DropdownButton variant="link" align="end" title={
                                    <span>
                                        <i className="text-dark fa fa-ellipsis-v" aria-hidden="true"></i>
                                    </span>
                                } className="pull-right" id="dropdown-menu-align-end">
                                    <Dropdown.Item eventKey="2" className="deleteVideoBtn" onClick={handleDelete}>Delete Video</Dropdown.Item>
                                </DropdownButton>
                                : ""
                            }
                            {editable ?
                                <Button id={panelIndex} onClick={handleVideoButton} variant="link" className="px-1 text-dark btn btn-labeled pull-right">
                                    <i id={panelIndex} className="fa fa-video-camera fa-lg" aria-hidden="true"></i>
                                </Button>
                                : ""
                            }
                            {editable ?
                                <Button variant="link" onClick={handlePenClicked} className="px-1 text-dark pull-right"><i className="fa fa-pencil" aria-hidden="true"></i></Button>
                                : ""
                            }

                        </div>
                        : ""
                    }
                </Col>
            </Row>
        </div>
    )
}