import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from 'next/router';

import Container from 'react-bootstrap/Container'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Button from 'react-bootstrap/Button'
import Modal from "react-bootstrap/Modal";
import ModalHeader from "react-bootstrap/ModalHeader";
import ModalTitle from "react-bootstrap/ModalTitle";
import ModalBody from "react-bootstrap/ModalBody";
import ListGroup from "react-bootstrap/ListGroup";

import OverlayTrigger from "react-bootstrap/OverlayTrigger";
import Tooltip from 'react-bootstrap/Tooltip';

import TagsInput from 'react-tagsinput-special'

import BSafesStyle from '../styles/BSafes.module.css'
import FeatureNotAvailableForDemoToast from "./featureNotAvailabeForDemoToast";

import { clearItemVersions, getItemVersionsHistoryThunk, saveTagsThunk } from "../reduxStore/pageSlice";

import { getItemLink } from "../lib/bSafesCommonUI";
export default function ItemTopRows() {
    const dispatch = useDispatch();
    const router = useRouter();

    const workspace = useSelector(state => state.container.workspace);
    const workspaceKey = useSelector(state => state.container.workspaceKey);
    const workspaceSearchKey = useSelector(state => state.container.searchKey);
    const workspaceSearchIV = useSelector(state => state.container.searchIV);

    const oldVersion = useSelector(state => state.page.oldVersion);
    const activity = useSelector(state => state.page.activity);
    const tagsState = useSelector(state => state.page.tags);
    const itemCopy = useSelector(state => state.page.itemCopy);

    const [tags, setTags] = useState([]);
    const [showTagsConfirmButton, setShowTagsConfirmButton] = useState(false);
    const [versionsHistoryModalOpened, setVersionsHistoryModalOpened] = useState(false);
    const [showFeatureNotAvailableForDemoToast, setShowFeatureNotAvailableForDemoToast] = useState(false);
    
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
        if (!workspace.startsWith("d:")) {
            setVersionsHistoryModalOpened(true);
            dispatch(clearItemVersions());
            dispatch(getItemVersionsHistoryThunk({ page: 1 }));
        } else {
            setShowFeatureNotAvailableForDemoToast(true);
        }
    }

    const handleLinkChanged = (link) => {
        router.push(link);
        setVersionsHistoryModalOpened(false);
    }

    useEffect(() => {
        setTags(tagsState);
    }, [tagsState])

    useEffect(() => {
        if (activity === 0) {
            if (showTagsConfirmButton) setShowTagsConfirmButton(false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activity]);

    return (
        <Container>
            <Row>
                <Col>
                    <div className="pull-right">
                        <span>{itemCopy && `v.${itemCopy.version}`}</span><Button variant="link" className="text-dark" onClick={openVersionsHistoryModal}  ><i className="fa fa-history" aria-hidden="true"></i></Button>
                        {false && <Button variant="link" className="text-dark" >
                            <i className="fa fa-share-square-o" aria-hidden="true"></i>
                        </Button>}
                    </div>
                </Col>
            </Row>

            <Row>
                <Col xs="2" sm="1" className="px-0">
                    <OverlayTrigger
                        placement='top'
                        overlay={
                            <Tooltip id={`tooltip-top`}>
                                <TagHelp />
                            </Tooltip>
                        }
                    ><Button variant="link" className="text-dark pull-right p-0"><i className="fa fa-question" aria-hidden="true"></i></Button></OverlayTrigger><label className="pull-right py-2"><span><i className="fa fa-tags fa-lg" aria-hidden="true"></i></span></label>
                </Col>
                <Col xs="10">
                    {oldVersion ?
                        <TagsInput value={tags} onChange={handleChange} disabled />
                        :
                        <TagsInput value={tags} onChange={handleChange} />
                    }
                </Col>
            </Row>
            {showTagsConfirmButton && <Row>
                <Col md="10">
                    <Button variant="link" className="pull-right" onClick={handleCancel}><i className={`fa fa-times fa-lg ${BSafesStyle.orangeText}`} aria-hidden="true"></i></Button>
                    <Button variant="link" className="pull-right" onClick={handleSave}><i className={`fa fa-check fa-lg ${BSafesStyle.greenText}`} aria-hidden="true"></i></Button>
                </Col>
            </Row>}
            <FeatureNotAvailableForDemoToast show={showFeatureNotAvailableForDemoToast} message="The Versions feature is not available for demo!" handleClose={()=>{setShowFeatureNotAvailableForDemoToast(false)}}/>
            <VersionsHistoryModal onLinkChanged={handleLinkChanged} versionsHistoryModalOpened={versionsHistoryModalOpened} closeVersionsHistoryModal={() => setVersionsHistoryModalOpened(false)} />
        </Container>
    )
}

function VersionsHistoryModal({ onLinkChanged, versionsHistoryModalOpened, closeVersionsHistoryModal }) {

    const dispatch = useDispatch();

    const itemVersions = useSelector(state => state.page.itemVersions);
    const totalVersions = useSelector(state => state.page.totalVersions);
    const versionsPageNumber = useSelector(state => state.page.versionsPageNumber);
    const versionsPerPage = useSelector(state => state.page.versionsPerPage);

    const handleMore = (e) => {
        dispatch(getItemVersionsHistoryThunk({ page: versionsPageNumber + 1 }));
    }

    const handleVersionSelected = (link) => {
        onLinkChanged(link);
    }

    const itemVersionCards = itemVersions.map((itemVersion, index) =>
        <ItemVersionCard key={index} onVersionSelected={handleVersionSelected} id={itemVersion.id} container={itemVersion.container} updatedBy={itemVersion.updatedBy} updatedTime={itemVersion.updatedTime} updatedText={itemVersion.updatedText} updatedTimeStamp={itemVersion.updatedTimeStamp} version={itemVersion.version} latestVersion={index === 0} />
    )

    return (
        <Modal show={versionsHistoryModalOpened} onHide={closeVersionsHistoryModal}>
            <ModalHeader closeButton>
                <ModalTitle>
                    <h4>Versions</h4>
                    <Button variant="link" href="#" size="sm">Go to top</Button>
                </ModalTitle>
            </ModalHeader>
            <ModalBody>
                {itemVersionCards}
                {totalVersions > (versionsPageNumber * versionsPerPage) &&
                    <div className='text-center'>
                        <Button variant="link" className='text-center' size="sm" onClick={handleMore}>
                            More
                        </Button>
                    </div>
                }
            </ModalBody>
        </Modal>
    )
}

function ItemVersionCard({ onVersionSelected, id, container, updatedBy, updatedTime, updatedText, updatedTimeStamp, version, latestVersion }) {

    const item = { id, container };

    let link = getItemLink(item);
    if (!latestVersion) {
        link += `?version=${version}`;
    }
    const rowClicked = () => {
        onVersionSelected(link);
    }

    return (
        <ListGroup.Item key={id}>
            <Row>
                <Col xs={3} onClick={rowClicked} style={{ cursor: 'pointer' }}><h4>v.{version}</h4></Col>
                <Col xs={8} onClick={rowClicked} style={{ cursor: 'pointer' }}><h5 className="pull-right px-2">{updatedText}</h5></Col>
                <Col xs={1}>
                    <a className={BSafesStyle.externalLink} target="_blank" href={link} rel="noopener noreferrer">
                        <i className="me-2 fa fa-external-link mt-1  text-dark pull-right" aria-hidden="true"></i>
                    </a>
                </Col>
            </Row>
            <Row onClick={rowClicked} style={{ cursor: 'pointer' }}>
                <Col xs={6}><p>{updatedBy}</p></Col>
                <Col xs={6}><p className="pull-right">{updatedTime}</p></Col>
            </Row>
            <Row onClick={rowClicked} style={{ cursor: 'pointer' }}>
                <Col xs={12}><p className="pull-right">{updatedTimeStamp}</p></Col>
            </Row>
        </ListGroup.Item>
    )
}

function TagHelp() {
    return (
        <>
            Add a tag and press the Return key ↵ on the keyboard. After you add all tags, select the green <i className="fa fa-check" aria-hidden="true"></i>.
        </>
    )
}