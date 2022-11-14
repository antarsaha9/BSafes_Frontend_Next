import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import Container from 'react-bootstrap/Container'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Button from 'react-bootstrap/Button'
import Modal from "react-bootstrap/Modal";
import ModalHeader from "react-bootstrap/ModalHeader";
import ModalTitle from "react-bootstrap/ModalTitle";
import ModalBody from "react-bootstrap/ModalBody";
import ListGroup from "react-bootstrap/ListGroup";

import TagsInput from 'react-tagsinput-special'

import BSafesStyle from '../styles/BSafes.module.css'

import { getItemVersionsHistoryThunk, saveTagsThunk } from "../reduxStore/pageSlice";

export default function ItemTopRows() {
    const dispatch = useDispatch();

    const workspaceKey = useSelector( state => state.container.workspaceKey);
    const workspaceSearchKey = useSelector( state => state.container.searchKey);
    const workspaceSearchIV = useSelector( state => state.container.searchIV);

    const activity = useSelector( state => state.page.activity);
    const tagsState = useSelector(state => state.page.tags);

    const [tags, setTags] = useState([]);
    const [showTagsConfirmButton, setShowTagsConfirmButton] = useState(false);
    const [versionsHistoryModalOpened, setVersionsHistoryModalOpened] = useState(false);

    const handleChange = (tags) => {
        setTags(tags);
        if (!showTagsConfirmButton) setShowTagsConfirmButton(true);
    }

    const handleSave = () => {
        dispatch(saveTagsThunk(tags, workspaceKey, workspaceSearchKey, workspaceSearchIV));
    }

    const handleCancel = () => {
        setTags(tagsState);
        setShowTagsConfirmButton(false)
    }

    const openVersionsHistoryModal = () => {
        setVersionsHistoryModalOpened(true)
        dispatch(getItemVersionsHistoryThunk());
    }

    useEffect(()=>{
        setTags(tagsState);
    }, [tagsState])

    useEffect(() => {
        if(activity === "Done") {
            if (showTagsConfirmButton) setShowTagsConfirmButton(false);
        } else if (activity === "Error") {

        }
    }, [activity]);

    return (
        <Container>
            <Row>
                <Col>
                    <div className="pull-right">
                        <span>v.1</span><Button variant="link" className="text-dark" onClick={openVersionsHistoryModal}  ><i className="fa fa-history" aria-hidden="true"></i></Button>
                        <Button variant="link" className="text-dark" >
		        		    <i className="fa fa-share-square-o" aria-hidden="true"></i>
		        	    </Button>
                    </div>
                </Col>     
            </Row>

            <Row>
                <Col xs="1">
                    <label className="pull-right"><span><i className="fa fa-tags fa-lg" aria-hidden="true"></i></span></label>
                </Col>
                <Col xs="10">
                    <TagsInput value={tags} onChange={handleChange} />
                </Col>
            </Row>
            {showTagsConfirmButton && <Row>
                <Col md="10">
                    <Button variant="link" className="pull-right" onClick={handleCancel}><i className={`fa fa-times fa-lg ${BSafesStyle.orangeText}`} aria-hidden="true"></i></Button>
                    <Button variant="link" className="pull-right" onClick={handleSave}><i className={`fa fa-check fa-lg ${BSafesStyle.greenText}`} aria-hidden="true"></i></Button>
                </Col>
            </Row>}
            <VersionsHistoryModal versionsHistoryModalOpened={versionsHistoryModalOpened} closeVersionsHistoryModal={() => setVersionsHistoryModalOpened(false)} />
        </Container>
    )
}

function VersionsHistoryModal({ versionsHistoryModalOpened, closeVersionsHistoryModal }) {
    const itemVersions = useSelector(state => state.page.itemVersions);

    return (
        <Modal show={versionsHistoryModalOpened} onHide={closeVersionsHistoryModal}>
            <ModalHeader closeButton>
                <ModalTitle>
                    <h4>Versions</h4>
                    <Button variant="link" href="#" size="sm">Go to top</Button>
                </ModalTitle>
            </ModalHeader>
            <ModalBody>
                <ListGroup>
                    {itemVersions?.map(ItemVersionCard)}
                </ListGroup>
                {/* {showMoreIcon && <div class="text-center hidden" id="moreVersions">
                    <a href="#" onClick={handleMoreVersionClick}>More ...</a>
                </div>} */}
            </ModalBody>
        </Modal>
    )
}

function ItemVersionCard({id,updatedBy,updatedTime,updatedText,updatedTimeStamp,version}) {

    return (
        <ListGroup.Item key={id}>
            <Row>
                <Col xs={3}><h4>v.{version}</h4></Col>
                <Col xs={9}><h4 className="pull-right">{updatedText}</h4></Col>
            </Row>
            <Row>
                <Col xs={6}><h6>{updatedBy}</h6></Col>
                <Col xs={6}><h6 className="pull-right">{updatedTime}</h6></Col>
            </Row>
            <Row>
                <Col xs={12}><h6 className="pull-right">{updatedTimeStamp}</h6></Col>
            </Row>
        </ListGroup.Item>
    )
}