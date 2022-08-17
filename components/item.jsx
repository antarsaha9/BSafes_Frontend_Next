import React from 'react'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Card from 'react-bootstrap/Card'
import Button from 'react-bootstrap/Button'
import ButtonGroup from 'react-bootstrap/ButtonGroup'
import DropdownButton from 'react-bootstrap/DropdownButton'
import Dropdown from 'react-bootstrap/Dropdown'
import Form from 'react-bootstrap/Form'


import BSafesStyle from '../styles/BSafes.module.css'

export default function Item({}) {
    const plusToggle = React.forwardRef(({ children, onClick }, ref) => (
        <a
          href=""
          ref={ref}
          onClick={e => {
            e.preventDefault();
            onClick(e);
          }}
        >
          {/* Render custom icon here */}
          <i className="fa fa-plus" aria-hidden="true"></i>
          {children}
        </a>
    ));

    const sortToggle = React.forwardRef(({ children, onClick }, ref) => (
        <a
          href=""
          ref={ref}
          onClick={e => {
            e.preventDefault();
            onClick(e);
          }}
        >
          {/* Render custom icon here */}
          <i className="fa fa-sort" aria-hidden="true"></i>
          {children}
        </a>
    ));

    return (
        <>
            <Card body className={`${BSafesStyle.safeItem}`}>
                <Row className="">
                    <Col xs={9}>
                        <i className="fa fa-book fa-lg me-3" aria-hidden="true"></i><span></span>
                        <h2>This is some text within a card body.</h2>
                    </Col>
                    <Col xs={3}>
                        <ButtonGroup className="pull-right">
                            <Form.Group className="me-2" controlId="formBasicCheckbox">
                                <Form.Check type="checkbox"/>
                            </Form.Group>

                            <Dropdown align="end" className="justify-content-end">
                                <Dropdown.Toggle as={plusToggle}  variant="link">
                                    
                                </Dropdown.Toggle>

                                <Dropdown.Menu>
                                    <Dropdown.Item href="#/action-1">Action</Dropdown.Item>
                                    <Dropdown.Item href="#/action-2">Another action</Dropdown.Item>                           
                                </Dropdown.Menu>
                            </Dropdown>
                            <Dropdown align="end" className="justify-content-end">
                                <Dropdown.Toggle as={sortToggle}  variant="link">
                                    
                                </Dropdown.Toggle>

                                <Dropdown.Menu>
                                    <Dropdown.Item href="#/action-1">Action</Dropdown.Item>
                                    <Dropdown.Item href="#/action-2">Another action</Dropdown.Item>                           
                                </Dropdown.Menu>
                            </Dropdown>
                        </ButtonGroup>
                    </Col>
                </Row>
                
            </Card>
        </>
    )
}