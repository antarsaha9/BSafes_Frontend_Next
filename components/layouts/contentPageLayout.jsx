import { useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import {useRouter} from "next/router";

import Navbar from 'react-bootstrap/Navbar'
import Container from 'react-bootstrap/Container'
import Dropdown from 'react-bootstrap/Dropdown'

import ItemPath from '../itemPath'
import ItemsToolbar from '../itemsToolbar'

import BSafesStyle from '../../styles/BSafes.module.css'

import { debugLog } from '../../lib/helper';

import { preflightAsyncThunk } from '../../reduxStore/auth';
import { lockAsyncThunk } from '../../reduxStore/v1AccountSlice';

const ContentPageLayout = ({children, showNavbarMenu=true, showPathRow=true}) => {
    const debugOn = false;
    debugLog(debugOn, "Rendering ContentPageLayout");
    const router = useRouter();
    const dispatch = useDispatch();

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

    useEffect(() => {
        debugLog(debugOn, "Calling preflight, isLoggedIn", isLoggedIn);    
        dispatch(preflightAsyncThunk());
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(()=> {
        if(!nextAuthStep) return;
        switch(nextAuthStep.step){
            case 'MFARequired':
                router.push('/v1/extraMFA')
                break;
            case 'KeyRequired':
                router.push('/v1/keyEnter');
                break;
            default:
        }
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
                                { (isLoggedIn || nextAuthStep.step === 'KeyRequired')?
                                    <Dropdown.Item onClick={logOut}>Sign out</Dropdown.Item>
                                    :
                                    <Dropdown.Item onClick={logIn}>Sign In</Dropdown.Item> 
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