import { useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Button from 'react-bootstrap/Button'
import DropdownButton from 'react-bootstrap/DropdownButton'
import Dropdown from 'react-bootstrap/Dropdown'
import ProgressBar from 'react-bootstrap/ProgressBar'
import Image from 'react-bootstrap/Image'

import Editor from './editor'

import { uploadVideosThunk, deleteAVideoThunk } from '../reduxStore/pageSlice'
import { debugLog } from '../lib/helper';
import { LoaderSpinner } from './LoaderSpinner'

export default function VideoPanel({ panelIndex, panel, onVideoClicked, editorMode, onContentChanged, onPenClicked, editable = true }) {
    const debugOn = false;
    const dispatch = useDispatch();
    const videoFilesInputRef = useRef(null);

    const workspaceKey = useSelector(state => state.container.workspaceKey);

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

    return (
        <div>
            <input ref={videoFilesInputRef} onChange={handleVideoFiles} type="file" multiple accept="video/*" className="d-none editControl" id="videos" />
            <Row className="">
                <Col>
                    {(panel.status === 'Uploaded' || panel.status === 'Downloaded' || panel.status === 'Downloading' || panel.status === 'DownloadingThumbnail' || panel.status === 'ThumbnailDownloaded') ?
                        <div className='d-flex justify-content-center align-items-center w-100' >
                            {panel.play ?
                                <>
                                    {panel.src ?
                                        <video alt="Video broken" poster={panel.thumbnail} src={panel.src} onLoadedData={(e) => { e.target.play() }} className='w-100' controls /> :
                                        <>
                                            <Image alt="image broken" src={panel.thumbnail} fluid />
                                            <LoaderSpinner />
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
                                        <i class="fa fa-play-circle-o fa-4x text-danger" aria-hidden="true"></i>
                                    </div>
                                    {panel.status === 'DownloadingThumbnail' && <LoaderSpinner />}
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