import { useEffect, useState } from "react";
import {useRouter} from "next/router";
import { useSelector, useDispatch } from 'react-redux'

import Container from 'react-bootstrap/Container'

import BSafesStyle from '../styles/BSafes.module.css'

import { clearContainer, initContainer, setNavigationInSameContainer, setWorkspaceKeyReady} from '../reduxStore/containerSlice';
import { abort, clearPage, setChangingPage, setPageItemId, setPageStyle, decryptPageItemThunk, getPageItemThunk, getPageCommentsThunk } from "../reduxStore/pageSlice";

import { debugLog } from "../lib/helper";


const PageItemWrapper = ({ itemId, children}) => {
    const debugOn = true;

    const dispatch = useDispatch();
    const router = useRouter();

    const [pageCleared, setPageCleared] = useState(false); 
    const [containerCleared, setContainerCleared] = useState(false);

    const searchKey = useSelector( state => state.auth.searchKey);
    const searchIV = useSelector( state => state.auth.searchIV);
    const expandedKey = useSelector( state => state.auth.expandedKey );

    const navigationInSameContainer = useSelector( state => state.container.navigationInSameContainer);
    const containerInWorkspace = useSelector( state => state.container.container);
    const workspace = useSelector(state => state.container.workspace);
    const workspaceKey = useSelector( state => state.container.workspaceKey);
    const workspaceKeyReady = useSelector( state => state.container.workspaceKeyReady);

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
    }, []);

    useEffect(()=> {
      if(itemId) {
        debugLog(debugOn, "page wrapper useEffect itemId: ", itemId);
        dispatch(clearPage());
        dispatch(setChangingPage(false));
        setPageCleared(true);
        dispatch(setWorkspaceKeyReady(false));
        debugLog(debugOn, "set pageItemId: ", router.query.itemId);
        dispatch(setPageItemId(router.query.itemId)); 
      }
    }, [itemId]);

    useEffect(()=>{
      if(pageItemId && pageCleared) {
          debugLog(debugOn, "Dispatch getPageItemThunk ...");
          dispatch(getPageItemThunk({ itemId: pageItemId, navigationInSameContainer }));
      }
    }, [pageItemId, pageCleared]);

    useEffect(() => {
      if (pageCleared && navigationMode) {
          debugLog(debugOn, "setContainerData ...");
          dispatch(setContainerData({ itemId: pageItemId, container: { space: workspace, id: containerInWorkspace } }));
      }
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
    }, [pageNumber])

    useEffect(()=>{
      if(space && pageCleared) {             
          if(container === containerInWorkspace ) {
              dispatch(setWorkspaceKeyReady(true));
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
              dispatch(initContainer({container, workspaceId:space, workspaceKey: expandedKey, searchKey, searchIV }));
              dispatch(setWorkspaceKeyReady(true));
          } else {
          }
      }
    }, [containerCleared]);

    useEffect(()=>{
      debugLog(debugOn, "useEffect [workspaceKey] ...");
      if((workspaceKeyReady && workspaceKey && itemCopy && pageCleared)) {
          debugLog(debugOn, "Dispatch decryptPageItemThunk ...");
          dispatch(decryptPageItemThunk({itemId:pageItemId, workspaceKey}));
          dispatch(getPageCommentsThunk({itemId:pageItemId}));
          setPageCleared(false);
          setContainerCleared(false);
        }
    }, [workspaceKeyReady, itemCopy]);

    return (
        <Container fluid>
            {children}
        </Container>
    )
}

export default PageItemWrapper;