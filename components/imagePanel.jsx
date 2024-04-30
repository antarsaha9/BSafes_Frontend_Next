import {useRef} from 'react'
import { useDispatch, useSelector } from 'react-redux'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Button from 'react-bootstrap/Button'
import DropdownButton from 'react-bootstrap/DropdownButton'
import Dropdown from 'react-bootstrap/Dropdown'
import ProgressBar from 'react-bootstrap/ProgressBar'
import Image from 'react-bootstrap/Image'

import Editor from './editor'

import { uploadImagesThunk, deleteAnImageThunk } from '../reduxStore/pageSlice'
import { debugLog } from '../lib/helper';

export default function ImagePanel({panelIndex, panel, onImageClicked, editorMode, onContentChanged, onPenClicked, editable=true}) {
    const debugOn = false;
    const dispatch = useDispatch();
    const imageFilesInputRef = useRef(null);

    const workspaceKey = useSelector( state => state.container.workspaceKey);

    const handleImageClicked = ()=> {
        onImageClicked(panel.queueId);
    }

    const handlePenClicked = (purpose) => {
        onPenClicked(panelIndex, purpose);
    }

    const handleDelete = () => {
        const confirmDelete = confirm('Are you sure you want to delete this image?');
        if(confirmDelete) {
            dispatch(deleteAnImageThunk({panel}));
        }
    }

    const handleImageButton = (e) => {
        debugLog(debugOn, "handleImageBtn");
        e.preventDefault();
        imageFilesInputRef.current.value = null;
        imageFilesInputRef.current?.click();
    };

    const handleImageFiles = (e) => {
        e.preventDefault();
        debugLog(debugOn, "handleImageFiles: ", e.target.id);
        const files = e.target.files;
	    if (files.length) {
            uploadImages(files, panelIndex);
        }
    }

    const uploadImages = (files, where) => {
        dispatch(uploadImagesThunk({files, where, workspaceKey}));
    };

    return (
        <div>
            <input ref={imageFilesInputRef} onChange={handleImageFiles} type="file" multiple accept="image/*"  className="d-none editControl" id="images" />
            <Row className="">
                <Col>
                    {(panel.status === 'Uploaded' || panel.status === 'Downloaded' )?
                        <div>
                            <Image alt="Image broken" src={panel.src} onClick={handleImageClicked} fluid/>
                        </div>
                        :""
                    }
                    {(panel.status === "Uploading" || panel.status === "Downloading")?<ProgressBar now={panel.progress} />:""}  
                    {( panel.status === "WaitingForUpload" || panel.status === "WaitingForDownload") && <i className="fa fa-picture-o" aria-hidden="true"></i>}
                </Col>
            </Row>
            <Row>
                <Col xs={8} sm={9}>
                    <div className="pt-2">
                        <Editor editorId={panelIndex} mode={editorMode} content={panel.words} onContentChanged={onContentChanged} showPen={false} editable={editable} hideIfEmpty={true} uploadImages={uploadImages}/>
                    </div>   
                </Col>
                <Col xs={4} sm={3} className="p-0">
                    {(panel.status === 'Uploaded' || panel.status === 'Downloaded' )?
                        <div>

                                { editable?
                                    <DropdownButton variant="link" align="end" title={
                                        <span>
                                            <i className="text-dark fa fa-ellipsis-v" aria-hidden="true"></i>
                                        </span>
                                        }  className="pull-right" id="dropdown-menu-align-end">
                                        <Dropdown.Item eventKey="2" className="deleteImageBtn" onClick={handleDelete}>Delete Image</Dropdown.Item>
                                    </DropdownButton>
                                    :""
                                }
                                { editable?
                                    <Button id={panelIndex} onClick={handleImageButton} variant="link" className="px-1 text-dark btn btn-labeled pull-right">
                                        <i id={panelIndex} className="fa fa-picture-o fa-lg" aria-hidden="true"></i>    
                                    </Button>
                                    :""
                                }
                                { editable?
                                    <Button variant="link" onClick={handlePenClicked.bind(null, 'froala')} className="px-1 text-dark pull-right"><i className="fa fa-pencil" aria-hidden="true"></i></Button>
                                    :""
                                }
                                { editable && panel.file?.metadata?.ExcalidrawExportedImage?
                                    <Button variant="link" onClick={handlePenClicked.bind(null, 'excalidraw')} className="px-1 text-dark pull-right"><i className="fa fa-paint-brush" aria-hidden="true"></i></Button>
                                    :""
                                }
                    
                        </div>
                        :""
                    }	
                </Col>
            </Row>
            

        </div>    
    )   
}