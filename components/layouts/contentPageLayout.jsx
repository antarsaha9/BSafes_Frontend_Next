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

import { preflightAsyncThunk, checkLocalSession, loggedOut } from '../../reduxStore/auth';
import { setNextAuthStep, lockAsyncThunk, signOutAsyncThunk } from '../../reduxStore/v1AccountSlice';

const ContentPageLayout = ({children, showNavbarMenu=true, showPathRow=true}) => {
    const debugOn = true;
    debugLog(debugOn, "Rendering ContentPageLayout");
    const router = useRouter();
    const dispatch = useDispatch();

    const [localSessionState, setLocalSessionState] = useState(null);
    
    const accountVersion = useSelector(state => state.auth.accountVersion);
    const isLoggedIn = useSelector(state => state.auth.isLoggedIn);
    const nextAuthStep = useSelector( state => state.v1Account.nextAuthStep);

    const logIn = (e) => {
        debugLog(debugOn, "Log in");
        router.push('/logIn');
    }

    const logOut = (e) => {
        debugLog(debugOn, "Log out");
        router.push('/logOut');
    }

    const lock = (e) => {
        dispatch(lockAsyncThunk())
    }

    const signOut = (e) => {
        dispatch(signOutAsyncThunk())
    }

    useEffect(() => {
        debugLog(debugOn, "Calling preflight, isLoggedIn", isLoggedIn);    
        dispatch(preflightAsyncThunk());

        const checkSessionInterval = setInterval(()=>{
            debugLog(debugOn, "Check session state");
            const state = checkLocalSession();
            setLocalSessionState(state);
        }, 1000);
        return () => {
            clearInterval(checkSessionInterval);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(()=> {
        if(!isLoggedIn && localSessionState && localSessionState.unlocked) {
            router.push('/safe')
            return;
        }

        if(!isLoggedIn && localSessionState && localSessionState.sessionExists) {
            
            return;
        }

        if(isLoggedIn &&  localSessionState && localSessionState.unlocked) {
            const path = router.asPath;
            if(path === '/' || path === '/logIn' || path.startsWith('/n/')) {
                router.push('/safe');
            }
            return;
        }

        if(isLoggedIn &&  localSessionState && !localSessionState.unlocked) {
            dispatch(loggedOut());
            const path = router.asPath;
            if(path === '/' || path === '/logIn' || path.startsWith('/n/' || path.startsWith('/v1/'))) return;
            router.push('/');
            
            return;
        }

        if( localSessionState && !localSessionState.sessionExists) {
            const path = router.asPath;
            if(path === '/' || path === '/logIn' || path.startsWith('/n/')) return;
            router.push('/');
        }
    }, [localSessionState])

    useEffect(()=> {
        if(!nextAuthStep) return;
        switch(nextAuthStep.step){
            case 'Home':
                const path = router.asPath;
                if(path === '/logIn' || path.startsWith('/n/')) break;
                router.push('/');
                break;
            case 'SignIn':
                router.push(`/n/${nextAuthStep.nickname}`);
                break;
            case 'MFARequired':
                router.push('/v1/extraMFA')
                break;
            case 'KeyRequired':
                router.push('/v1/keyEnter');
                break;
            default:
                
        }
        setNextAuthStep(null);
    }, [nextAuthStep])
    
    return (
        <div>
            <Navbar bg="light" expand="lg" className={BSafesStyle.bsafesNavbar}>
                <Container fluid>
                    <Navbar.Brand href="/"><span className={BSafesStyle.navbarTeamName}>BSafes</span></Navbar.Brand>
                    {showNavbarMenu && <Dropdown align="end" className="justify-content-end">
                        <Dropdown.Toggle variant="link" id="dropdown-basic" className={BSafesStyle.navbarMenu}>
                            <span className={BSafesStyle.memberBadge}>S</span>
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
                                { (isLoggedIn || (nextAuthStep && nextAuthStep.step === 'KeyRequired')) &&
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