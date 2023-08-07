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

import {addFiles, addImagesAsyncThunk} from '../reduxStore/pageSlice'
import { NavItem } from 'react-bootstrap'

export default function ImagesGallery() {
    const dispatch = useDispatch();
    const imagePanelesSelector = useSelector(state => state.page.imagePanels);
    const imagePanelesIndexSelector = useSelector(state => state.page.imagePanelsIndex);
    console.log(imagePanelesIndexSelector);


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
      dispatch(addImagesAsyncThunk({files:["1","2","3"], where:"top"}));
      //fileInputRef.current?.click();
    };

    const panelCallback = (panelIndex) => {
        console.log(`${panelIndex} is clicked`);
    }

    useEffect(()=> {
        console.log("uesEffect called")
    },[])

    const imagePanels = imagePanelesSelector.map((item, index) =>
        <ImagePanel key={item.key} panelIndex={index} status={item.status} callback={panelCallback} />
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
}