import { useState, forwardRef } from 'react'
import { useRouter } from 'next/router';
import Link from 'next/link'

import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Card from 'react-bootstrap/Card'
import ButtonGroup from 'react-bootstrap/ButtonGroup'
import Dropdown from 'react-bootstrap/Dropdown'
import Form from 'react-bootstrap/Form'

import ItemTypeModal from './itemTypeModal'

import { getItemLink } from '../lib/bSafesCommonUI';

import BSafesStyle from '../styles/BSafes.module.css'
import { useDispatch, useSelector } from 'react-redux';
import { deselectItem, selectItem } from '../reduxStore/containerSlice';

export default function ItemCard({item, onAdd, onSelect}) {
    const router = useRouter();
    const cardStyle = router.asPath.includes('\/box\/contents\/')?BSafesStyle.boxItemCard:BSafesStyle.safeItem
    const cardBodyStyle = router.asPath.includes('\/box\/contents\/')?BSafesStyle.boxItemCardBody:''
    const cardRowStyle = router.asPath.includes('\/box\/contents\/')?'mx-3':''
    const selectedItems = useSelector(state => state.container.selectedItems) || [];
    const dispatch = useDispatch();
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

    const handleCheck = (e) => {
        if (e.target.checked)
            dispatch(selectItem(item.id))
        else
            dispatch(deselectItem(item.id))
    }
    return (
        <Card className={cardStyle}>
            <Card.Body className={cardBodyStyle}>
                <Row className={cardRowStyle}>
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
                        {item.itemPack.type === 'B' &&
                            <div onClick={cardClicked}>
                                <span><i className="fa fa-archive fa-lg me-3" aria-hidden="true"></i>
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
                        {item.itemPack.type === 'B' &&
                            <div onClick={cardClicked}>
                                <span><i className="fa fa-archive fa-lg me-3" aria-hidden="true"></i>
                                </span>
                                <span className="h5" dangerouslySetInnerHTML={{ __html: itemText }} />
                            </div>
                        }
                    </Col>
                    <Col xs={3}>
                        <ButtonGroup className="pull-right">
                            <a className={BSafesStyle.externalLink} target="_blank" href={getItemLink(item)} rel="noopener noreferrer">
                                <i className="me-2 fa fa-external-link fa-lg text-dark" aria-hidden="true"></i>
                            </a>
                            <Form.Group className="me-2" controlId="formBasicCheckbox">
                                <Form.Check type="checkbox" checked={!!selectedItems.find(e=>e===item.id)}  onChange={handleCheck} />
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
                {   router.asPath.includes('\/box\/contents\/') &&
                    <hr className="mt-1 mb-1 mx-3"/>
                }
            </Card.Body>
            <ItemTypeModal show={show} handleClose={handleClose} optionSelected={optionSelected} />
        </Card>
    )
}