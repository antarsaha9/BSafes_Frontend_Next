import { useState, useEffect } from "react";
import { useSelector, useDispatch } from 'react-redux'
import {useRouter} from "next/router";

import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'

import BSafesStyle from '../../../styles/BSafes.module.css'

import ContentPageLayout from '../../../components/layouts/contentPageLayout';
import PageItemWrapper from "../../../components/pageItemWrapper";
import TopControlPanel from "../../../components/topControlPanel";
import ItemRow from "../../../components/itemRow";
import TurningPageControls from "../../../components/turningPageControls";
import PaginationControl from "../../../components/paginationControl";

import { setDemoMode } from "../../../reduxStore/auth";
import { setDemoWorkspace, listItemsThunk, searchItemsThunk, getFirstItemInContainer, getLastItemInContainer } from "../../../reduxStore/containerSlice";
import { NotebookDemo } from "../../../lib/productID";
import { setupDemo } from "../../../lib/demoHelper";
import { debugLog } from "../../../lib/helper";

const productID = NotebookDemo;

export default function NotebookContents() {
    const debugOn = false;
    debugLog(debugOn, "Rendering Contents");
    const dispatch = useDispatch();
    const router = useRouter();

    const [searchValue, setSearchValue] = useState(null);

    const containerInWorkspace = useSelector( state => state.container.container);
    const mode = useSelector( state => state.container.mode);
    const itemsState = useSelector( state => state.container.items);
    const pageNumber = useSelector( state => state.container.pageNumber);
    const totalNumberOfPages = useSelector( state => state.container.totalNumberOfPages );
    const itemsPerPage = useSelector(state => state.container.itemsPerPage);
    const total = useSelector(state => state.container.total);

    const pageItemId = useSelector( state => state.page.id);

    const items = itemsState.map( (item, index) => 
        <ItemRow itemIndex={index} key={index} item={item} productID={productID}/>
    );


    function gotoAnotherPage (anotherPageNumber) {
        if(!(pageItemId)) return;

        let idParts, nextPageId, newLink;
        idParts = pageItemId.split(':');
        idParts.splice(0, 1);
        switch(anotherPageNumber) {
            case '-1':
                if(pageNumber > 1) {

                } else {
                    newLink = `/${productID}/${containerInWorkspace}`;  
                }
                break;
            case '+1':
                if(!totalNumberOfPages || (pageNumber === totalNumberOfPages) ) {
                    nextPageId = 'np:'+ idParts.join(':') + ':1';
                    newLink = `/${productID}/p/${nextPageId}`; 
                } else {

                }
                break;
            default:
                idParts.push(anotherPageNumber);
                nextPageId = 'np:'+ idParts.join(':');
                newLink = `/${productID}/p/${nextPageId}`;         
        }      

        router.push(newLink);
    }

    const gotoNextPage = () =>{
        debugLog(debugOn, "Next Page ");
        gotoAnotherPage('+1');
    }

    const gotoPreviousPage = () => {
        debugLog(debugOn, "Previous Page ");
        gotoAnotherPage('-1');
    }

    const handleCoverClicked = () => {
        let newLink = `/${productID}/${containerInWorkspace}`;
        router.push(newLink);
    }

    const handlePageNumberChanged = (anotherPageNumber) => {
        debugLog(debugOn, "handlePageNumberChanged: ", anotherPageNumber);
        gotoAnotherPage(anotherPageNumber);
    }

    const handleSubmitSearch = (value) => {
        setSearchValue(value);
        dispatch(searchItemsThunk({searchValue:value, pageNumber:1}));
    }

    const handleCancelSearch = () => {
        dispatch(listItemsThunk({pageNumber: 1}));
    }

    const handleGoToFirstItem = async () => {
        try {
            const itemId = await getFirstItemInContainer(containerInWorkspace, dispatch);
            const newLink = `/${productID}/p/${itemId}`;
            router.push(newLink);
        } catch(error) {
            alert("Could not get the first item in the container");
        }
    }

    const handleGoToLastItem = async () => {
        try {
            const itemId = await getLastItemInContainer(containerInWorkspace, dispatch);
            const newLink = `/${productID}/p/${itemId}`;
            router.push(newLink);
        } catch(error) {
            alert("Could not get the first item in the container");
        }
    }

    const listItems = ({ pageNumber = 1, searchMode }) => {
        const derivedSearchMode = searchMode || mode;
        if (derivedSearchMode === 'listAll')
            dispatch(listItemsThunk({ pageNumber }));
        else if (derivedSearchMode === 'search')
            dispatch(searchItemsThunk({ searchValue, pageNumber }));
    }

    useEffect(() => {
        if(setupDemo()){
            dispatch(setDemoMode(true));
            dispatch(setDemoWorkspace());
        }
    }, [])

    return (
        <div className={BSafesStyle.pageBackground}>
            <ContentPageLayout> 
                <PageItemWrapper itemId={router.query.itemId}>
                    <br />
                        <TopControlPanel onCoverClicked={handleCoverClicked} onPageNumberChanged={handlePageNumberChanged} onSubmitSearch={handleSubmitSearch} onCancelSearch={handleCancelSearch} onGotoFirstItem={handleGoToFirstItem} onGotoLastItem={handleGoToLastItem}></TopControlPanel>
                    <br />  
                    <Row>
                        <Col lg={{span:10, offset:1}}>
                            <div className={`${BSafesStyle.pagePanel} ${BSafesStyle.notebookPanel}`}>
                                <br />
                                <br />
                                <p className='fs-1 text-center'>Contents</p>
                                <Row>
                                    <Col xs={{span:2, offset:1}} sm={{span:2, offset:1}} md={{span:1, offset:1}}>
           	                            <p className="fs-5">Page</p> 
                                    </Col> 
                                    <Col xs={8} sm={8} md={9}>
              	                        <p className="fs-5">Title</p> 
                                    </Col>
                                </Row>
                                <Row>
                                    <Col xs={{span:10, offset:1}}>
                                        <hr className="mt-1 mb-1"/>
                                    </Col>
                                </Row>
                                {items}
                                {itemsState && itemsState.length > 0 && (total > itemsPerPage) &&
                                    <Row>
                                        <Col sm={{ span: 10, offset: 1 }} md={{ span: 8, offset: 2 }}>
                                            <div className='mt-4 d-flex justify-content-center'>
                                                <PaginationControl
                                                    page={pageNumber}
                                                    // between={4}
                                                    total={total}
                                                    limit={itemsPerPage}
                                                    changePage={(page) => {
                                                        listItems({pageNumber:page})
                                                    }}
                                                    ellipsis={1}
                                                />
                                            </div>
                                        </Col>
                                    </Row>}
                            </div>
                        </Col>
                    </Row>
                    <TurningPageControls onNextClicked={gotoNextPage} onPreviousClicked={gotoPreviousPage} />
                </PageItemWrapper>
            </ContentPageLayout>
        </div>
    )
}