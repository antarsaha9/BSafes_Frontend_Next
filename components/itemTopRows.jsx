import React, { useEffect, useState } from "react";
import Container from 'react-bootstrap/Container'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Button from 'react-bootstrap/Button'

import TagsInput from 'react-tagsinput-special'
import { useDispatch, useSelector } from "react-redux";

import BSafesStyle from '../styles/BSafes.module.css'
import { getItemVersionsHistoryThunk, saveTagThunk } from "../reduxStore/pageSlice";
import Modal from "react-bootstrap/Modal";
import ModalBody from "react-bootstrap/ModalBody";
import ModalHeader from "react-bootstrap/ModalHeader";
import ModalTitle from "react-bootstrap/ModalTitle";

export default function ItemTopRows(props) {
    console.log(props);
    const inittags = useSelector(state => state.page.tags);
    const version = useSelector(state => state.page.version);
    const searchKey = useSelector(state => state.auth.searchKey);
    const dispatch = useDispatch();
    useEffect(() => {
        setTags(inittags);

    }, [inittags])

    const [tags, setTags] = useState([]);
    const [versionModalOpened, _openVersionModal] = useState(false);

    const [showTagsConfirmButton, setShowTagsConfirmButton] = useState(false);

    const handleChange = (tags) => {
        setTags(tags);
        if (!showTagsConfirmButton) setShowTagsConfirmButton(true);
    }
    
    const openVersionModal=()=>{
        _openVersionModal(true)
        dispatch(getItemVersionsHistoryThunk(props.pageItemId));
    }

    const handleSave = () => {
        dispatch(saveTagThunk(tags, searchKey));
        // setShowTagsConfirmButton(false)
    }
    const handleDiscard = () => {
        // setTags(initialTags);
        setShowTagsConfirmButton(false)
    }
    // console.log(inittags);
    // console.log(tags);

    return (
        <Container>
            <Row>
                <Col>
                    <div className="pull-right">
                        <span>v.{version}</span>
                        <Button variant="link" className="text-dark" onClick={openVersionModal} >
                            <i className="fa fa-history" aria-hidden="true"></i>
                        </Button>
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
                    <Button variant="link" className="pull-right" onClick={handleDiscard}><i className={`fa fa-times fa-lg ${BSafesStyle.orangeText}`} aria-hidden="true"></i></Button>
                    <Button variant="link" className="pull-right" onClick={handleSave}><i className={`fa fa-check fa-lg ${BSafesStyle.greenText}`} aria-hidden="true"></i></Button>
                </Col>
            </Row>}
            <PageVersionModal versionModalOpened={versionModalOpened} closeVersionModal={() => _openVersionModal(false)} />
        </Container>
    )
}

function PageVersionModal({ versionModalOpened, closeVersionModal }) {
    return (
        <Modal show={versionModalOpened} onHide={closeVersionModal}>
            <ModalHeader closeButton>
                <ModalTitle>
                    <h4 class="modal-title" id="itemVersionsModalLabel">Page versions</h4>
                    <a href="#" id="goToTopBtn" class="btn-xs">Go to top</a>
                </ModalTitle>
            </ModalHeader>
            <ModalBody>
                <div class="list-group itemVersionItemsList">
                </div>
                {/* {showMoreIcon && <div class="text-center hidden" id="moreVersions">
                    <a href="#" onClick={handleMoreVersionClick}>More ...</a>
                </div>} */}
            </ModalBody>
        </Modal>
    )
}