import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useSelector, useDispatch } from 'react-redux'

import Container from 'react-bootstrap/Container'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Button from "react-bootstrap/Button";

import BSafesStyle from '../../styles/BSafes.module.css'

import ContentPageLayout from '../../components/layouts/contentPageLayout';
import ItemCard from "../../components/itemCard";

import { initWorkspaceThunk, changeContainerOnly, clearContainer, clearItems, emptyTrashBoxItems, initContainer, listItemsThunk, restoreItemsFromTrash, setWorkspaceKeyReady, getTrashBoxThunk, clearSelected } from '../../reduxStore/containerSlice';
import { abort, clearPage, itemPathLoaded } from "../../reduxStore/pageSlice";

import { debugLog } from "../../lib/helper";
import { getCoverAndContentsLink } from "../../lib/bSafesCommonUI"
import { PaginationControl } from "react-bootstrap-pagination-control";

export default function TrashBox() {
    const debugOn = true;
    const dispatch = useDispatch();
    const router = useRouter();

    const [space, setSpace] = useState(null);
    const [containerCleared, setContainerCleared] = useState(false);

    const isLoggedIn = useSelector( state => state.auth.isLoggedIn);
    const searchKey = useSelector( state => state.auth.searchKey);
    const searchIV = useSelector( state => state.auth.searchIV);
    const expandedKey = useSelector( state => state.auth.expandedKey );

    const workspaceId = useSelector( state => state.container.workspace );
    const workspaceKey = useSelector( state => state.container.workspaceKey);
    const workspaceKeyReady = useSelector( state => state.container.workspaceKeyReady);
    const itemsState = useSelector(state => state.container.items);
    const selectedItems = useSelector(state => state.container.selectedItems);
    const trashBoxId = useSelector(state => state.container.trashBoxId);
    const pageNumber = useSelector( state => state.container.pageNumber);
    const total = useSelector( state => state.container.total);
    const itemsPerPage = useSelector(state => state.container.itemsPerPage);

    const items = itemsState.map((item, index) =>
        <Row key={index}>
            <Col lg={{ span: 10, offset: 1 }}>
                <ItemCard item={item} isOpenable={false} />
            </Col>
        </Row>
    );
    
    const handleRestore = async (items) => {
        const payload = {
            teamSpace: workspaceId,
            trashBoxId: trashBoxId,
            selectedItems: items,
        }
        try {
            await restoreItemsFromTrash({ payload });
            dispatch(clearSelected());
            listItems({});
        } catch(error) {
            debugLog(debugOn, 'handleRestore failed: ', error)
        }
    }

    const handleEmpty = async (items) => {
        const payload = {
            teamSpace: workspaceId,
            trashBoxId: trashBoxId,
            selectedItems: items,
        }
        try {
            await emptyTrashBoxItems({ payload });
            listItems({});
        } catch(error) {
            debugLog(debugOn, 'handleEmpty failed: ', error)
        }
    }

    const handleEmptyAll = () => {
        handleEmpty(itemsState)
    }

    const handleEmptySelected = () => {
        const items = itemsState.filter(i => selectedItems.find(si => si === i.id));
        handleEmpty(items);
    }
    const handleRestoreAll = () => {
        handleRestore(itemsState)
    }
    const handleRestoreSelected = () => {
        const items = itemsState.filter(i => selectedItems.find(si => si === i.id));
        handleRestore(items)
    }

    useEffect(() => {
        const handleRouteChange = (url, { shallow }) => {
            console.log(
                `App is changing to ${url} ${shallow ? 'with' : 'without'
                } shallow routing`
            )
            dispatch(abort());
        }

        router.events.on('routeChangeStart', handleRouteChange)

        // If the component is unmounted, unsubscribe
        // from the event with the `off` method:
        return () => {
            router.events.off('routeChangeStart', handleRouteChange)
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    useEffect(() => {
        if (isLoggedIn && router.query.spaceId) {
            console.log(router.query.spaceId)

            dispatch(clearItems());
            dispatch(setWorkspaceKeyReady(false));

            debugLog(debugOn, "set space: ", router.query.spaceId);
            setSpace(router.query.spaceId);
            if(router.query.spaceId === workspaceId) {
                dispatch(changeContainerOnly({container: 'Unknown'}))
                dispatch(setWorkspaceKeyReady(true));
            } else {
                dispatch(clearContainer());
                setContainerCleared(true);
            }    
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isLoggedIn, router.query.spaceId]);

    useEffect(()=>{
        if(space && containerCleared) {
            if (space.substring(0, 1) === 'u') {
                dispatch(initContainer({container:'Unknown', workspaceId:space, workspaceKey: expandedKey, searchKey, searchIV }));
                dispatch(setWorkspaceKeyReady(true));
            } else {
                dispatch(initWorkspaceThunk({teamId:space, container: 'Unknown'}));          
            }
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [space, containerCleared]);

    useEffect(() => {
        if(!workspaceId || !workspaceKeyReady) return;
        dispatch(clearPage());
        const itemPath = [{_id: workspaceId}, {_id:'t:workspaceId'}];
        dispatch(itemPathLoaded(itemPath));
        dispatch(getTrashBoxThunk());
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [workspaceId, workspaceKeyReady ]);

    useEffect(()=> {
        if(!trashBoxId || trashBoxId === 'Unknown') return;
        dispatch(changeContainerOnly({container: trashBoxId}));
        listItems({})
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [trashBoxId])

    const listItems = ({ pageNumber = 1 }) => {
        dispatch(listItemsThunk({ pageNumber }));
    }

    return (
        <div className={BSafesStyle.pageBackground}>
            <ContentPageLayout displayItemToolbar={false}>
                <Container fluid>
                    <Row>
                        <Col lg={{ span: 10, offset: 1 }}>
                            <div className={`${BSafesStyle.pagePanel} ${BSafesStyle.boxPanel}`}>
                                <br />
                                <br />
                                <p className='fs-1 text-center'>Trash</p>
                                <div >
                                    <Row >
                                        <Col xs={{ span: 10, offset: 1 }}>
                                            {selectedItems.length === 0 ?
                                                <div className="pull-right">
                                                    <Button variant="link" className="text-capitalize" onClick={handleRestoreAll}>Restore all</Button>
                                                    {/* &nbsp;&nbsp;&nbsp; */}
                                                    <Button variant="link" className="text-danger text-capitalize" onClick={handleEmptyAll}>Empty all</Button>
                                                </div> :
                                                <div className="pull-right">
                                                    <Button variant="link" className="text-capitalize" onClick={handleRestoreSelected}>Restore</Button>
                                                    {/* &nbsp;&nbsp;&nbsp; */}
                                                    <Button variant="link" className="text-danger text-capitalize" onClick={handleEmptySelected}>Empty</Button>
                                                </div>}
                                        </Col>
                                    </Row>
                                </div>
                                {/* <Row className="justify-content-center">
                                    <AddAnItemButton addAnItem={addAnItem} />
                                </Row>
                                <NewItemModal show={showNewItemModal} handleClose={handleClose} handleCreateANewItem={handleCreateANewItem} /> */}
                                <br />
                                <br />

                                {items}
                                {itemsState && itemsState.length > 0 &&
                                    <Row>
                                        <Col sm={{ span: 10, offset: 1 }} md={{ span: 8, offset: 2 }}>
                                            <div className='mt-4 d-flex justify-content-center'>
                                                <PaginationControl
                                                    page={pageNumber}
                                                    // between={4}
                                                    total={total}
                                                    limit={itemsPerPage}
                                                    changePage={(page) => {
                                                        listItems({ pageNumber: page })
                                                    }}
                                                    ellipsis={1}
                                                />
                                            </div>
                                        </Col>
                                    </Row>}
                            </div>
                        </Col>
                    </Row>
                </Container>
            </ContentPageLayout>
        </div>

    )
}