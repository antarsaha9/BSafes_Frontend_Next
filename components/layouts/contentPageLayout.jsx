import { useEffect, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import {useRouter} from "next/router";

import Navbar from 'react-bootstrap/Navbar'
import Container from 'react-bootstrap/Container'
import Dropdown from 'react-bootstrap/Dropdown'


import { Blocks } from  'react-loader-spinner';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import ItemPath from '../itemPath'
import ItemsToolbar from '../itemsToolbar'
import ItemsMovingProgress from '../itemsMovingProgress';

import BSafesStyle from '../../styles/BSafes.module.css'

import { debugLog } from '../../lib/helper';

import { preflightAsyncThunk, setPreflightReady, setLocalSessionState, createCheckSessionIntervalThunk, loggedOut, cleanMemoryThunk, setV2NextAuthStep } from '../../reduxStore/auth';
import { setNextAuthStep, lockAsyncThunk, signOutAsyncThunk, signedOut } from '../../reduxStore/v1AccountSlice';

const ContentPageLayout = ({children, showNavbarMenu=true, showPathRow=true}) => {
    const debugOn = false;
    debugLog(debugOn, "Rendering ContentPageLayout");
    const router = useRouter();
    const dispatch = useDispatch();

    const [nextRoute, setNextRoute] = useState(null);
    
    const accountState = useSelector( state => state.account.accountState);
    const accountActivity = useSelector( state => state.account.activity);
    const authActivity = useSelector( state => state.auth.activity);
    const v1AccountActivity = useSelector (state => state.v1Account.activity);
    const teamsActivity = useSelector (state => state.team.activity);
    const containerActivity = useSelector( state => state.container.activity);
    const pageActivity = useSelector( state => state.page.activity );
    
    const preflightReady = useSelector( state=>state.auth.preflightReady);
    const localSessionState = useSelector( state => state.auth.localSessionState);
    const v2NextAuthStep = useSelector( state => state.auth.v2NextAuthStep);

    const accountVersion = useSelector(state => state.auth.accountVersion);
    const isLoggedIn = useSelector(state => state.auth.isLoggedIn);
    const displayName = useSelector(state=> state.auth.displayName);
    const nextAuthStep = useSelector( state => state.v1Account.nextAuthStep);

    const workspaceName = useSelector(state => state.container.workspaceName);

    const payment = (e) => {
        router.push('/payment');
    }
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
            path === '/keySetup' ||
            path.startsWith('/n/') ||
            path.startsWith('/v1/' ||
            path.startsWith('/v3'))); 
    } 

    const localSessionStateChanged = () => {
        debugLog(debugOn, `localSessionStateChanged(): preflightReady:${preflightReady}, state: ${JSON.stringify(localSessionState)}, isLoggedIn:${isLoggedIn}`);

        if( preflightReady && localSessionState.sessionExists) {
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
                    dispatch(cleanMemoryThunk());
                    if(accountVersion === 'v1') {
                        changePage('/v1/keyEnter')
                    } 
                    return;
                } else { 
                    switch(localSessionState.authState) {
                        case 'MFARequired':
                            if(accountVersion === 'v1'){
                                changePage('/v1/extraMFA');
                            } else {
                                changePage('/services/mfa');
                            }
                            break;
                        case 'KeyRequired':
                            changePage('/v1/keyEnter');
                            break;
                        default:
                            dispatch(setPreflightReady(false));
                            dispatch(preflightAsyncThunk({action:'KeyRequired'}));
                    }
                    return;
                }
            }
        } else if(!localSessionState.sessionExists){
            if(localSessionState.unlocked) {
                debugLog(debugOn, "Error: It should never happen");
                if(isLoggedIn) {
                    return;
                } else {
                    return;
                }
            } else if(preflightReady){
                if(isLoggedIn) {
                    dispatch(loggedOut());
                    dispatch(cleanMemoryThunk());
                    if(accountVersion === 'v1') {
                        dispatch(signedOut());
                        changePage(`/`);
                    } else {
                        changePage('/logIn');
                    }
                } else {
                    const path = router.asPath;
                    if((path !== '/') && (!path.startsWith('/public/') && (path !== '/logIn') && (path !== '/keySetup') && (!path.startsWith('/n/')))) {
                        changePage('/');
                    } 
                }
            } else {
                const path = router.asPath;
                if((path !== '/') && (!path.startsWith('/public/') && (path !== '/logIn') && (path !== '/keySetup') && (!path.startsWith('/n/')))) {
                    changePage('/');
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
            const notify = () => {
                toast('🦄 Wow so easy! ' + accountState, {
                    position: "top-right",
                    autoClose: false,
                    hideProgressBar: true,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                    theme: "light",
                    toastId: 'customId'
                    });
              } 
            //notify();
            setTimeout(notify, 500);
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
        if(!v2NextAuthStep) return;
        
        debugLog(debugOn, "route v2NextAuthStep: ", v2NextAuthStep.step);
        let nextPage = null;
        switch(v2NextAuthStep.step){
            case 'Home':
                const path = router.asPath;
                if(path === '/') break;
                nextPage = '/';
                break;
            case 'MFARequired':
                nextPage = '/services/mfa';
                break;         
            default:
        }
        dispatch(setV2NextAuthStep(null));
        if(nextPage) {
            const path = router.asPath;
            if(path !== nextPage) changePage(nextPage);
        }
    }, [v2NextAuthStep]);

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
    
    
    useEffect(()=> {
        if(preflightReady && accountState) {
            
        }
    }, [preflightReady, accountState])
    
    


    return (
        <div>
            { ( (accountActivity !==0 ) || (authActivity !==0 ) || (v1AccountActivity !== 0 ) || (teamsActivity !==0) || (containerActivity !== 0) || (pageActivity !== 0 )) &&
                <div className={BSafesStyle.screenCenter}>
                    <Blocks
                        visible={true}
                        height="80"
                        width="80"
                        ariaLabel="blocks-loading"
                        wrapperStyle={{}}
                        wrapperClass="blocks-wrapper"
                    />
                </div> 
            }
            <Navbar bg="light" expand="lg" className={BSafesStyle.bsafesNavbar}>
                <Container fluid>
                    <Navbar.Brand><span className={BSafesStyle.navbarTeamName}>{workspaceName}</span></Navbar.Brand>
                    {showNavbarMenu && <Dropdown align="end" className="justify-content-end">
                        <Dropdown.Toggle variant="link" id="dropdown-basic" className={BSafesStyle.navbarMenu}>
                            <span className={BSafesStyle.memberBadge}>{displayName && displayName.charAt(0)}</span>
                        </Dropdown.Toggle>
                        { accountVersion !== 'v1' &&
                            <Dropdown.Menu>
                            
                                { isLoggedIn? 
                                    <>
                                    <Dropdown.Item onClick={payment}>Payment</Dropdown.Item>
                                    <Dropdown.Item onClick={logOut}>Log out</Dropdown.Item>
                                    </>
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
            <div>
        
        <ToastContainer
            position="top-right"
            autoClose={false}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            theme="light"
        />
      </div>
            {showPathRow && <ItemPath />}
            {children}
            <ItemsMovingProgress />
            <ItemsToolbar />
        </div>
    )

};

export default ContentPageLayout;