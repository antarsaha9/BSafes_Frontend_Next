import { useRef, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'

import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Button from 'react-bootstrap/Button'
import ButtonGroup from 'react-bootstrap/ButtonGroup'
import DropdownButton from 'react-bootstrap/DropdownButton'
import Dropdown from 'react-bootstrap/Dropdown'
import ProgressBar from 'react-bootstrap/ProgressBar'

import { PostCall } from '../lib/helper'

import BSafesStyle from '../styles/BSafes.module.css'
import ImagePanel from './imagePanel'

import {addFiles, addFilesAsync} from '../reduxStore/pageSlice'

export default function ImagesGallery() {
    const dispatch = useDispatch();
    const imagePanelsSelector = useSelector(state => state.page.imagePanels);

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
      dispatch(addFilesAsync(["1","2","3"]));
      //fileInputRef.current?.click();
    };

    const panelCallback = (panelIndex) => {
        console.log(`${panelIndex} is clicked`);
    }

    useEffect(()=> {
        console.log("uesEffect called")
    },[])

    const imagePanels = imagePanelsSelector.map((file, index) =>
        <ImagePanel key={file} panelIndex={index} callback={panelCallback} />
    )

    return (
        <div className="images">
            <input ref={fileInputRef} type="file" multiple className="d-none editControl" id="image" />
            <Row className="imageBtnRowTemplate row hidden">
                <Col sm={{span:10, offset:1}} md={{span:8, offset:2}} className="text-center">
                    <Button id="1" onClick={handleUpload} variant="link" className="btn btn-labeled">
                        <h4><i id="1" className="fa fa-picture-o fa-lg" aria-hidden="true"></i></h4>              
                    </Button>
                </Col>
            </Row>	
            { imagePanels }
        </div>    
    )   
/*
            <Row className="uploadImageTemplate downloadImageTemplate hidden">
                <Col sm={{span:10, offset:1}} md={{span:8, offset:2}}>
                    <div className="uploadText downloadText">
          
                    </div>
                    <ProgressBar className="marginTop20Px marginBottom0Px"  now={45} />
                </Col>
            </Row>
            <Row className="imagePanelTemplate hidden">
                <Col sm={{span:10, offset:1}} md={{span:8, offset:2}}>
                <div className="image">
            
                </div>
                </Col>
                
                <div sm={{span:10, offset:1}} md={{span:8, offset:2}}>
                    <DropdownButton variant="link" align="end" title={
                        <span>
                            <i className="fa fa-ellipsis-v" aria-hidden="true"></i>
                         </span>
                    }  className="pull-right" id="dropdown-menu-align-end">
                        <Dropdown.Item eventKey="1" className="changeImageBtn">Change Image</Dropdown.Item>
                        <Dropdown.Item eventKey="2" className="deleteImageBtn">Delete Image</Dropdown.Item>
                    </DropdownButton>
                
                    <Button id="2" onClick={handleUpload} variant="link" className="btn btn-labeled pull-right">
                        <i id="2" className="fa fa-picture-o fa-lg" aria-hidden="true"></i>    
                    </Button>
                    <Button variant="link" className="btnWrite btnWriteImageWords pull-right"><i className="fa fa-pencil" aria-hidden="true"></i></Button>
                </div>
                <div className="col-xs-12 col-xs-offset-0 col-sm-10 col-sm-offset-1 col-md-8 col-md-offset-2">
                <div className="froala-editor imageWordsEditor">
                    <p></p>
                </div>
                </div>
            </Row>	
*/
/*
    return (
        <div className="images">
            <Row className="imageBtnRowTemplate row hidden">
                <Col sm={{span:10, offset:1}} md={{span:8, offset:2}} className="text-center">
                    <Button onClick={handleUpload} variant="link" className="btn btn-labeled">
                        <h4><i className="fa fa-picture-o fa-lg" aria-hidden="true"></i></h4>
                        <input ref={fileInputRef} type="file" multiple className="d-none editControl" id="image" />
                    </Button>
                </Col>
            </Row>	
            <Row className="uploadImageTemplate downloadImageTemplate hidden">
                <Col sm={{span:10, offset:1}} md={{span:8, offset:2}}>
                    <div className="uploadText downloadText">
          
                    </div>
                    <ProgressBar className="marginTop20Px marginBottom0Px"  now={45} />
                </Col>
            </Row>
            <Row className="imagePanelTemplate hidden">
                <Col sm={{span:10, offset:1}} md={{span:8, offset:2}}>
                <div className="image">
            
                </div>
                </Col>
                
                <div sm={{span:10, offset:1}} md={{span:8, offset:2}}>
                    <DropdownButton variant="link" align="end" title={
                        <span>
                            <i className="fa fa-ellipsis-v" aria-hidden="true"></i>
                         </span>
                    }  className="pull-right" id="dropdown-menu-align-end">
                        <Dropdown.Item eventKey="1" className="changeImageBtn">Change Image</Dropdown.Item>
                        <Dropdown.Item eventKey="2" className="deleteImageBtn">Delete Image</Dropdown.Item>
                    </DropdownButton>
                    <Button onClick={handleUpload} variant="link" className="btn btn-labeled pull-right">
                        <i className="fa fa-picture-o fa-lg" aria-hidden="true"></i>
                        <input ref={fileInputRef} type="file" multiple className={BSafesStyle.displayNone + " " + "insertImages" } />
                    </Button>
                    <Button variant="link" className="btnWrite btnWriteImageWords pull-right"><i className="fa fa-pencil" aria-hidden="true"></i></Button>
                </div>
                <div className="col-xs-12 col-xs-offset-0 col-sm-10 col-sm-offset-1 col-md-8 col-md-offset-2">
                <div className="froala-editor imageWordsEditor">
                    <p></p>
                </div>
                </div>
            </Row>		
        </div>    
    )
*/
}