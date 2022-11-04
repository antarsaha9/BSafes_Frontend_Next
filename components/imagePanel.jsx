import {useEffect, useRef} from 'react'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Button from 'react-bootstrap/Button'
import DropdownButton from 'react-bootstrap/DropdownButton'
import Dropdown from 'react-bootstrap/Dropdown'
import ProgressBar from 'react-bootstrap/ProgressBar'
import Image from 'react-bootstrap/Image'

import Editor from './editor'

export default function ImagePanel({panelIndex, panel, onImageClicked, editorMode, onContentChanged, onPenClicked, editable=true}) {

    const fileInputRef = useRef(null);

    const handleUpload = (event) => {
        /* 
        try {
            let data = await PostCall({
                api: 'preS3Upload', 
                body:{}
            });
            if(data.status == 'ok') {
                console.log(data);
            }
        } catch (error) {
            console.log(error);
        }
        */
      console.log("handleUpload:", event.target.id)
      fileInputRef.current?.click();
    };   

    const handleImageClicked = ()=> {
        onImageClicked(panel.queueId);
    }

    const handlePenClicked = () => {
        onPenClicked(panelIndex);
    }

    return (
        <div>
            <input ref={fileInputRef} type="file" multiple className="d-none editControl" id="image" />
            <Row className="">
                <Col>
                    {(panel.status === 'Uploaded' || panel.status === 'Downloaded' )?
                        <div>
                            <Image src={panel.src} onClick={handleImageClicked} fluid/>
                        </div>
                        :""
                    }
                    {(panel.status === "Uploading" || panel.status === "Downloading")?<ProgressBar className="marginTop20Px marginBottom0Px"  now={panel.progress} />:""}  
                </Col>
            </Row>
            {(panel.status === 'Uploaded' || panel.status === 'Downloaded' )?
                <div>
                    <Row>                
                        <div>
                            { editable?
                                <DropdownButton variant="link" align="end" title={
                        <span>
                            <i className="text-dark fa fa-ellipsis-v" aria-hidden="true"></i>
                         </span>
                    }  className="pull-right" id="dropdown-menu-align-end">
                        <Dropdown.Item eventKey="1" className="changeImageBtn">Change Image</Dropdown.Item>
                        <Dropdown.Item eventKey="2" className="deleteImageBtn">Delete Image</Dropdown.Item>
                                </DropdownButton>
                                :""
                            }
                
                            <Button id={panelIndex} onClick={handleUpload} variant="link" className="text-dark btn btn-labeled pull-right">
                        <i id={panelIndex} className="fa fa-picture-o fa-lg" aria-hidden="true"></i>    
                            </Button>
                            { editable?
                                <Button variant="link" onClick={handlePenClicked} className="text-dark pull-right"><i className="fa fa-pencil" aria-hidden="true"></i></Button>
                                :""
                            }
                        </div>
                    </Row> 
                    
                </div>
                :""
            }	
            <Editor editorId={panelIndex} mode={editorMode} content={panel.words} onContentChanged={onContentChanged} showPen={false} editable={editable} />
            <br />
        </div>    
    )   
}