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

import Editor from './editor'
import { LoaderSpinner } from './loaderSpinner'

import { uploadAudiosThunk, deleteAnAudioThunk } from '../reduxStore/pageSlice'
import { debugLog } from '../lib/helper';

export default function AudioPanel({ panelIndex, panel, onAudioClicked, editorMode, onContentChanged, onPenClicked, editable = true }) {
    const debugOn = false;
    const dispatch = useDispatch();

    const audioFilesInputRef = useRef(null);
    const s3KeyPrefix = panel.s3KeyPrefix;

    const workspaceKey = useSelector(state => state.container.workspaceKey);

    const handleAudioClicked = () => {
        onAudioClicked(panel.queueId);
    }

    const handlePenClicked = () => {
        onPenClicked(panelIndex);
    }

    const handleDelete = () => {
        const confirmDelete = confirm('Are you sure you want to delete this audio?');
        if (confirmDelete) {
            dispatch(deleteAnAudioThunk({ panel }));
        }
    }

    const handleAudioButton = (e) => {
        debugLog(debugOn, "handleAudioBtn");
        e.preventDefault();
        audioFilesInputRef.current.value = null;
        audioFilesInputRef.current?.click();
    };

    const handleAudioFiles = (e) => {
        e.preventDefault();
        debugLog(debugOn, "handleAudioFiles: ", e.target.id);
        const files = e.target.files;
        if (files.length) {
            uploadAudios(files, panelIndex);
        }
    }

    const uploadAudios = (files, where) => {
        dispatch(uploadAudiosThunk({ files, where, workspaceKey }));
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
    }

    useEffect(() => {
        window.$ = window.jQuery = jquery; ``
    }, []);


    return (
        <div style={{borderStyle:"solid", borderRadius:"2px", padding:"0px"}}>
            <input ref={audioFilesInputRef} onChange={handleAudioFiles} type="file" accept="audio/*" className="d-none editControl" id="audios" />
            <Row className="pt-3 pb-1 px-3">
                <Col xs={11} style={{overflow:"hidden", whiteSpace:"nowrap", textOverflow: "ellipsis"}}>
                    <h6><i className="fa fa-volume-up" aria-hidden="true"></i> <span className="attachmentFileName">{panel.fileName}</span></h6>
                </Col>
            </Row>
            <Row className="px-3">
                <Col>
                    {(panel.status === 'Uploaded' || panel.status === 'Downloaded' || panel.status === 'DownloadFailed' || panel.status === 'DownloadingAudio' || panel.status === 'DownloadedFromServiceWorker' || panel.status === 'Downloading' || panel.status === 'DownloadingThumbnail' || panel.status === 'ThumbnailDownloaded') ?
                        <div className='d-flex justify-content-center align-items-center w-100' >
                            {panel.play ?
                                <>
                                    {panel.src ?
                                        <audio alt="Audio broken" playsInline controls autoPlay muted src={panel.src} onPlaying={onPlaying} onCanPlay={onCanPlay} onLoadedMetadata={onLoadedMetadata} onLoadedData={onLoadedData} className='w-100' /> :
                                        <>
                                            <Button onClick={handleAudioClicked}><i className="fa fa-play" aria-hidden="true"></i> Play</Button>
                                        </> 
                                    }
                                </> :
                                <>
                                    {panel.status === "Downloaded" &&
                                        <Button variant="dark" onClick={handleAudioClicked}>
                                            <i className="fa fa-play" aria-hidden="true"></i> Play
                                        </Button>
                                    }
                                    {(panel.status === "DownloadingAudio") && <LoaderSpinner />}
                                </>
                            }
                        </div>
                        : ""
                    }
                    {(panel.status === "Uploading") ? <ProgressBar now={panel.progress} /> : ""}
                    {(panel.status === "WaitingForUpload") && <></>}
                    {(panel.status === "WaitingForDownload") &&
                        <Button variant="dark" size="sm" onClick={handleAudioClicked}>
                            <i className="fa fa-play" aria-hidden="true"></i> Play
                        </Button>
                    }
                </Col>
            </Row>
            <Row className="px-3">
                <Col>
                    {(false || panel.status === "Downloading") ? <ProgressBar now={panel.progress} /> : ""}
                </Col>
            </Row>
            <Row className="pt-2">
                <Col xs={8} sm={9}>
                    <div className="">
                        <Editor editorId={panelIndex} showWriteIcon={true} mode={editorMode} content={panel.words} onContentChanged={onContentChanged} showPen={false} editable={editable} hideIfEmpty={true} />
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
                                    <Dropdown.Item eventKey="2" className="deleteAudioBtn" onClick={handleDelete}>Delete Audio</Dropdown.Item>
                                </DropdownButton>
                                : ""
                            }
                            {editable ?
                                <Button id={panelIndex} onClick={handleAudioButton} variant="link" className="px-1 text-dark btn btn-labeled pull-right">
                                    <i id={panelIndex} className="fa fa-volume-up fa-lg" aria-hidden="true"></i>
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