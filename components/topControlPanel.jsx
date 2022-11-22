import { useEffect, useRef, useState } from "react";
import { useSelector, useDispatch } from 'react-redux'

import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Button from 'react-bootstrap/Button'
import Card from 'react-bootstrap/Card'
import Form from 'react-bootstrap/Form'

import BSafesStyle from '../styles/BSafes.module.css'

export default function TopControlPanel() {
    const container = useSelector( state => state.page.container);

    return (
        <Row>
            <Col xs={12} sm={{span:10, offset:1}} lg={{span:8, offset:2}}>
                <Card className={`${BSafesStyle.containerControlPanel}`}>
                    <Card.Body className=''>
                        <Row>
                            <Col xs={4}>
                                {!container && <Button variant='link' size='sm' className='text-white'><i className="fa fa-square fa-lg" aria-hidden="true"></i></Button> }
                                {container && (container.startsWith('u') || container.startsWith('t')) && <Button variant='link' size='sm' className='text-white'><i className="fa fa-square fa-lg" aria-hidden="true"></i></Button>}
                                {container && container.startsWith('n') && <Button variant='link' size='sm' className='text-white'><i className="fa fa-book fa-lg" aria-hidden="true"></i></Button>}
                                {container && container.startsWith('n') && <Button variant='link' size='sm' className='text-white'><i className="fa fa-list-ul fa-lg" aria-hidden="true"></i></Button>}
                            </Col>
                            <Col xs={8}>
                                { container && container.startsWith('n') && 
                                    <Form.Group className='pull-right'>                
                                        <Form.Control type="text" placeholder="" className={`${BSafesStyle.pageNavigationPart} ${BSafesStyle.pageNumberInput} pt-0 pb-0`} />                    
                                        <Button variant='link' size='sm' className='text-white' id="gotoPageBtn"><i className="fa fa-arrow-right fa-lg" aria-hidden="true"></i></Button>
										<Button variant='link' size='sm' className='text-white' id="gotoFirstItemBtn"><i className="fa fa-step-backward fa-lg" aria-hidden="true"></i></Button>
										<Button variant='link' size='sm' className='text-white' id="gotoLastItemBtn"><i className="fa fa-step-forward fa-lg" aria-hidden="true"></i></Button>
                                    </Form.Group>
                                }
                                
                                {container && !container.startsWith('n') && <Button variant='link' size='sm' className='text-white pull-right'><i className="fa fa-ellipsis-v fa-lg" aria-hidden="true"></i></Button>}
                            </Col>
                        </Row>
                    </Card.Body>
                </Card>
            </Col> 
        </Row>
    )
}