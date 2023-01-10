import { useState, forwardRef } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import { useRouter } from 'next/router';

import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'

import ButtonGroup from 'react-bootstrap/ButtonGroup'
import Dropdown from 'react-bootstrap/Dropdown'
import Form from 'react-bootstrap/Form'

import parse from "date-fns/parse";
import format from "date-fns/format";
import isSameDay from "date-fns/isSameDay";

import ItemTypeModal from './itemTypeModal'

import BSafesStyle from '../styles/BSafes.module.css'

import { debugLog } from '../lib/helper';
import { getItemLink } from '../lib/bSafesCommonUI';

import { deselectItem, selectItem } from '../reduxStore/containerSlice';

export default function ItemRow({item , mode='listAll',  onAdd, onSelect}) {
    const debugOn = true;
    const router = useRouter();
    const dispatch = useDispatch();

    const [show, setShow] = useState(false);
    const [addAction, setAddAction] = useState(null);

    const selectedItems = useSelector(state => state.container.selectedItems);

    const handleClose = () => setShow(false);

    const itemId = item.id;

    let temp = document.createElement('span');
    temp.innerHTML = item.title;
    const itemText = temp.textContent || temp.innerText;

    const date = parse(item.itemPack.pageNumber, 'yyyyLLdd', new Date());
    const day = date.getDay();

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

    const rowClicked = () => {
        debugLog(debugOn, "rowClicked ...");
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
            {item.id.startsWith('dp') &&                
                <div>                  
                    <Row className={BSafesStyle.contentsItemRow} onClick={rowClicked}>
                        <Col className={`${(day === 0 || day === 6)?BSafesStyle.diaryWeekendItem:''} ${isSameDay(new Date(), date)?BSafesStyle.diaryTodayItem:''}`} xs={{span:3, offset:1}} sm={{span:2, offset:1}} xl={{span:1, offset:1}}>
                            { mode==='listAll'?
                                <span className='fs-5' dangerouslySetInnerHTML={{__html: format(date, 'dd EEEEE')}} />
                                :
                                <span className='fs-5' dangerouslySetInnerHTML={{__html: format(date, 'yyyy-LL-dd')}} />
                            }   
                            </Col> 
                        <Col xs={7} sm={8} xl={9}>
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
            {item.id.startsWith('p') &&                
                <div>                  
                    <Row className={BSafesStyle.contentsItemRow}>
                        <Col xs={{ span: 7, offset: 1 }} onClick={rowClicked}>
                            <i className={`fa fa-file-text-o fa-lg ${BSafesStyle.safeItemTypeIcon}`} aria-hidden="true"></i><span className='fs-5' dangerouslySetInnerHTML={{__html: itemText}} />
                        </Col> 
                        <Col xs={3} className="p-1">
                            <ButtonGroup className="pull-right">
                                <a className={BSafesStyle.externalLink} target="_blank" href={getItemLink(item)} rel="noopener noreferrer">
                                    <i className="me-2 fa fa-external-link fa-lg text-dark" aria-hidden="true"></i>
                                </a>
                                <Form.Group className="me-2" controlId="formBasicCheckbox">
                                    <Form.Check type="checkbox" checked={!!selectedItems.find(e=>e===item.id)}  onChange={handleCheck}/>
                                </Form.Group>

                                <Dropdown align="end" className="justify-content-end">
                                    <Dropdown.Toggle as={plusToggle}  variant="link">
                                    
                                    </Dropdown.Toggle>

                                    <Dropdown.Menu>
                                        <Dropdown.Item onClick={()=> handleAddClicked("addAnItemBefore")}>Add before</Dropdown.Item>
                                        <Dropdown.Item onClick={()=> handleAddClicked("addAnItemAfter")}>Add after</Dropdown.Item>                           
                                    </Dropdown.Menu>
                                </Dropdown>
                                { false && 
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

                    <Row>
                        <Col xs={{span:10, offset:1}}>
                            <hr className="mt-0 mb-0"/>
                        </Col>
                    </Row> 
                    <ItemTypeModal show={show} handleClose={handleClose} optionSelected={optionSelected} />
                </div>           
            }

        </>
    )
}