import { useEffect, useState, useRef} from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from 'next/router';

import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";

import ListGroup from "react-bootstrap/ListGroup";
import Breadcrumb from "react-bootstrap/Breadcrumb";
import Button from "react-bootstrap/Button";
import Collapse from "react-bootstrap/Collapse";
import Modal from "react-bootstrap/Modal";
import Form from "react-bootstrap/Form";
import InputGroup from "react-bootstrap/InputGroup";

import BSafesStyle from '../styles/BSafes.module.css'

import { clearSelected, dropItemsThunk, trashItemsThunk, listContainersThunk, listItemsThunk } from "../reduxStore/containerSlice";
import { debugLog } from "../lib/helper";

export default function ItemsToolbar() {
    const debugOn = true;
    const router = useRouter();
    const dispatch = useDispatch();

    const [boxOnly, setBoxOnly] = useState(false);
    const [showMoveModal, setShowMoveModal] = useState(false);
    const [showTrashModal, setShowTrashModal] = useState(false);
    const [trashConfirmation, setTrashConfirmation] = useState('');
    const [containerPath, setContainerPath] = useState(null);

    const selectedItems = useSelector(state => state.container.selectedItems);
    const workspaceId = useSelector(state => state.container.workspace);
    const container = useSelector( state => state.container.container );
    const containerItems = useSelector(state => state.container.items);
    const containersList = useSelector(state => state.container.containersList);
    const containersPerPage = useSelector(state=>state.container.containersPerPage);
    const containersPageNumber = useSelector(state => state.container.containersPageNumber);
    const containersTotal = useSelector(state=>state.container.containersTotal);

    const currentItemPath = useSelector(state => state.page.itemPath);
    
    const open = !router.asPath.includes('\/trashBox\/') && selectedItems && selectedItems.length > 0;

    const confirmInputRef = useRef(null);

    const handleClearSelected = () => {
        dispatch(clearSelected());
    }
    
    const handleMove = () => {
        setShowMoveModal(true);
        const result = selectedItems.filter((i)=>  i.itemPack.type !== 'P');
        let thisBoxOnly = false;
        if(result.length > 0) thisBoxOnly=true;
        setBoxOnly(thisBoxOnly);
        dispatch(listContainersThunk({ container: workspaceId, boxOnly:thisBoxOnly, pageNumber:1 }));
    }

    const handleMore = () => {
        dispatch(listContainersThunk({ container: containerPath[containerPath.length-1].id, boxOnly:boxOnly, pageNumber:containersPageNumber+1 }));
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
        dispatch(listContainersThunk({ container: container.id, boxOnly, pageNumber:1 }));
    }
    
    const handleDrop = async () => {
        const itemsCopy = selectedItems;
        
        const payload = {
            space: workspaceId,
            items: itemsCopy,
            targetItem: containerPath[containerPath.length - 1].id,
            sourceContainersPath: JSON.stringify(currentItemPath.map(ci => ci._id)),
            targetContainersPath: JSON.stringify(containerPath.map(ci => ci.id))
        }
        try {
            dispatch(dropItemsThunk({action:'dropItemsInside', payload}));
            setShowMoveModal(false);
            //handleClearSelected()
            //dispatch(listItemsThunk({ pageNumber: 1 }));
        } catch (error) {
            debugLog(debugOn, "Moving items failed.")
        }
    }

    const handleCloseTrigger = () => {
        setShowMoveModal(false);
    }

    const handleTrashSelected = () => {
        setShowTrashModal(true);
    }

    const handleTrash = async () => {
        let itemContainer = container;
        const itemsCopy = [];
        for(let i=0; i<selectedItems.length; i++) {
            let thisItem = containerItems.find(ele => ele.id === selectedItems[i].id);
            thisItem = {id:thisItem.id, container: thisItem.container, position: thisItem.position};
            itemsCopy.push(thisItem);
        }
        if(itemContainer === 'root') itemContainer = workspaceId; 
        const totalUsage = 0; //calculateTotalMovingItemsUsage(items);
        const payload = {
            items: itemsCopy,
            targetSpace: workspaceId,
            originalContainer: itemContainer,
            sourceContainersPath: JSON.stringify(currentItemPath.map(ci => ci._id)),
            totalUsage: JSON.stringify(totalUsage),
        }
        try {
            dispatch(trashItemsThunk({payload}));
            setShowTrashModal(false);
            setTrashConfirmation('');
            // handleClearSelected()
            // dispatch(listItemsThunk({ pageNumber: 1 }));
        } catch (error) {
            debugLog(debugOn, "Trashing items failed.")
        }
    }

    const handleTrashModalOnEntered = () => {
        confirmInputRef.current.focus();
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
                            return (<Breadcrumb.Item key={cp.title + index} active={index===containerPath.length-1} onClick={() => onContainerClick(cp)}>{cp.title}</Breadcrumb.Item>)
                        })}
                    </Breadcrumb>
                    <ListGroup>
                        { true &&
                            containersList.flatMap(container => {
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
                    { containersTotal> (containersPageNumber*containersPerPage) &&
                        <div className='text-center'>
                            <Button variant="link" className='text-center' size="sm" onClick={handleMore}>
                                More
                            </Button>
                        </div>
                    }
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="primary" size="sm" onClick={handleDrop}>
                        Drop
                    </Button>
                </Modal.Footer>
            </Modal>
            <Modal show={showTrashModal} onEntered={handleTrashModalOnEntered} onHide={handleCloseTrashTrigger}>
                <Modal.Body>
                    <h3>Are you Sure?</h3>
                    <Form >
                        <InputGroup className="mb-3">
                            <Form.Control ref={confirmInputRef} size="lg" type="text"
                                value={trashConfirmation}
                                onChange={e=>setTrashConfirmation(e.target.value)}
                                placeholder="Yes"
                            />
                        </InputGroup>
                    </Form>
                    <Button variant="primary" className="pull-right" size="md" onClick={handleTrash} disabled={trashConfirmation!=='Yes'}>
                        Trash
                    </Button>
                    <Button variant="light" className="pull-right" size="md" onClick={handleCloseTrashTrigger}>
                        Cancel
                    </Button>
                </Modal.Body>          
            </Modal>
        </>
    )
}