import { useEffect, useState } from "react";
import { useSelector, useDispatch } from 'react-redux'
import {useRouter} from "next/router";

import Container from 'react-bootstrap/Container'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'

import format from "date-fns/format";

import BSafesStyle from '../../../styles/BSafes.module.css'

import ContentPageLayout from '../../../components/layouts/contentPageLayout';
import DiaryTopControlPanel from "../../../components/diaryTopControlPanel";
import ItemRow from "../../../components/itemRow";
import TurningPageControls from "../../../components/turningPageControls";

import { clearContainer, initContainer, changeContainerOnly, listItemsThunk } from "../../../reduxStore/containerSlice";
import { clearPage, getPageItemThunk } from "../../../reduxStore/pageSlice";
import { debugLog } from "../../../lib/helper";


export default function DiaryContents() {
    const debugOn = true;
    debugLog(debugOn, "Rendering Contents");
    const dispatch = useDispatch();
    const router = useRouter();

    const [pageItemId, setPageItemId] = useState(null);
    const [pageCleared, setPageCleared] = useState(false);
    const [containerCleared, setContainerCleared] = useState(false);
    const [workspaceKeyReady, setWorkspaceKeyReady] = useState(false);

    const searchKey = useSelector( state => state.auth.searchKey);
    const searchIV = useSelector( state => state.auth.searchIV);
    const expandedKey = useSelector( state => state.auth.expandedKey );

    const space = useSelector( state => state.page.space);
    const itemCopy = useSelector( state => state.page.itemCopy);


    const workspace = useSelector( state => state.container.workspace);
    const containerInWorkspace = useSelector( state => state.container.container);
    const pageNumber = useSelector( state => state.container.pageNumber);
    const totalNumberOfPages = useSelector( state => state.container.totalNumberOfPages );
    const itemsState = useSelector( state => state.container.items);
    const workspaceKey = useSelector( state => state.container.workspaceKey);
    const workspaceSearchKey = useSelector( state => state.container.searchKey);
    const workspaceSearchIV = useSelector( state => state.container.searchIV);


    const [startDate, setStartDate] = useState(new Date());
    const [allItemsInCurrentMonth, setAllItemsInCurrentMonth] = useState([]);
    const showingMonthDate = startDate;
    const currentMonthYear = format(showingMonthDate, 'MMM. yyyy') //=> 'Nov'

    const items = allItemsInCurrentMonth.map( (item, index) => 
        <ItemRow key={index} item={item}/>
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
                    newLink = `/notebook/${containerInWorkspace}`;  
                }
                break;
            case '+1':
                if(pageNumber === totalNumberOfPages) {
                    nextPageId = 'np:'+ idParts.join(':') + ':1';
                    newLink = `/notebook/p/${nextPageId}`; 
                } else {

                }
                break;
            default:
                idParts.push(anotherPageNumber);
                nextPageId = 'np:'+ idParts.join(':');
                newLink = `/notebook/p/${nextPageId}`;         
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
        let newLink = `/notebook/${containerInWorkspace}`;
        router.push(newLink);
    }

    const handlePageNumberChanged = (anotherPageNumber) => {
        debugLog(debugOn, "handlePageNumberChanged: ", anotherPageNumber);
        gotoAnotherPage(anotherPageNumber);
    }

    const handleSearch = (value) => {
        //dispatch(searchContainerContentsThunk(value, workspaceKey));
    }

    useEffect(()=>{
        if(router.query.itemId) {

            dispatch(clearPage());
            
            debugLog(debugOn, "set pageItemId: ", router.query.itemId);
            setPageItemId(router.query.itemId);
            setPageCleared(true);
        }
    }, [router.query.itemId]);

    useEffect(()=>{
        if(pageItemId && pageCleared) {
            debugLog(debugOn, "Dispatch getPageItemThunk ...");
            dispatch(getPageItemThunk({itemId:pageItemId}));
        }
    }, [pageCleared, pageItemId]);

    useEffect(()=>{
        if(space && pageCleared) {
            if(space === workspace) {
                if(pageItemId !== containerInWorkspace) {
                    dispatch(changeContainerOnly({container:pageItemId}));
                }
                setWorkspaceKeyReady(true);
                return;
            }

            dispatch(clearContainer());
            setContainerCleared(true); 

        }
    }, [space]);

    useEffect(()=>{
        if(containerCleared) {
            if (space.substring(0, 1) === 'u') {
                debugLog(debugOn, "Dispatch initWorkspace ...");
                dispatch(initContainer({container: pageItemId, workspaceId: space, workspaceKey: expandedKey, searchKey, searchIV }));
                setWorkspaceKeyReady(true);
            } else {
            }
        }        
    }, [containerCleared]);

    useEffect(()=>{ 
        debugLog(debugOn, "useEffect [workspaceKey] ...");
        if( containerInWorkspace &&  workspaceKeyReady && pageCleared) {
            setPageCleared(false);
            setContainerCleared(false);
            
            debugLog(debugOn, "listItemsThunk ...");
            dispatch(listItemsThunk({startDate: format(startDate, 'yyyyLL')}));
        }
    }, [workspaceKeyReady, containerInWorkspace]);

    useEffect(()=>{
        debugLog(debugOn, "startDate changed:", format(startDate, 'yyyyLL'))
        setAllItemsInCurrentMonth([]);
        if(workspaceKeyReady && containerInWorkspace) {
            debugLog(debugOn, "startDate changed -> list items");
            dispatch(listItemsThunk({startDate: format(startDate, 'yyyyLL')}));
        }
    }, [startDate])

    useEffect(()=> {
        if(!space || !workspaceKeyReady ) return;
        debugLog(debugOn, "itemsState changed:", )
        let currentYear = startDate.getFullYear();
        let currentMonth = startDate.getMonth();
        let numberOfDays = new Date(currentYear, currentMonth+1, 0).getDate();
        
        let allItems = [];
        let searchStart = 0;
        for(let i=0; i<numberOfDays; i++) {
            let thisPageNumber;
            thisPageNumber = parseInt(format(new Date(currentYear, currentMonth, i+1), 'yyyyLLdd'));
            let j;
            for(j=searchStart; j<itemsState.length; j++) {
                if(itemsState[j].itemPack.pageNumber === thisPageNumber) {
                    allItems.push(itemsState[j]);
                    searchStart = j+1;
                    break;
                } 
            }
            if(j === itemsState.length) {
                let emptyItem = {
                    id: pageItemId.replace('d:', 'dp:') + ':' + format(new Date(currentYear, currentMonth, i+1), 'yyyy-LL-dd'),
                    title: "",
                    itemPack: {
                        pageNumber: thisPageNumber
                    }
                }
                allItems.push(emptyItem);
            }
        }

        setAllItemsInCurrentMonth(allItems);
    
    }, [itemsState]);

    return (
        <div className={BSafesStyle.pageBackground}>
            <ContentPageLayout> 
                <Container fluid>
                    <br />
                    <DiaryTopControlPanel {...{ startDate, setStartDate, handleSearch }} closeDiary={null} datePickerViewMode="monthYear" showSearchIcon />
                    <br />  
                    <Row>
                        <Col lg={{span:10, offset:1}}>
                            <div className={`${BSafesStyle.pagePanel} ${BSafesStyle.diaryPanel}`}>
                                <br />
                                <br />
                                <p className='fs-1 text-center'>{currentMonthYear}</p>
                                <Row>
                                    <Col xs={{span:2, offset:1}} sm={{span:2, offset:1}} md={{span:1, offset:1}}>
           	                            <p>Day</p> 
                                    </Col> 
                                    <Col xs={8} sm={8} md={9}>
              	                        <p>Title</p> 
                                    </Col>
                                </Row>
                                <Row>
                                    <Col xs={{span:10, offset:1}}>
                                        <hr className="mt-0 mb-0"/>
                                    </Col>
                                </Row>
                                {items}
                            </div>
                        </Col>
                    </Row>
                    <TurningPageControls onNextClicked={gotoNextPage} onPreviousClicked={gotoPreviousPage} />
                </Container>
            </ContentPageLayout>
        </div>
    )
}