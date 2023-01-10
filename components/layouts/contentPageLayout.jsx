import { useEffect, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'

import Navbar from 'react-bootstrap/Navbar'
import Container from 'react-bootstrap/Container'
import Dropdown from 'react-bootstrap/Dropdown'

import ItemPath from '../itemPath'
import ItemsToolbar from '../itemsToolbar'

import BSafesStyle from '../../styles/BSafes.module.css'

import { debugLog } from '../../lib/helper';

import { preflightAsyncThunk } from '../../reduxStore/auth';

const ContentPageLayout = ({children}) => {
    const debugOn = false;
    debugLog(debugOn, "Rendering ContentPageLayout");
    const dispatch = useDispatch();

    const isLoggedIn = useSelector(state => state.auth.isLoggedIn);

    const logIn = (e) => {
        debugLog(debugOn, "Log out");
    }

    const logOut = (e) => {
        debugLog(debugOn, "Log out");
    }

    useEffect(() => {
        debugLog(debugOn, "Calling preflight, isLoggedIn", isLoggedIn);    
        dispatch(preflightAsyncThunk());
    }, []);
    
    return (
        <div>
            <Navbar bg="light" expand="lg" className={BSafesStyle.bsafesNavbar}>
                <Container fluid>
                    <Navbar.Brand href="/"><span className={BSafesStyle.navbarTeamName}>BSafes</span></Navbar.Brand>
                    <Dropdown align="end" className="justify-content-end">
                        <Dropdown.Toggle variant="link" id="dropdown-basic">
                            <span className={BSafesStyle.memberBadge}>S</span>
                        </Dropdown.Toggle>

                        <Dropdown.Menu>
                            <Dropdown.Item href="#/action-1">Action</Dropdown.Item>
                            <Dropdown.Item href="#/action-2">Another action</Dropdown.Item>
                            {isLoggedIn? 
                                <Dropdown.Item onClick={logOut} href="#/action-3">Log out</Dropdown.Item>
                                :
                                <Dropdown.Item onClick={logIn} href="#/action-3">Log In</Dropdown.Item>
                            }
                        </Dropdown.Menu>
                    </Dropdown>
                </Container>
                
            </Navbar>
            <ItemPath />
            {children}
            <ItemsToolbar />
        </div>
    )

};

export default ContentPageLayout;