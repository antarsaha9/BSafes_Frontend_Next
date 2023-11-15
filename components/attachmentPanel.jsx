import { useRef, useEffect, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Card from 'react-bootstrap/Card'
import Button from 'react-bootstrap/Button';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Tooltip from 'react-bootstrap/Tooltip'
import DropdownButton from 'react-bootstrap/DropdownButton';
import Dropdown from 'react-bootstrap/Dropdown';
import ProgressBar from 'react-bootstrap/ProgressBar'

import BSafesStyle from '../styles/BSafes.module.css'

import { stopUploadingAnAttachment, uploadAttachmentsThunk, downloadAnAttachmentThunk, stopDownloadingAnAttachment, deleteAnAttachmentThunk } from '../reduxStore/pageSlice';
import { numberWithCommas } from '../lib/bSafesCommonUI'
import { debugLog } from '../lib/helper'

export default function AttachmentPanel ({panelIndex, panel}) {
    const debugOn = true;
    const dispatch = useDispatch();
    const workspaceKey = useSelector( state => state.container.workspaceKey);
    const saveFileRef = useRef(null);
    
    const handleDownload= async () => {
        dispatch(downloadAnAttachmentThunk({panel, workspaceKey}));
    }

    const handleStop = () => {
        if(panel.status === "Uploading") {
            dispatch(stopUploadingAnAttachment());
        } else {
            dispatch(stopDownloadingAnAttachment());
        }    
    }

    const handleResume= () => {
        if(panel.status === "UploadFailed"){
            ()=>dispatch(uploadAttachmentsThunk({files:[], workspaceKey}))
        } else {
            dispatch(downloadAnAttachmentThunk({panel:null, workspaceKey}));
        }
    }

    const handleDelete= () => {
        const confirmDelete = confirm('Are you sure you want to delete this attachment?');
        if(confirmDelete) {
            dispatch(deleteAnAttachmentThunk({panel}));
        }
    }

    useEffect(()=> {
        if(panel.link) {
            saveFileRef.current?.click();
        }
    }, [panel])
    
    return (
        <Card>
            <Card.Body>
                <Row>
                    <Col xs={8} md={9}>
                        <h6><i className="fa fa-file-o" aria-hidden="true"></i> <span className="attachmentFileName">{panel.fileName}</span></h6>
                    </Col>
                    <Col xs={4} md={3}>
                    <div>
                        <DropdownButton variant="link" align="end" title={
                            <span>
                                <i className="text-dark fa fa-ellipsis-v fa-lg" aria-hidden="true"></i>
                            </span>
                        }  className={`${BSafesStyle.attachmentMoreBtn} pull-right`} id="dropdown-menu-align-end">
                            <Dropdown.Item eventKey="1" onClick={handleDelete}>Delete</Dropdown.Item>
                        </DropdownButton>
                        {(panel.status==="Uploaded" || panel.status==="Downloaded") && <Button variant='link' className='pt-0 px-2 pull-right' onClick={handleDownload}><i className="text-dark fa fa-download fa-lg" aria-hidden="true"></i></Button>}
                        <a ref={saveFileRef} href={panel.link} download={panel.fileName} className="d-none">Save</a>
                        {(panel.status==="UploadFailed" || panel.status==="DownloadFailed") && <OverlayTrigger
                            placement='top'
                            overlay={
                                <Tooltip id='ResumeUploadingFile'>
                                    Resume
                                </Tooltip>
                            }>
                            <Button variant='link' className='pt-0 px-2 pull-right' onClick={handleResume}><i className="text-dark fa fa-play-circle-o fa-lg" aria-hidden="true"></i></Button>
                        </OverlayTrigger>}
                        {(panel.status==="WaitingForUpload" || panel.status==="WaitingForDownload") && <Button variant='link' className='pt-0 px-2 pull-right'><i className="text-dark fa fa-hand-paper-o fa-lg" aria-hidden="true"></i></Button>}
                        {(panel.status==="Uploading" || panel.status==="Downloading") && <OverlayTrigger
                            placement='top'
                            overlay={
                                <Tooltip id='StopUploadingFile'>
                                    Stop
                                </Tooltip>
                            }> 
                            <Button variant='link' className='pt-0 px-2 pull-right' onClick={handleStop}><i className="text-dark fa fa-pause fa-lg" aria-hidden="true"></i></Button>
                        </OverlayTrigger>}
                    </div>  
                    </Col>
                </Row>
                <Row>
                    <Col xs={8} md={9}>
                        <p className='mb-0'>{numberWithCommas(panel.fileSize) + ' bytes'}</p>
                    </Col>
                    <Col xs={4} md={3}>
                        { (panel.status === "Uploading" || panel.status === "UploadFailed" || panel.status === "Downloading" || panel.status === "DownloadFailed") &&
                            <p  className='pull-right'>{(Math.round(panel.progress*100)/100).toFixed(2)} %</p>
                        }
                    </Col>
                </Row>
                <Row>
                    <Col>
                        {(panel.status === "Uploading" || panel.status === "UploadFailed" || panel.status === "Downloading" || panel.status === "DownloadFailed")?<ProgressBar now={panel.progress} />:""}  
                    </Col>
                </Row>
            </Card.Body>
        </Card>
    )
}