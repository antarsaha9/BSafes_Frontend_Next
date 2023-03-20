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

import { stopUploadingAttachment, uploadAttachmentsThunk, downloadAnAttachmentThunk } from '../reduxStore/pageSlice';

export default function AttachmentPanel ({panelIndex, panel}) {
    const dispatch = useDispatch();
    const workspaceKey = useSelector( state => state.container.workspaceKey);
    const saveFileRef = useRef(null);

    const handleDownload= async () => {
        dispatch(downloadAnAttachmentThunk({panel, workspaceKey}));
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
                            <Dropdown.Item eventKey="1" className="deleteImageBtn">Delete</Dropdown.Item>
                        </DropdownButton>
                        {(panel.status==="Uploaded") && <Button variant='link' className='pt-0 px-2 pull-right' onClick={handleDownload}><i className="text-dark fa fa-download fa-lg" aria-hidden="true"></i></Button>}
                        <a ref={saveFileRef} href={panel.link} download={panel.fileName} className="d-none">Save</a>
                        {(panel.status==="UploadFailed") && <OverlayTrigger
                            placement='top'
                            overlay={
                                <Tooltip id='ResumeUploadingFile'>
                                    Resume
                                </Tooltip>
                            }>
                            <Button variant='link' className='pt-0 px-2 pull-right' onClick={()=>dispatch(uploadAttachmentsThunk({files:[], workspaceKey}))}><i className="text-dark fa fa-play-circle-o fa-lg" aria-hidden="true"></i></Button>
                        </OverlayTrigger>}
                        {(panel.status==="WaitingForUpload") && <Button variant='link' className='pt-0 px-2 pull-right'><i className="text-dark fa fa-hand-paper-o fa-lg" aria-hidden="true"></i></Button>}
                        {(panel.status==="Uploading") && <OverlayTrigger
                            placement='top'
                            overlay={
                                <Tooltip id='StopUploadingFile'>
                                    Stop
                                </Tooltip>
                            }> 
                            <Button variant='link' className='pt-0 px-2 pull-right' onClick={()=>dispatch(stopUploadingAttachment())}><i className="text-dark fa fa-pause fa-lg" aria-hidden="true"></i></Button>
                        </OverlayTrigger>}
                    </div>  
                    </Col>
                </Row>
                <Row>
                    <Col>
                        {(panel.status === "Uploading" || panel.status === "UploadFailed" || panel.status === "Downloading" )?<ProgressBar now={panel.progress} />:""}  
                    </Col>
                </Row>
            </Card.Body>
        </Card>
    )
}