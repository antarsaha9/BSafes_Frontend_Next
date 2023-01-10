import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";

import ListGroup from "react-bootstrap/ListGroup";
import Breadcrumb from "react-bootstrap/Breadcrumb";
import Button from "react-bootstrap/Button";
import Collapse from "react-bootstrap/Collapse";
import Modal from "react-bootstrap/Modal";

import BSafesStyle from '../styles/BSafes.module.css'

import { clearSelected, dropItemsInside, listContainerThunk, listItemsThunk } from "../reduxStore/containerSlice";

export default function ItemsToolbar(props) {
    const selectedItems = useSelector(state => state.container.selectedItems);
    const open = selectedItems && selectedItems.length > 0;

    const handleMove = () => {
    }

    const handleTrashSelected = () => {
    }

    const handleClearSelected = () => {
    }
    
    return (
        <>
             <Collapse in={open}>
                <Row className={BSafesStyle.itemsToolbar}>
                    <Col xs={12} sm={{ span: 8, offset: 2 }}>
                        <Row >
                            <Col xs={{ span: 3, offset: 3 }} sm={{ span: 2, offset: 6 }}>
                                <div className="text-center">
                                    <Button size="xs" variant="light" className={`m-0 py-0 ${BSafesStyle.toolbarButton}`} id="moveItemsBtn" onClick={handleMove}>
                                        <i className="fa fa-2x fa-hand-o-right text-white" aria-hidden="true" />
                                        <h6 className="text-center m-0 text-white text-capitalize">Move</h6>
                                    </Button>
                                </div>
                            </Col>
                            <Col xs={3} sm={2}>
                                <div className="text-center">
                                    <Button size="xs" variant="light" className={`m-0 py-0 ${BSafesStyle.toolbarButton}`} id="trashItemsBtn" onClick={handleTrashSelected}>
                                        <i className="fa fa-2x fa-trash text-white" aria-hidden="true" />
                                        <h6 className="text-center m-0 text-white text-capitalize">Trash</h6>
                                    </Button>
                                </div>
                            </Col>
                            <Col xs={3} sm={2}>
                                <div className="text-center">
                                    <Button size="xs" variant="light" className={`m-0 py-0 ${BSafesStyle.toolbarButton}`} id="deselectItems" onClick={handleClearSelected}>
                                        <i className="fa fa-2x fa-remove text-white" aria-hidden="true" />
                                        <h6 className="text-center m-0 text-white text-capitalize">Cancel</h6>
                                    </Button>
                                </div>
                            </Col>
                        </Row>
                    </Col>
                </Row>
             </Collapse>
        </>
    )
}