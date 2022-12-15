import React from 'react'
import { useRouter } from 'next/router';

import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'

import ButtonGroup from 'react-bootstrap/ButtonGroup'
import Dropdown from 'react-bootstrap/Dropdown'
import Form from 'react-bootstrap/Form'

import { getItemLink } from '../lib/bSafesCommonUI';

import BSafesStyle from '../styles/BSafes.module.css'
import { itemVersionsFetched } from '../reduxStore/pageSlice';
import Link from 'next/link';

export default function ItemRow({ item, addBefore, addAfter }) {

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

    const rowClicked = () => {
        const link = getItemLink(item);
        window.location = link;
    }

    return (
        <>
            {item.id.startsWith('np') && 
                <div>
                    <Row onClick={rowClicked}>
                        <Col xs={{span:2, offset:1}} sm={{span:2, offset:1}} md={{span:1, offset:1}}>
                            <span className='fs-5' dangerouslySetInnerHTML={{__html: item.itemPack.pageNumber}} />
                        </Col> 
                        <Col xs={8} sm={8} md={9}>
                            <span className='fs-5' dangerouslySetInnerHTML={{__html: itemText}} />
                        </Col>
                    </Row>
                    <Row>
                        <Col xs={{span:10, offset:1}}>
                            <hr className="mt-0 mb-0"/>
                        </Col>
                    </Row>
                    
                </div>

            }
            {(item.container.startsWith('f')) &&
                <div>
                    <Row className="mt-1" >
                        <Col xs={{ span: 7, offset: 1 }}>
                            <Link href={getItemLink(item)}>
                                <a className="text-decoration-none text-black">
                                    <div class="">
                                        <p class="containerContentsPageTitle my-0" >
                                            <i class="fa fa-file-text-o me-2" aria-hidden="true"></i>
                                            <span className='fs-5' dangerouslySetInnerHTML={{ __html: itemText }} />
                                        </p>
                                    </div>
                                </a>
                            </Link>
                        </Col>
                        <Col xs={3}>
                            <Dropdown className="pull-right px-2">
                                <Dropdown.Toggle variant="link" bsPrefix="p-0 text-decoration-none text-black" id="dropdown-basic">
                                    +
                                </Dropdown.Toggle>

                                <Dropdown.Menu>
                                    <Dropdown.Item href="#/action-1">Add before</Dropdown.Item>
                                    <Dropdown.Item href="#/action-2">Add After</Dropdown.Item>
                                </Dropdown.Menu>
                            </Dropdown>

                            <div class="checkbox pull-right my-0 ">
                                <input type="checkbox" class="form-check-input" />
                            </div>
                        </Col>
                        <Col xs={{ span: 10, offset: 1 }}>
                            <hr class="my-0" />
                        </Col>
                    </Row>
                </div>
            }
        </>
    )
}