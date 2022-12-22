import { useRef, useEffect, forwardRef } from "react";
import { useSelector } from 'react-redux'

import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Button from 'react-bootstrap/Button'
import { ButtonGroup } from "react-bootstrap";
import Card from 'react-bootstrap/Card'
import Form from 'react-bootstrap/Form'
import Dropdown from 'react-bootstrap/Dropdown'

import BSafesStyle from '../styles/BSafes.module.css'

import { debugLog } from "../lib/helper";


export default function TopControlPanel({pageNumber=null, onCoverClicked=null, onContentsClicked, onPageNumberChanged=null, onGotoFirstItem=null, onGotoLastItem=null, onAdd=null}) {
    const debugOn = true;
    debugLog(debugOn, "Rendering TopControlPanel:", pageNumber)
    const pageNumberInputRef = useRef(null);
    
    const pageItemId = useSelector( state => state.page.id);
    const position = useSelector( state => state.page.position);

    const container = useSelector( state => state.container.container);

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
                <i className="fa fa-plus fa-lg text-white" aria-hidden="true"></i>
                {children}
            </a>
        )
    }
    const plusToggle = forwardRef(plusButton);

    const pageNumberChanged = (e) => {
        if(onPageNumberChanged) {

            onPageNumberChanged(pageNumberInputRef.current.value);
        }
    }

    const handleAddClicked = (action) => {       
        onAdd('Page', action, pageItemId, position);
    }

    useEffect(()=>{
        if(!pageNumberInputRef.current ) return;
        pageNumberInputRef.current.value = pageNumber;
    }, [pageNumber]);
    
    return (
        <Row>
            <Col xs={12} sm={{span:10, offset:1}} lg={{span:8, offset:2}}>
                <Card className={`${BSafesStyle.containerControlPanel}`}>
                    <Card.Body className=''>
                        <Row>
                            <Col xs={4}>
                                {!pageNumber && !container && <Button variant='link' size='sm' className='text-white'><i className="fa fa-square fa-lg" aria-hidden="true"></i></Button> }
                                {container && (container.startsWith('u') || container.startsWith('t')) && <Button variant='link' size='sm' className='text-white'><i className="fa fa-square fa-lg" aria-hidden="true"></i></Button>}
                                {( pageNumber || (container && (container.startsWith('n') || container.startsWith('f')))) && <Button variant='link' size='sm' className='text-white' onClick={onCoverClicked}><i className="fa fa-book fa-lg" aria-hidden="true"></i></Button>}
                                {( pageNumber || (container && (container.startsWith('n') || (container.startsWith('f') && pageItemId && pageItemId.startsWith('p'))))) && <Button variant='link' size='sm' className='text-white' onClick={onContentsClicked}><i className="fa fa-list-ul fa-lg" aria-hidden="true"></i></Button>}
                            </Col>
                            <Col xs={8}>
                                { ( pageNumber || (container && container.startsWith('n'))) && 
                                    <Form.Group className='pull-right'>                
                                        <Form.Control ref={pageNumberInputRef} type="text" defaultValue={pageNumber?pageNumber:''} className={`${BSafesStyle.pageNavigationPart} ${BSafesStyle.pageNumberInput} pt-0 pb-0`} />                    
                                        <Button variant='link' size='sm' className='text-white' id="gotoPageBtn" onClick={pageNumberChanged}><i className="fa fa-arrow-right fa-lg" aria-hidden="true"></i></Button>
										<Button variant='link' size='sm' className='text-white' id="gotoFirstItemBtn" onClick={onGotoFirstItem}><i className="fa fa-step-backward fa-lg" aria-hidden="true"></i></Button>
										<Button variant='link' size='sm' className='text-white' id="gotoLastItemBtn" onClick={onGotoLastItem}><i className="fa fa-step-forward fa-lg" aria-hidden="true"></i></Button>
                                    </Form.Group>
                                }
                                { ( pageNumber || (container && container.startsWith('f'))) && 
                                    <ButtonGroup className='pull-right'>                
										<Button variant='link' size='sm' className='text-white' id="gotoFirstItemBtn" onClick={onGotoFirstItem}><i className="fa fa-step-backward fa-lg" aria-hidden="true"></i></Button>
										<Button variant='link' size='sm' className='text-white' id="gotoLastItemBtn" onClick={onGotoLastItem}><i className="fa fa-step-forward fa-lg" aria-hidden="true"></i></Button>
                                        { pageItemId && pageItemId.startsWith('p') &&
                                        <>
                                            <Dropdown align="end" className={`justify-content-end ${BSafesStyle.mt3px}`}>
                                                <Dropdown.Toggle as={plusToggle}  variant="link">
                                    
                                                </Dropdown.Toggle>

                                                <Dropdown.Menu>
                                                    <Dropdown.Item onClick={()=> handleAddClicked("addAnItemBefore")}>Add before</Dropdown.Item>
                                                    <Dropdown.Item onClick={()=> handleAddClicked("addAnItemAfter")}>Add after</Dropdown.Item>                           
                                                </Dropdown.Menu>
                                            </Dropdown>
                                            <Button variant='link' size='sm' className='text-white'><i className="fa fa-ellipsis-v fa-lg" aria-hidden="true"></i></Button>
                                        </>
                                        }
                                    </ButtonGroup>
                                }
                                {container && (container.startsWith('t') || container.startsWith('u')) && <Button variant='link' size='sm' className='text-white pull-right'><i className="fa fa-ellipsis-v fa-lg" aria-hidden="true"></i></Button>}
                            </Col>
                        </Row>
                    </Card.Body>
                </Card>
            </Col> 
        </Row>
    )
}