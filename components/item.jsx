import React from 'react'
import { useRouter } from 'next/router';

import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Card from 'react-bootstrap/Card'
import ButtonGroup from 'react-bootstrap/ButtonGroup'
import Dropdown from 'react-bootstrap/Dropdown'
import Form from 'react-bootstrap/Form'

import { getItemLink } from '../lib/bSafesCommonUI';

import BSafesStyle from '../styles/BSafes.module.css'

export default function Item({item}) {
    const router = useRouter();

    let temp = document.createElement('span');
    temp.innerHTML = item.title;
    const itemText = temp.textContent || temp.innerText;

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
    const plusToggle = React.forwardRef(plusButton);

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
    const sortToggle = React.forwardRef(sortButton);

    const cardClicked = () => {
        const link = getItemLink(item);

        router.push(link);
    }

    return (
        <>
            <Card body className={`${BSafesStyle.safeItem}`} onClick={cardClicked}>
                <Row className="">
                    <Col xs={9}>
                        {item.itemPack.type === 'P'?
                            <div>
                                <span><i className="fa fa-file-text-o fa-lg me-3" aria-hidden="true"></i><span></span>
                                </span>
                                <span className="h5" dangerouslySetInnerHTML={{__html: itemText}} />
                            </div>
                            :""
                        }
                                
                    </Col>
                    <Col xs={3}>
                        <ButtonGroup className="pull-right">
                            <Form.Group className="me-2" controlId="formBasicCheckbox">
                                <Form.Check className="" type="checkbox"/>
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