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

import { deselectItem, selectItem, clearSelected, dropItemsThunk, listItemsThunk} from '../reduxStore/containerSlice';

export default function ItemRow({ itemIndex, item , mode='listAll',  onAdd, onSelect}) {
    const debugOn = true;
    const router = useRouter();
    const dispatch = useDispatch();

    const [show, setShow] = useState(false);
    const [addAction, setAddAction] = useState(null);

    const workspaceId = useSelector(state => state.container.workspace);
    const containerItems = useSelector(state => state.container.items);
    const selectedItems = useSelector(state => state.container.selectedItems);

    const currentItemPath = useSelector(state => state.page.itemPath);

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
        if (e.target.checked) {
            const itemCopy = JSON.parse(JSON.stringify(item));
            dispatch(selectItem(itemCopy));
        } else {
            dispatch(deselectItem(item.id))
        }
    }
    
    const handleClearSelected = () => {
        dispatch(clearSelected());
    }

    const handleDrop = async (action) => {
        const itemsCopy = selectedItems;

        const payload = {
            space: workspaceId,
            targetContainer: item.container,
            items: itemsCopy,
            targetItem: item.id,
            targetItemIndex: itemIndex,
            targetPosition: item.position,
        }

        switch(action) {
            case 'dropItemsBefore':
                break;
            case 'dropItemsAfter':
                break;
            default:
        }
        try {
            dispatch(dropItemsThunk({action, payload}));
        } catch (error) {
            debugLog(debugOn, "Moving items failed.")
        }
    }
    
    return (
        <>
            {item.id.startsWith('np') && 
                <div>
                    <Row>
                        <Col xs={{span:2, offset:1}} sm={{span:2, offset:1}} md={{span:1, offset:1}} onClick={rowClicked} style={{ cursor: 'pointer' }}>
                            <span className='fs-5' dangerouslySetInnerHTML={{__html: item.itemPack.pageNumber}} />
                        </Col> 
                        <Col xs={7} sm={7} md={8} onClick={rowClicked} style={{ cursor: 'pointer' }}>
                            <span className='fs-5' dangerouslySetInnerHTML={{__html: itemText}} />
                        </Col>
                        <Col xs={1} >
                            <a className={BSafesStyle.externalLink} target="_blank" href={getItemLink(item)} rel="noopener noreferrer">
                                <i className="me-2 fa fa-external-link fa-lg text-dark" aria-hidden="true"></i>
                            </a>
                        </Col>
                    </Row>
                    <Row>
                        <Col xs={{span:10, offset:1}}>
                            <hr className="mt-1 mb-1"/>
                        </Col>
                    </Row>
                    
                </div>
            }
            {item.id.startsWith('dp') &&                
                <div>                  
                    <Row className={BSafesStyle.contentsItemRow}>
                        <Col className={`${(day === 0 || day === 6)?BSafesStyle.diaryWeekendItem:''} ${isSameDay(new Date(), date)?BSafesStyle.diaryTodayItem:''}`} xs={{span:3, offset:1}} sm={{span:2, offset:1}} xl={{span:1, offset:1}} onClick={rowClicked} style={{ cursor: 'pointer' }}>
                            { mode==='listAll'?
                                <span className='fs-5' dangerouslySetInnerHTML={{__html: format(date, 'dd EEEEE')}} />
                                :
                                <span className='fs-5' dangerouslySetInnerHTML={{__html: format(date, 'yyyy-LL-dd')}} />
                            }   
                            </Col> 
                        <Col xs={6} sm={7} xl={8} onClick={rowClicked} style={{ cursor: 'pointer' }}>
                            <span className='fs-5' dangerouslySetInnerHTML={{__html: itemText}} />
                        </Col>      
                        <Col xs={1} >
                            <a className={BSafesStyle.externalLink} target="_blank" href={getItemLink(item)} rel="noopener noreferrer">
                                <i className="me-2 fa fa-external-link fa-lg text-dark" aria-hidden="true"></i>
                            </a>
                        </Col>
                    </Row>

                    <Row>
                        <Col xs={{span:10, offset:1}}>
                            <hr className="mt-1 mb-1"/>
                        </Col>
                    </Row> 
                </div>
            }
            {item.id.startsWith('p') &&                
                <div>                  
                    <Row className={BSafesStyle.contentsItemRow}>
                        <Col xs={{ span: 7, offset: 1 }} onClick={rowClicked} style={{ cursor: 'pointer' }}>
                            <i className={`fa fa-file-text-o fa-lg ${BSafesStyle.safeItemTypeIcon}`} aria-hidden="true"></i><span className='fs-5' dangerouslySetInnerHTML={{__html: itemText}} />
                        </Col> 
                        <Col xs={3} className="p-1">
                            <ButtonGroup className="pull-right">
                                <a className={BSafesStyle.externalLink} target="_blank" href={getItemLink(item)} rel="noopener noreferrer">
                                    <i className="me-2 fa fa-external-link fa-lg text-dark" aria-hidden="true"></i>
                                </a>
                                <Form.Group className="me-2" >
                                    <Form.Check type="checkbox" checked={!!selectedItems.find(e=>e.id===item.id)}  onChange={handleCheck}/>
                                </Form.Group>
                                { !(selectedItems.length) &&
                                <Dropdown align="end" className="justify-content-end">
                                    <Dropdown.Toggle as={plusToggle}  variant="link">
                                    
                                    </Dropdown.Toggle>

                                    <Dropdown.Menu>
                                        <Dropdown.Item onClick={()=> handleAddClicked("addAnItemBefore")}>Add before</Dropdown.Item>
                                        <Dropdown.Item onClick={()=> handleAddClicked("addAnItemAfter")}>Add after</Dropdown.Item>                           
                                    </Dropdown.Menu>
                                </Dropdown>
                                }
                                { !!(selectedItems.length) && 
                                    <Dropdown align="end" className="justify-content-end">
                                        <Dropdown.Toggle as={sortToggle}  variant="link">
                                    
                                        </Dropdown.Toggle>

                                        <Dropdown.Menu>
                                            <Dropdown.Item onClick={()=>handleDrop('dropItemsBefore')}>Drop before</Dropdown.Item>
                                            <Dropdown.Item onClick={()=>handleDrop('dropItemsAfter')}>Drop after</Dropdown.Item>                          
                                        </Dropdown.Menu>
                                    </Dropdown>
                                }
                            </ButtonGroup>
                        </Col>             
                    </Row>

                    <Row>
                        <Col xs={{span:10, offset:1}}>
                            <hr className="mt-1 mb-1"/>
                        </Col>
                    </Row> 
                    <ItemTypeModal show={show} handleClose={handleClose} optionSelected={optionSelected} />
                </div>           
            }

        </>
    )
}