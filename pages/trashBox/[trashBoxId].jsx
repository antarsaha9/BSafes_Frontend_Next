import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useSelector, useDispatch } from 'react-redux'

import Container from 'react-bootstrap/Container'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'

import BSafesStyle from '../../styles/BSafes.module.css'

import Scripts from "../../components/scripts";
import ContentPageLayout from '../../components/layouts/contentPageLayout';

import TopControlPanel from "../../components/topControlPanel"
import ItemTopRows from "../../components/itemTopRows";
import PageCommons from "../../components/pageCommons";

import { changeContainerOnly, clearContainer, clearItems, emptyTrashBoxItems, initContainer, listItemsThunk, restoreItemsFromTrash, setWorkspaceKeyReady } from '../../reduxStore/containerSlice';
import { abort, clearPage, decryptPageItemThunk, getPageItemThunk, getPageCommentsThunk } from "../../reduxStore/pageSlice";
import { debugLog } from "../../lib/helper";
import { getCoverAndContentsLink } from "../../lib/bSafesCommonUI"
import { Button } from "react-bootstrap";
import ItemCard from "../../components/itemCard";

export default function Page() {
    const debugOn = true;
    debugLog(debugOn, "Rendering item");
    const dispatch = useDispatch();
    const router = useRouter();
    const [trashBoxId, setTrashBoxId] = useState(null);
    const [pageCleared, setPageCleared] = useState(false);
    const [containerCleared, setContainerCleared] = useState(false);
    const workspace = useSelector(state => state.container.workspace);
    const expandedKey = useSelector(state => state.auth.expandedKey);
    const searchKey = useSelector(state => state.auth.searchKey);
    const searchIV = useSelector(state => state.auth.searchIV);
    const isLoggedIn = useSelector(state => state.auth.isLoggedIn);
    const selectedItems = useSelector(state => state.container.selectedItems);

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
    }, [])
    useEffect(() => {
        if (router.query.trashBoxId) {
            console.log(router.query.trashBoxId)

            dispatch(clearPage());
            dispatch(clearItems());
            dispatch(setWorkspaceKeyReady(false));

            debugLog(debugOn, "set trashBoxId: ", router.query.trashBoxId);
            setTrashBoxId(router.query.trashBoxId);
            setContainerCleared(true);
        }
    }, [router.query.trashBoxId]);

    useEffect(() => {
        if (containerCleared && isLoggedIn) {
            debugLog(debugOn, "Dispatch initWorkspace ...");
            dispatch(initContainer({ container: trashBoxId, workspaceId: trashBoxId, workspaceKey: expandedKey, searchKey, searchIV }));

        }
    }, [containerCleared, isLoggedIn]);

    useEffect(() => {
        debugLog(debugOn, "useEffect [workspaceKey] ...");
        if (workspace && containerCleared) {
            setPageCleared(false);
            setContainerCleared(false);
            dispatch(listItemsThunk({ pageNumber: 1 }));
        }
    }, [trashBoxId, workspace]);

    const itemsState = useSelector(state => state.container.items);
    const items = itemsState.map((item, index) =>
        <Row key={index}>
            <Col lg={{ span: 10, offset: 1 }}>
                <ItemCard item={item} isOpenable={false} />
            </Col>
        </Row>
    );

    const handleEmpty = (items) => {
        const payload = {
            teamSpace: workspace,
            trashBoxId: trashBoxId,
            selectedItems: JSON.stringify(items),
        }
        emptyTrashBoxItems({ payload }).then(() => {
            dispatch(listItemsThunk({ pageNumber: 1 }));
        })
    }
    const handleRestore = (items) => {
        const payload = {
            teamSpace: workspace,
            trashBoxId: trashBoxId,
            selectedItems: items,
        }
        restoreItemsFromTrash({ payload }).then(() => {
            dispatch(listItemsThunk({ pageNumber: 1 }));
        })
    }

    const handleEmptyAll = () => {
        handleEmpty(itemsState)
    }
    const handleEmptySelected = () => {
        const items = itemsState.filter(i => selectedItems.find(si => si === i.id)).map(i => ({ ...i.itemPack, id: i.id }))
        handleEmpty(items);
    }
    const handleRestoreAll = () => {
        handleRestore(itemsState)
    }
    const handleRestoreSelected = () => {
        const items = itemsState.filter(i => selectedItems.find(si => si === i.id)).map(i => ({ ...i.itemPack, id: i.id }))
        handleRestore(items)
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

                            </div>
                        </Col>
                    </Row>
                </Container>
            </ContentPageLayout>
        </div>

    )
}