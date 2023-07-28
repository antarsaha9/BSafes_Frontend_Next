import { useEffect, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import {useRouter} from "next/router";

import Navbar from 'react-bootstrap/Navbar'
import Container from 'react-bootstrap/Container'
import Dropdown from 'react-bootstrap/Dropdown'

import ItemPath from '../itemPath'
import ItemsToolbar from '../itemsToolbar'

import BSafesStyle from '../../styles/BSafes.module.css'

import { debugLog } from '../../lib/helper';

import { preflightAsyncThunk, setPreflightReady, setLocalSessionState, createCheckSessionIntervalThunk, loggedOut } from '../../reduxStore/auth';
import { setNextAuthStep, lockAsyncThunk, signOutAsyncThunk, signedOut } from '../../reduxStore/v1AccountSlice';

const ContentPageLayout = ({children, showNavbarMenu=true, showPathRow=true}) => {
    const debugOn = true;
    debugLog(debugOn, "Rendering ContentPageLayout");
    const router = useRouter();
    const dispatch = useDispatch();

    const [nextRoute, setNextRoute] = useState(null);
    
    const preflightReady = useSelector( state=>state.auth.preflightReady);
    const localSessionState = useSelector( state => state.auth.localSessionState);
    
    const accountVersion = useSelector(state => state.auth.accountVersion);
    const isLoggedIn = useSelector(state => state.auth.isLoggedIn);
    const displayName = useSelector(state=> state.auth.displayName);
    const nextAuthStep = useSelector( state => state.v1Account.nextAuthStep);

    const logIn = (e) => {
        debugLog(debugOn, "Log in");
        changePage('/logIn');
    }

    const logOut = (e) => {
        debugLog(debugOn, "Log out");
        changePage('/logOut');
    }

    const lock = (e) => {
        dispatch(lockAsyncThunk())
    }

    const signOut = (e) => {
        dispatch(signOutAsyncThunk())
    }

    const changeRoute = (route) => {
        dispatch(setNextAuthStep(null));
        const path = router.asPath;
        if(path === route) return;
        debugLog(debugOn, `router.push: , ${route}, state:${JSON.stringify(localSessionState)}`);
        router.push(route);
    }

    const changePage = (page) => {
        setNextRoute(page);
    }

    const checkIfPublicOrAuthPages = (path) => {
        return (path === '/' || 
            path === '/logIn' ||
            path.startsWith('/n/') ||
            path.startsWith('/v1/' ||
            path.startsWith('/v3'))); 
    } 

    const localSessionStateChanged = () => {
        debugLog(debugOn, `localSessionStateChanged(): preflightReady:${preflightReady}, state: ${JSON.stringify(localSessionState)}, isLoggedIn:${isLoggedIn}`);
        if(!preflightReady) return;
        if(localSessionState.sessionExists) {
            if(localSessionState.unlocked) {
                if(isLoggedIn) {
                    const path = router.asPath;
                    if(checkIfPublicOrAuthPages(path)) {
                        if(accountVersion === 'v1'){
                            changePage('/teams');
                        } else {
                            changePage('/safe');
                        }
                    }
                    return;
                } else {
                    if(accountVersion === 'v1'){
                        changePage('/teams');
                    } else {
                        changePage('/safe');
                    }
                    return;
                }
            } else {
                if(isLoggedIn) {
                    dispatch(loggedOut());
                    if(accountVersion === 'v1') {
                        changePage('/v1/keyEnter')
                    } 
                    return;
                } else { 
                    switch(localSessionState.authState) {
                        case 'MFARequired':
                            changePage('/v1/extraMFA');
                            break;
                        case 'KeyRequired':
                            changePage('/v1/keyEnter');
                            break;
                        default:
                    }
                    return;
                }
            }
        } else {
            if(localSessionState.unlocked) {
                debugLog(debugOn, "Error: It should never happen");
                if(isLoggedIn) {
                    return;
                } else {
                    return;
                }
            } else {
                if(isLoggedIn) {
                    dispatch(loggedOut());
                    if(accountVersion === 'v1') {
                        dispatch(signedOut());
                        changePage(`/`);
                    } else {
                        changePage('/logIn');
                    }
                } else {
                    const path = router.asPath;
                    if((path !== '/') && (!path.startsWith('/public/') && (path !== '/logIn') && (!path.startsWith('/n/')))) {
                        changePage('/');
                    } 
                }
            }
        }
    }

    useEffect(()=> {
        debugLog(debugOn, `${router.asPath} is loaded`)
    }, [router.asPath]);

    useEffect(() => {
        dispatch(setPreflightReady(false));
        debugLog(debugOn, "Calling preflight, isLoggedIn", isLoggedIn);    
        dispatch(preflightAsyncThunk());

        const handleRouteChange = (url, { shallow }) => {
            debugLog(debugOn, "Route is going to change ...")
            dispatch(setPreflightReady(false));
            dispatch(setLocalSessionState(null));
        }
      
        router.events.on('routeChangeStart', handleRouteChange)
      
          // If the component is unmounted, unsubscribe
          // from the event with the `off` method:

        return () => {
            router.events.off('routeChangeStart', handleRouteChange);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(()=> {
        if(preflightReady) {
            dispatch(createCheckSessionIntervalThunk());
        }
    }, [preflightReady]);

    useEffect(()=> {
        if(!nextRoute) return;
        const path = router.asPath;
        if(path === nextRoute) return;
        changeRoute(nextRoute);
    }, [nextRoute]);

    useEffect(()=> {
        if(!localSessionState) return;
        localSessionStateChanged();
    }, [localSessionState]);


    useEffect(()=> {
        if(!nextAuthStep) return;
        
        debugLog(debugOn, "route nextAuthStep: ", nextAuthStep.step);
        let nextPage = null;
        switch(nextAuthStep.step){
            case 'Home':
                const path = router.asPath;
                if(path === '/logIn' || path.startsWith('/n/')) break;
                nextPage = '/';
                break;
            case 'SignIn':
                nextPage = `/n/${nextAuthStep.nickname}`;
                break;
            case 'MFARequired':
                nextPage = '/v1/extraMFA';
                break;
            case 'KeyRequired':
                nextPage = '/v1/keyEnter';
                break;
            default:
                
        }
        dispatch(setNextAuthStep(null));
        if(nextPage) {
            const path = router.asPath;
            if(path !== nextPage) changePage(nextPage);
        }
    }, [nextAuthStep])
    
    return (
        <div>
            <Navbar bg="light" expand="lg" className={BSafesStyle.bsafesNavbar}>
                <Container fluid>
                    <Navbar.Brand href="/"><span className={BSafesStyle.navbarTeamName}>BSafes</span></Navbar.Brand>
                    {showNavbarMenu && <Dropdown align="end" className="justify-content-end">
                        <Dropdown.Toggle variant="link" id="dropdown-basic" className={BSafesStyle.navbarMenu}>
                            <span className={BSafesStyle.memberBadge}>{displayName && displayName.charAt(0)}</span>
                        </Dropdown.Toggle>
                        { accountVersion !== 'v1' &&
                            <Dropdown.Menu>
                            
                                { isLoggedIn? 
                                    <Dropdown.Item onClick={logOut}>Log out</Dropdown.Item>
                                    :
                                    <Dropdown.Item onClick={logIn}>Log In</Dropdown.Item>
                                }
                            
                            </Dropdown.Menu>
                        }
                        { accountVersion === 'v1' &&
                            <Dropdown.Menu>
                            
                                { isLoggedIn &&
                                    <Dropdown.Item onClick={lock}>Lock</Dropdown.Item> 
                                }
                                { (isLoggedIn || (router.asPath === '/v1/keyEnter')) &&
                                    <Dropdown.Item onClick={signOut}>Sign out</Dropdown.Item>
                                }
                            </Dropdown.Menu>
                        }
                        { accountVersion === '' &&
                            <Dropdown.Menu>
                                { (router.asPath === '/v1/keyEnter') &&
                                    <Dropdown.Item onClick={signOut}>Sign out</Dropdown.Item>
                                }
                            </Dropdown.Menu>
                        }
                    </Dropdown>}
                </Container>
                
            </Navbar>
            {showPathRow && <ItemPath />}
            {children}
            <ItemsToolbar />
        </div>
    )

};

export default ContentPageLayout;