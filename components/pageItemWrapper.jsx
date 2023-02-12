import { useEffect, useState } from "react";
import {useRouter} from "next/router";
import { useSelector, useDispatch } from 'react-redux'

import Container from 'react-bootstrap/Container'

import { clearContainer, initContainer, setWorkspaceKeyReady} from '../reduxStore/containerSlice';
import { abort, clearPage, decryptPageItemThunk, getPageItemThunk, getPageCommentsThunk } from "../reduxStore/pageSlice";

import { debugLog } from "../lib/helper";


const PageItemWrapper = ({children}) => {
    const debugOn = true;

    const dispatch = useDispatch();
    const router = useRouter();

    const [pageItemId, setPageItemId] = useState(null); 
    const [pageCleared, setPageCleared] = useState(false); 

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

    return (
        <Container>
            {children}
        </Container>
    )
}

export default PageItemWrapper;