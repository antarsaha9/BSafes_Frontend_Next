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

import { preflightAsyncThunk } from '../../reduxStore/auth';

const ContentPageLayout = ({children, showNavbarMenu=true, showPathRow=true}) => {
    const debugOn = false;
    debugLog(debugOn, "Rendering ContentPageLayout");
    const router = useRouter();
    const dispatch = useDispatch();

    const isLoggedIn = useSelector(state => state.auth.isLoggedIn);

    const logIn = (e) => {
        debugLog(debugOn, "Log in");
        router.push('/logIn');
    }

    const logOut = (e) => {
        debugLog(debugOn, "Log out");
        router.push('/logOut');
    }

    useEffect(() => {
        debugLog(debugOn, "Calling preflight, isLoggedIn", isLoggedIn);    
        dispatch(preflightAsyncThunk());
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    
    return (
        <div>
            <Navbar bg="light" expand="lg" className={BSafesStyle.bsafesNavbar}>
                <Container fluid>
                    <Navbar.Brand href="/"><span className={BSafesStyle.navbarTeamName}>BSafes</span></Navbar.Brand>
                    {showNavbarMenu && <Dropdown align="end" className="justify-content-end">
                        <Dropdown.Toggle variant="link" id="dropdown-basic" className={BSafesStyle.navbarMenu}>
                            <span className={BSafesStyle.memberBadge}>S</span>
                        </Dropdown.Toggle>

                        <Dropdown.Menu>
                            {isLoggedIn? 
                                <Dropdown.Item onClick={logOut}>Log out</Dropdown.Item>
                                :
                                <Dropdown.Item onClick={logIn}>Log In</Dropdown.Item>
                            }
                        </Dropdown.Menu>
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