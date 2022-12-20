import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useSelector, useDispatch } from 'react-redux'

import Container from 'react-bootstrap/Container'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Dropdown from 'react-bootstrap/Dropdown'
import Tab from 'react-bootstrap/Tab'
import Tabs from 'react-bootstrap/Tabs'
import Pagination from 'react-bootstrap/Pagination'

import BSafesStyle from '../../../styles/BSafes.module.css'

import Scripts from "../../../components/scripts";
import ContentPageLayout from '../../../components/layouts/contentPageLayout';
import TopControlPanel from "../../../components/folderTopControlPanel";
import ItemTopRows from "../../../components/itemTopRows";
import Editor from "../../../components/editor";
import ContainerOpenButton from "../../../components/containerOpenButton";
import PageCommonControls from "../../../components/pageCommonControls";

import { clearContainer, initContainer, initWorkspace, listItemsThunk } from "../../../reduxStore/containerSlice";
import { clearPage, getPageItemThunk, decryptPageItemThunk, saveTitleThunk, getContainerContentsThunk, searchContainerContentsThunk } from "../../../reduxStore/pageSlice";

import { debugLog } from "../../../lib/helper";
import { createANewItem, getItemLink, getLastAccessedItem } from "../../../lib/bSafesCommonUI";
import format from "date-fns/format";
import getDaysInMonth from "date-fns/getDaysInMonth";
import Link from "next/link";
import AddAnItemButton from "../../../components/addAnItemButton";
import NewItemModal from "../../../components/newItemModal";
import ItemRow from "../../../components/itemRow";

export default function Folder() {
    const debugOn = true;
    debugLog(debugOn, "Rendering Contents");
    const dispatch = useDispatch();
    const router = useRouter();

    const [pageItemId, setPageItemId] = useState(null);
    const [pageCleared, setPageCleared] = useState(false);
    const [containerCleared, setContainerCleared] = useState(false);
    const [workspaceKeyReady, setWorkspaceKeyReady] = useState(false);
    const [selectedItemType, setSelectedItemType] = useState(null);
    const [addAction, setAddAction] = useState(null);
    const [targetItem, setTargetItem] = useState(null);
    const [showNewItemModal, setShowNewItemModal] = useState(false);

    const searchKey = useSelector(state => state.auth.searchKey);
    const searchIV = useSelector(state => state.auth.searchIV);
    const expandedKey = useSelector(state => state.auth.expandedKey);
    const workspaceId = useSelector(state => state.container.workspace);


    const space = useSelector(state => state.page.space);
    const itemCopy = useSelector(state => state.page.itemCopy);


    const workspace = useSelector(state => state.container.workspace);
    const containerInWorkspace = useSelector(state => state.container.container);
    const pageNumber = useSelector(state => state.container.pageNumber);
    const totalNumberOfPages = useSelector(state => state.container.totalNumberOfPages);
    const itemsState = useSelector(state => state.container.items);
    const workspaceKey = useSelector(state => state.container.workspaceKey);
    const workspaceSearchKey = useSelector(state => state.container.searchKey);
    const workspaceSearchIV = useSelector(state => state.container.searchIV);

    const items = itemsState.map((item, index) =>
        <ItemRow key={index} item={item} />
    );

    console.log(items);

    function gotoAnotherPage(anotherPageNumber) {
        if (!(pageItemId)) return;

        let idParts, nextPageId, newLink;
        idParts = pageItemId.split(':');
        idParts.splice(0, 1);
        switch (anotherPageNumber) {
            case '-1':
                if (pageNumber > 1) {

                } else {
                    newLink = `/notebook/${containerInWorkspace}`;
                }
                break;
            case '+1':
                if (pageNumber === totalNumberOfPages) {
                    nextPageId = 'np:' + idParts.join(':') + ':1';
                    newLink = `/notebook/p/${nextPageId}`;
                } else {

                }
                break;
            default:
                idParts.push(anotherPageNumber);
                nextPageId = 'np:' + idParts.join(':');
                newLink = `/notebook/p/${nextPageId}`;
        }

        router.push(newLink);
    }


    const addAnItem = (itemType, addAction, targetItem = null) => {

        setSelectedItemType(itemType);
        setAddAction(addAction);
        setTargetItem(targetItem);
        setShowNewItemModal(true);

    }

    const gotoNextPage = () => {
        debugLog(debugOn, "Next Page ");
        gotoAnotherPage('+1');
    }

    const gotoPreviousPage = () => {
        debugLog(debugOn, "Previous Page ");
        gotoAnotherPage('-1');
    }

    const handleCoverClicked = () => {
        let newLink = `/notebook/${containerInWorkspace}`;
        router.push(newLink);
    }

    const handlePageNumberChanged = (anotherPageNumber) => {
        debugLog(debugOn, "handlePageNumberChanged: ", anotherPageNumber);
        gotoAnotherPage(anotherPageNumber);
    }

    useEffect(() => {
        if (router.query.itemId) {

            dispatch(clearPage());

            debugLog(debugOn, "set pageItemId: ", router.query.itemId);
            setPageItemId(router.query.itemId);
            setPageCleared(true);
        }
    }, [router.query.itemId]);


    useEffect(() => {
        if (pageItemId && pageCleared) {
            debugLog(debugOn, "Dispatch getPageItemThunk ...");
            dispatch(getPageItemThunk({ itemId: pageItemId }));
        }
    }, [pageCleared, pageItemId]);

    useEffect(() => {
        if (space && pageCleared) {
            if (space === workspace) {
                if (pageItemId !== containerInWorkspace) {
                    dispatch(changeContainerOnly({ container: pageItemId }));
                }
                setWorkspaceKeyReady(true);
                return;
            }

            dispatch(clearContainer());
            setContainerCleared(true);

        }
    }, [space]);

    useEffect(() => {
        if (containerCleared) {
            if (space.substring(0, 1) === 'u') {
                debugLog(debugOn, "Dispatch initWorkspace ...");
                dispatch(initContainer({ container: pageItemId, workspaceId: space, workspaceKey: expandedKey, searchKey, searchIV }));
                setWorkspaceKeyReady(true);
            } else {
            }
        }
    }, [containerCleared]);

    useEffect(() => {
        debugLog(debugOn, "useEffect [workspaceKey] ...");
        if (containerInWorkspace && workspaceKeyReady && pageCleared) {
            setPageCleared(false);
            setContainerCleared(false);
            dispatch(listItemsThunk({ pageNumber: 1 }));
        }
    }, [workspaceKeyReady, containerInWorkspace]);

    const handleCreateANewItem = async (title) => {
        debugLog(debugOn, "createANewItem", title);
        setShowNewItemModal(false);


        const item = await createAFol(title, pageItemId, selectedItemType, addAction, targetItem, workspaceKey, searchKey, searchIV);
        const link = getItemLink(item);

        router.push(link);
    }

    return (
        <div>
            <div className={BSafesStyle.pageBackground}>
                <ContentPageLayout>
                    <Container>
                        <br />
                        <TopControlPanel showSearchIcon />
                        <br />
                        <div className={`${BSafesStyle.pagePanel} ${BSafesStyle.diaryPanel} ${BSafesStyle.containerContentsPanel}`}>
                            <br />
                            <br />
                            <h2 className="text-center">Contents</h2>
                            <div className="d-flex justify-content-center">
                                <AddAnItemButton pageOnly addAnItem={addAnItem} />
                            </div>
                            <NewItemModal show={showNewItemModal} handleClose={() => setShowNewItemModal(false)} handleCreateANewItem={handleCreateANewItem} />
                            <Tabs
                                defaultActiveKey="all"
                                className="mb-3 mx-4"
                            >
                                <Tab eventKey="all" title="All" >
                                    <div className="searchResult">
                                        <div className="resultItems">
                                            {items}
                                        </div>
                                    </div>
                                    <div className="d-flex justify-content-center mt-4">
                                        <Pagination size="sm">{[1].map(page => (
                                            <Pagination.Item key={page} active={page === page}>
                                                {page}
                                            </Pagination.Item>
                                        ))}</Pagination>

                                    </div>

                                </Tab>
                            </Tabs>
                        </div>
                    </Container>
                </ContentPageLayout>
                <Scripts />
            </div>
        </div>
    )
}
