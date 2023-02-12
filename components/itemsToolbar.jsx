import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";

import ListGroup from "react-bootstrap/ListGroup";
import Breadcrumb from "react-bootstrap/Breadcrumb";
import Button from "react-bootstrap/Button";
import Collapse from "react-bootstrap/Collapse";
import Modal from "react-bootstrap/Modal";
import Form from "react-bootstrap/Form";

import BSafesStyle from '../styles/BSafes.module.css'

import { clearSelected, dropItems, listContainerThunk, listItemsThunk, trashItems } from "../reduxStore/containerSlice";
import { debugLog } from "../lib/helper";
import { InputGroup } from "react-bootstrap";

export default function ItemsToolbar(props) {
    const debugOn = true;
    const dispatch = useDispatch();

    const [showMoveModal, setShowMoveModal] = useState(false);
    const [showTrashModal, setShowTrashModal] = useState(false);
    const [containerPath, setContainerPath] = useState(null);
    const [trashConfirmation, setTrashConfirmation] = useState('');

    const selectedItems = useSelector(state => state.container.selectedItems);
    const workspaceId = useSelector(state => state.container.workspace);
    const containerItems = useSelector(state => state.container.items);
    const containerList = useSelector(state => state.container.containerList);

    const currentItemPath = useSelector(state => state.page.itemPath);
    
    const open = selectedItems && selectedItems.length > 0;

    const handleTrashSelected = () => {
        setShowTrashModal(true);
    }

    const handleClearSelected = () => {
        dispatch(clearSelected());
    }
    
    const handleMove = () => {
        setShowMoveModal(true);
        dispatch(listContainerThunk({ container: workspaceId }));
    }
    
    const handleTrash = async () => {
        const itemsCopy = [];
        for(let i=0; i<selectedItems.length; i++) {
            let thisItem = containerItems.find(ele => ele.id === selectedItems[i]);
            thisItem = {id:thisItem.id, container: thisItem.container, position: thisItem.position};
            itemsCopy.push(thisItem);
        }
        const totalUsage = 0; //calculateTotalMovingItemsUsage(items);
        const payload = {
            space: workspaceId,
            items: JSON.stringify(itemsCopy),
            targetSpace: workspaceId,
            sourceContainersPath: JSON.stringify(currentItemPath.map(ci => ci.id)),
            originalContainer: workspaceId,
            totalUsage: JSON.stringify(totalUsage),
        }
        try {
            await trashItems({payload});
            setShowTrashModal(false);
            setTrashConfirmation('');
            handleClearSelected()
            dispatch(listItemsThunk({ pageNumber: 1 }));
        } catch (error) {
            debugLog(debugOn, "Moving items failed.")
        }
    }

    const onContainerClick = (container) => {
        const containerElementindexInPath = containerPath.findIndex(e => e.id === container.id)
        console.log(containerElementindexInPath);
        if (containerElementindexInPath >= 0)
            setContainerPath(containerPath.slice(0, containerElementindexInPath + 1))
        else
            setContainerPath([...containerPath, {
                title: container.title,
                id: container.id
            }])
        dispatch(listContainerThunk({ container: container.id }))
    }
    
    const handleDrop = async () => {
        const itemsCopy = [];
        for(let i=0; i<selectedItems.length; i++) {
            let thisItem = containerItems.find(ele => ele.id === selectedItems[i]);
            thisItem = {id:thisItem.id, container: thisItem.container, position: thisItem.position};
            itemsCopy.push(thisItem);
        }
        const totalUsage = 0; //calculateTotalMovingItemsUsage(items);
        const payload = {
            space: workspaceId,
            items: JSON.stringify(itemsCopy),
            targetItem: containerPath[containerPath.length - 1].id,
            sourceContainersPath: JSON.stringify(currentItemPath.map(ci => ci.id)),
            targetContainersPath: JSON.stringify(containerPath.map(ci => ci.id)),
            totalUsage: JSON.stringify(totalUsage),
        }
        try {
            await dropItems({action:'dropItemsInside', payload});
            setShowMoveModal(false);
            handleClearSelected()
            dispatch(listItemsThunk({ pageNumber: 1 }));
        } catch (error) {
            debugLog(debugOn, "Moving items failed.")
        }
    }

    const handleCloseTrigger = () => {
        setShowMoveModal(false);
    }
    const handleCloseTrashTrigger = () => {
        setTrashConfirmation('');
        setShowTrashModal(false);
    }
    
    useEffect(() => {
        setContainerPath([{
          title: 'Top',
          id: workspaceId
        }])
      }, [workspaceId])
    
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
            <Modal show={showMoveModal} onHide={handleCloseTrigger}>
                <Modal.Header closeButton>
                    <Modal.Title>Move items to</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Breadcrumb>
                        {containerPath && containerPath.map((cp, index) => {
                            return (<Breadcrumb.Item key={cp.title + index} onClick={() => onContainerClick(cp)}>{cp.title}</Breadcrumb.Item>)
                        })}
                    </Breadcrumb>
                    <ListGroup>
                        { true &&
                            containerList.flatMap(container => {
                                let icon = '';
                                if (selectedItems.find(i => i === container.id))
                                    return [];
                                if (container.id.startsWith('f'))
                                    icon = 'fa fa-folder';
                                else if (container.id.startsWith('b'))
                                    icon = 'fa fa-archive';

                                return (
                                    <ListGroup.Item key={container.id} action onClick={() => onContainerClick(container)} className="pt-3 pb-3">
                                        <i className={icon + " me-2 fs-5 fw-light"} aria-hidden="true" />
                                        <em className="fs-5 fw-light">{container.title}</em>
                                    </ListGroup.Item>
                                )
                            })
                        }
                    </ListGroup>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="primary" size="sm" onClick={handleDrop}>
                        Drop
                    </Button>
                </Modal.Footer>
            </Modal>
            <Modal show={showTrashModal} onHide={handleCloseTrashTrigger}>
                <Modal.Header closeButton>
                    <Modal.Title>Are you Sure?</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form >
                        <InputGroup className="mb-3">
                            <Form.Control size="lg" type="text"
                                value={trashConfirmation}
                                onChange={e=>setTrashConfirmation(e.target.value)}
                                placeholder="Yes"
                            />
                        </InputGroup>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="light" size="md" onClick={handleCloseTrashTrigger}>
                        Cancel
                    </Button>
                    <Button variant="primary" size="md" onClick={handleTrash} disabled={trashConfirmation!=='Yes'}>
                        Trash
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    )
}