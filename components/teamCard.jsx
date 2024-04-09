import { forwardRef } from 'react'
import Link from 'next/link'

import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Card from 'react-bootstrap/Card'
import ButtonGroup from 'react-bootstrap/ButtonGroup'
import Dropdown from 'react-bootstrap/Dropdown';

import BSafesStyle from '../styles/BSafes.module.css';

import { debugLog } from '../lib/helper'

export default function TeamCard({ index, team, onAdd }) {
    const debugOn = false;

    const cardStyle = '';
    const cardBodyStyle = '';
    const cardRowStyle = ''    

    const teamId = team.id;
    let temp = document.createElement('span');
    temp.innerHTML = team.title;
    const teamText = temp.textContent || temp.innerText;

    function plusButton({ children, onClick }, ref) {
        return (
            <a
                href=""
                ref={ref}
                onClick={e => {
                    e.preventDefault();
                    onClick(e);
                }}
            >
                {/* Render custom icon here */}
                <i className="fa fa-plus text-dark" aria-hidden="true"></i>
                {children}
            </a>
        )
    }
    const plusToggle = forwardRef(plusButton);

    function sortButton({ children, onClick }, ref) {
        return (
            <a
                href=""
                ref={ref}
                onClick={e => {
                    e.preventDefault();
                    onClick(e);
                }}
            >
                {/* Render custom icon here */}
                <i className="fa fa-sort text-dark" aria-hidden="true"></i>
                {children}
            </a>
        )
    }
    const sortToggle = forwardRef(sortButton);

    const handleAddClicked = (action) => {
        onAdd({action, index, targetTeam: teamId, targetPosition: team.position});
    }

    return (
        <>
        { true &&
        <Card className={cardStyle} style={{cursor: 'pointer', borderColor:'black', borderStyle:'double', borderWidth:'2px'}}>
            <Card.Body className={cardBodyStyle}>
                <Row className={cardRowStyle}>
                    <Link href={`/team/${team.id}`} legacyBehavior>
                        <Col xs={9}>
                            <div >
                                <h2 dangerouslySetInnerHTML={{ __html: teamText }} />
                            </div>
                        </Col>
                    </Link>
                    <Col xs={3}>
                        <ButtonGroup className="pull-right">
                            {/* <a className={BSafesStyle.externalLink} target="_blank" href={getItemLink(item)} rel="noopener noreferrer">
                                <i className="me-2 fa fa-external-link fa-lg text-dark" aria-hidden="true"></i>
                            </a> */}

                            {true &&
                                <Dropdown align="end" className="justify-content-end">
                                        <Dropdown.Toggle as={plusToggle} variant="link" />

                                        <Dropdown.Menu>
                                            <Dropdown.Item onClick={() => handleAddClicked("addATeamBefore")}>Add before</Dropdown.Item>
                                            <Dropdown.Item onClick={() => handleAddClicked("addATeamAfter")}>Add after</Dropdown.Item>
                                        </Dropdown.Menu>
                                </Dropdown>
                            }
                        </ButtonGroup>
                    </Col>
                </Row>
            </Card.Body>
        </Card>
        }
        </>
    )
}