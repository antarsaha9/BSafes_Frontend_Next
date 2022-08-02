import Navbar from 'react-bootstrap/Navbar'
import Container from 'react-bootstrap/Container'
import NavDropdown from 'react-bootstrap/NavDropdown';
import Dropdown from 'react-bootstrap/Dropdown'

import BSafesStyle from '../../styles/BSafes.module.css'

import { debugLog } from '../../lib/helper';


const ContentPageLayout = ({children}) => {
    const debugOn = true;

    const logOut = (e) => {
        debugLog(debugOn, "Log out");
    }

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
                            <Dropdown.Item onClick={logOut} href="#/action-3">Log out</Dropdown.Item>
                        </Dropdown.Menu>
                    </Dropdown>
                </Container>
                
            </Navbar>
       
            {children}
        </div>
    )

};

export default ContentPageLayout;