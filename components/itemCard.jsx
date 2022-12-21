import { useState, forwardRef } from 'react'
import { useRouter } from 'next/router';

import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Card from 'react-bootstrap/Card'
import ButtonGroup from 'react-bootstrap/ButtonGroup'
import Dropdown from 'react-bootstrap/Dropdown'
import Form from 'react-bootstrap/Form'

import ItemTypeModal from './itemTypeModal'

import { getItemLink } from '../lib/bSafesCommonUI';

import BSafesStyle from '../styles/BSafes.module.css'

export default function ItemCard({item, onAdd, onSelect}) {
    const router = useRouter();
    
    const [show, setShow] = useState(false);
    const [addAction, setAddAction] = useState(null);

    const handleClose = () => setShow(false);

    const itemId = item.id;
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

    const cardClicked = () => {
        const link = getItemLink(item);
        router.push(link);
    }

    const handleAddClicked = (action) => {
        setAddAction(action);
        setShow(true);
    }

    const optionSelected = (itemType) => {       
        setShow(false);
        onAdd(itemType, addAction, itemId, item.position );
    }

    return (
        <>
            <Card body className={`${BSafesStyle.safeItem}`} >
                <Row className="">
                    <Col xs={9}>   
                        {item.itemPack.type === 'D' &&
                            <div onClick={cardClicked}>
                                <span><i className="fa fa-calendar fa-lg me-3" aria-hidden="true"></i>
                                </span>
                                <span dangerouslySetInnerHTML={{ __html: item.title}} />
                            </div>
                        }
                        {item.itemPack.type === 'F' &&
                            <div onClick={cardClicked}>
                                <span><i className="fa fa-folder-o fa-lg me-3" aria-hidden="true"></i>
                                </span>
                                <span dangerouslySetInnerHTML={{ __html: item.title}} />
                            </div>
                        }
                        {item.itemPack.type === 'N' &&
                            <div onClick={cardClicked}>
                                <span><i className="fa fa-book fa-lg me-3" aria-hidden="true"></i>
                                </span>
                                <div dangerouslySetInnerHTML={{__html: item.title}} />
                            </div>
                        }
                         {item.itemPack.type === 'P' &&
                            <div onClick={cardClicked}>
                                <span><i className="fa fa-file-text-o fa-lg me-3" aria-hidden="true"></i>
                                </span>
                                <span className="h5" dangerouslySetInnerHTML={{__html: itemText}} />
                            </div>
                        }       
                    </Col>
                    <Col xs={3}>
                        <ButtonGroup className="pull-right">
                            <Form.Group className="me-2" controlId="formBasicCheckbox">
                                <Form.Check className="" type="checkbox"/>
                            </Form.Group>

                            {true &&
                                <Dropdown align="end" className="justify-content-end">
                                    <Dropdown.Toggle as={plusToggle}  variant="link">
                                    
                                    </Dropdown.Toggle>

                                    <Dropdown.Menu>
                                        <Dropdown.Item onClick={()=> handleAddClicked("addAnItemBefore")}>Add before</Dropdown.Item>
                                        <Dropdown.Item onClick={()=> handleAddClicked("addAnItemAfter")}>Add after</Dropdown.Item>                           
                                    </Dropdown.Menu>
                                </Dropdown>
                            }
                            {false &&
                                <Dropdown align="end" className="justify-content-end">
                                    <Dropdown.Toggle as={sortToggle}  variant="link">
                                    
                                    </Dropdown.Toggle>

                                    <Dropdown.Menu>
                                        <Dropdown.Item href="#/action-1">Drop before</Dropdown.Item>
                                        <Dropdown.Item href="#/action-2">Drop inside</Dropdown.Item>
                                        <Dropdown.Item href="#/action-3">Drop after</Dropdown.Item>          
                                    </Dropdown.Menu>
                                </Dropdown>
                            }
                        </ButtonGroup>
                    </Col>
                </Row>
                
            </Card>
            <ItemTypeModal show={show} handleClose={handleClose} optionSelected={optionSelected} />
        </>
    )
}