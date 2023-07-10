import { useEffect, useState } from "react";
import {useRouter} from "next/router";
import { useSelector, useDispatch } from 'react-redux'

import Container from 'react-bootstrap/Container'

import format from "date-fns/format";

import BSafesStyle from '../styles/BSafes.module.css'

import { clearContainer, initContainer, initWorkspaceThunk, changeContainerOnly, clearItems, listItemsThunk, setWorkspaceKeyReady, setStartDateValue, setDiaryContentsPageFirstLoaded} from '../reduxStore/containerSlice';
import { abort, clearPage, setChangingPage, setPageItemId, setPageStyle, decryptPageItemThunk, getPageItemThunk, getPageCommentsThunk } from "../reduxStore/pageSlice";

import { debugLog } from "../lib/helper";


const PageItemWrapper = ({ itemId, children}) => {
    const debugOn = true;

    const dispatch = useDispatch();
    const router = useRouter();

    const [pageCleared, setPageCleared] = useState(false); 
    const [containerCleared, setContainerCleared] = useState(false);

    const accountVersion = useSelector( state => state.auth.accountVersion);
    const isLoggedIn = useSelector( state => state.auth.isLoggedIn);
    const searchKey = useSelector( state => state.auth.searchKey);
    const searchIV = useSelector( state => state.auth.searchIV);
    const expandedKey = useSelector( state => state.auth.expandedKey );

    const navigationInSameContainer = useSelector( state => state.container.navigationInSameContainer);
    const containerInWorkspace = useSelector( state => state.container.container);
    const workspace = useSelector(state => state.container.workspace);
    const workspaceKey = useSelector( state => state.container.workspaceKey);
    const workspaceKeyReady = useSelector( state => state.container.workspaceKeyReady);
    const startDateValue = useSelector( state => state.container.startDateValue);
    const [startDate, setStartDate] = useState(new Date(startDateValue));

    const pageItemId = useSelector(state => state.page.id);
    const pageNumber = useSelector( state=> state.page.pageNumber);
    const navigationMode = useSelector(state => state.page.navigationMode);
    const space = useSelector( state => state.page.space);
    const container = useSelector( state => state.page.container);
    const itemCopy = useSelector( state => state.page.itemCopy);

    useEffect(() => {
        const handleRouteChange = (url, { shallow }) => {
          console.log(
            `App is changing to ${url} ${
              shallow ? 'with' : 'without'
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
    }, []);

    useEffect(()=> {
      if(isLoggedIn && itemId) {
        debugLog(debugOn, "page wrapper useEffect itemId: ", itemId);
        dispatch(clearPage());
        dispatch(setChangingPage(false));
        setPageCleared(true);
        dispatch(setWorkspaceKeyReady(false));
        debugLog(debugOn, "set pageItemId: ", router.query.itemId);
        dispatch(setPageItemId(router.query.itemId)); 

        let path = router.asPath;
        path = path.split('/')[2];
        if(path === 'contents') {
          dispatch(clearItems());
          let pageType = itemId.split(':')[0];
          if(pageType === 'd') {
            dispatch(setStartDateValue((new Date()).getTime()));
            dispatch(setDiaryContentsPageFirstLoaded(false));
          }
        }
      }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isLoggedIn, itemId]);

    useEffect(()=>{
      if(pageItemId && pageCleared) {
          debugLog(debugOn, "Dispatch getPageItemThunk ...");
          dispatch(getPageItemThunk({ itemId: pageItemId, navigationInSameContainer }));
      }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [pageItemId, pageCleared]);

    useEffect(() => {
      if (pageCleared && navigationMode) {
          debugLog(debugOn, "setContainerData ...");
          dispatch(setContainerData({ itemId: pageItemId, container: { space: workspace, id: containerInWorkspace } }));
      }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [navigationMode]);

    useEffect(()=>{
      if(pageNumber) {
          debugLog(debugOn, "pageNumber: ", pageNumber);
          if(pageNumber%2) {
              dispatch(setPageStyle(BSafesStyle.leftPagePanel));
          } else {
              dispatch(setPageStyle(BSafesStyle.rightPagePanel));
          }
      }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [pageNumber])

    useEffect(()=>{
      if(space && pageCleared) {  
        let path = router.asPath;
        path = path.split('/')[2];      
        
        if(path !== 'contents' && container === containerInWorkspace ) {
          dispatch(setWorkspaceKeyReady(true));
          return;
        } 

        if(path === 'contents' && space === workspace) {
          if(pageItemId !== containerInWorkspace) {
            dispatch(changeContainerOnly({container:pageItemId}));
          }
          dispatch(setWorkspaceKeyReady(true));
          return;
        } else if(space === workspace){
          if(container !== containerInWorkspace) {
            dispatch(changeContainerOnly({container}));
          }
          dispatch(setWorkspaceKeyReady(true));
          return;
        }
        
        dispatch(clearContainer());
        setContainerCleared(true);
      }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [space]);

    useEffect(()=>{
      if(containerCleared) {
          let path = router.asPath;
          path = path.split('/')[2]; 
          if (space.substring(0, 1) === 'u') {
              debugLog(debugOn, "Dispatch initWorkspace ...");
              if(path !== 'contents'){
                dispatch(initContainer({container, workspaceId:space, workspaceKey: expandedKey, searchKey, searchIV }));
              } else {
                dispatch(initContainer({container: pageItemId, workspaceId:space, workspaceKey: expandedKey, searchKey, searchIV }));
              }        
              dispatch(setWorkspaceKeyReady(true));
          } else {
              let teamId;
              if(accountVersion === 'v1') {
                teamId = space.substring(0, space.length - 4);
              } else {
                teamId = space;
              }
              
              if(path !== 'contents'){
                dispatch(initWorkspaceThunk({teamId, container}));
              } else {
                dispatch(initWorkspaceThunk({teamId, container:pageItemId}));
              }            
          }
      }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [containerCleared]);

    useEffect(()=>{
      debugLog(debugOn, "useEffect [workspaceKey] ...");
      let path = router.asPath;
      path = path.split('/')[2]; 
      if(( path !== 'contents' && workspaceKeyReady && workspaceKey && itemCopy && pageCleared)) {
          let pageType = pageItemId.split(':')[0];
          debugLog(debugOn, "Dispatch decryptPageItemThunk ...");
          dispatch(decryptPageItemThunk({itemId:pageItemId, workspaceKey}));
          
          if(!(pageType === 'f' || pageType === 'b' || pageType === 'n'  ||pageType === 'd')) {
            dispatch(getPageCommentsThunk({itemId:pageItemId}));
          }
          
          setPageCleared(false);
          setContainerCleared(false);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [workspaceKeyReady, itemCopy]);

    useEffect(()=>{ 
      debugLog(debugOn, "useEffect [workspaceKey] ...");
      
      if( containerInWorkspace &&  workspaceKeyReady && pageCleared) {
          let pageType = pageItemId.split(':')[0];
          let path = router.asPath;
          path = path.split('/')[2]; 
          if(path === 'contents'){
            setPageCleared(false);
            setContainerCleared(false);
            debugLog(debugOn, "listItemsThunk ...");
            if( pageType !== 'd' ) {
              dispatch(listItemsThunk({pageNumber: 1}));
            } else {
              dispatch(listItemsThunk({startDate: format(startDate, 'yyyyLL')}));
              dispatch(setDiaryContentsPageFirstLoaded(false));
            }    
          }
      }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [workspaceKeyReady, containerInWorkspace]);

    

    return (
        <Container fluid>
            {children}
        </Container>
    )
}

export default PageItemWrapper;