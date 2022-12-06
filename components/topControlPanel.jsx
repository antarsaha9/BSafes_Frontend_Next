import { useRef, useEffect } from "react";
import { useSelector } from 'react-redux'

import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Button from 'react-bootstrap/Button'
import Card from 'react-bootstrap/Card'
import Form from 'react-bootstrap/Form'

import BSafesStyle from '../styles/BSafes.module.css'

import { debugLog } from "../lib/helper";


export default function TopControlPanel({pageNumber=null, onCoverClicked=null, onContentsClicked, onPageNumberChanged=null, onGotoFirstItem=null, onGotoLastItem=null}) {
    const debugOn = true;
    debugLog(debugOn, "Rendering TopControlPanel:", pageNumber)
    const pageNumberInputRef = useRef(null);
    
    const container = useSelector( state => state.container.container);

    const pageNumberChanged = (e) => {
        if(onPageNumberChanged) {

            onPageNumberChanged(pageNumberInputRef.current.value);
        }
    }

    const onChange = () => {

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
                                {( pageNumber || (container && container.startsWith('n'))) && <Button variant='link' size='sm' className='text-white' onClick={onCoverClicked}><i className="fa fa-book fa-lg" aria-hidden="true"></i></Button>}
                                {( pageNumber || (container && container.startsWith('n'))) && <Button variant='link' size='sm' className='text-white' onClick={onContentsClicked}><i className="fa fa-list-ul fa-lg" aria-hidden="true"></i></Button>}
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
                                
                                {container && !container.startsWith('n') && <Button variant='link' size='sm' className='text-white pull-right'><i className="fa fa-ellipsis-v fa-lg" aria-hidden="true"></i></Button>}
                            </Col>
                        </Row>
                    </Card.Body>
                </Card>
            </Col> 
        </Row>
    )
}