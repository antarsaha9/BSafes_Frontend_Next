import { useEffect } from "react";
import { useState } from "react";
import { Breadcrumb, Button, Col, Collapse, ListGroup, Modal, Row } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import { clearSelected, dropItemsInside, listContainerThunk, listItemsThunk } from "../reduxStore/containerSlice";
import BSafesStyle from '../styles/BSafes.module.css'


export default function ItemToolbar(props) {
  const selectedItems = useSelector(state => state.container.selectedItems);
  const containerId = useSelector(state => state.container.workspace);
  const containerItems = useSelector(state => state.container.items);
  const containerList = useSelector(state => state.container.containerList);
  const curentItemPath = useSelector(state => state.container.itemPath).data;
  const [showMoveModal, setShowMoveModal] = useState(false);
  const [containerPath, setContainerPath] = useState([{
    title: 'Top',
    id: containerId
  }]);
  const open = selectedItems && selectedItems.length > 0;
  const dispatch = useDispatch();

  useEffect(() => {
    setContainerPath([{
      title: 'Top',
      id: containerId
    }])
  }, [containerId])

  const handleClearSelected = () => {
    dispatch(clearSelected());
  }
  const handleTrashSelected = () => {
    dispatch(clearSelected());
  }

  const handleMove = () => {
    setShowMoveModal(true);
    dispatch(listContainerThunk({ container: containerId }))
  };

  const onContainerClick = (container) => {
    setContainerPath([...containerPath, {
      title: container.title,
      id: container.id
    }])
    dispatch(listContainerThunk({ container: container.id }))
  }

  const handleDrop = () => {
    const items = containerItems.filter(ci => selectedItems.includes(ci.id))
    const totalUsage = calculateTotalMovingItemsUsage(items);
    const payload = {
      space: containerId,
      items: JSON.stringify(items),
      targetItem: containerPath[containerPath.length - 1].id,
      sourceContainersPath: JSON.stringify(curentItemPath.map(ci => ci.id)),
      targetContainersPath: JSON.stringify(containerPath.map(ci => ci.id)),
      totalUsage: JSON.stringify(totalUsage),
    }
    dropItemsInside(payload).then(() => {
      setShowMoveModal(false);
      handleClearSelected()
      dispatch(listItemsThunk({ pageNumber: 1 }));
    })
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
          </Col >
        </Row >
      </Collapse>
      <Modal show={showMoveModal} onHide={() => setShowMoveModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Move items to</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Breadcrumb>
            {containerPath.map((cp, index) => {
              return (<Breadcrumb.Item key={cp.title + index}>{cp.title}</Breadcrumb.Item>)
            })}
          </Breadcrumb>
          <ListGroup>
            {
              containerList.flatMap(container => {
                var icon = '';
                if (selectedItems.find(i => i === container.id))
                  return [];
                if (container.id.startsWith('f'))
                  icon = 'fa fa-folder';
                else if (container.id.startsWith('b'))
                  icon = 'fa fa-archive';

                return (
                  <ListGroup.Item action onClick={() => onContainerClick(container)} className="pt-3 pb-3">
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
      {/* <div class="modal fade" id="moveItemsModal" tabindex="-1" role="dialog" aria-labelledby="moveItemsModalLabel" aria-hidden="true">
        <div class="modal-dialog">
          <div class="modal-content">
            <div class="modal-header">
              <button type="button" class="close" id="closeMoveItemsModal" data-dismiss="modal" aria-hidden="true">&times;</button>
              <h4 class="modal-title" id="moveItemsModalLabel">Move items to</h4>
            </div>
            <div class="modal-body">
              <div class="moveItemsPathRow">
                <ul class="moveItemsPathItemsList breadcrumb">
                </ul>
                <li class="moveItemsPathItemTemplate hidden"><a href="#" class="">Container</a></li>
                <li class="moveItemsPathItemNameTemplate hidden"></li>
              </div>
              <div class="warningMessage hidden">
                <p class="E74C3CText">Oops, you could only drop pages in a folder!</p>
              </div>
              <div class="list-group containersList">

              </div>
              <div class="text-center">
                <a href="#" class="hidden" id="moreContainersBtn">More</a>
              </div>
              <a href="#" class="boxTemplate list-group-item hidden">
                <i class="fa fa-archive safeItemTypeIcon" aria-hidden="true"></i><em class="fontSize18Px">Box</em>
              </a>
              <a href="#" class="folderTemplate list-group-item hidden">
                <i class="fa fa-folder-o safeItemTypeIcon" aria-hidden="true"></i><em class="fontSize18Px">Folder</em>
              </a>
              <div class="text-right">
                <a href="#" class="btn btn-primary btn-sm" id="dropItemsBtn">Drop</a>
              </div>
            </div>
          </div>
        </div>
      </div> */}
    </>
  )
}
function calculateTotalMovingItemsUsage(selectedItemsInContainer) {
  var totalItemVersions = 0;
  var totalStorage = 0;

  for (var i = 0; i < selectedItemsInContainer.length; i++) {
    if (selectedItemsInContainer[i].totalStorage) {
      totalItemVersions += selectedItemsInContainer[i].totalItemVersions;
      totalStorage += selectedItemsInContainer[i].totalStorage;

    } else {
      totalItemVersions += selectedItemsInContainer[i].version;
      totalStorage += selectedItemsInContainer[i].totalItemSize;
    }
  }
  return {
    totalItemVersions: totalItemVersions,
    totalStorage: totalStorage
  };
}