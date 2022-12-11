import { useState } from 'react'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Button from 'react-bootstrap/Button'
import Card from 'react-bootstrap/Card'
import Collapse from 'react-bootstrap/Collapse';
import InputGroup from 'react-bootstrap/InputGroup';
import Form from 'react-bootstrap/Form';

import BSafesStyle from '../styles/BSafes.module.css'

export default function TopControlPanel({ showListIcon = false, showSearchIcon = false, handleSearch, closeFolder, handleIndexClick }) {
    const [showSearchBox, setShowSearchBox] = useState(false);

    const closeSearhBox = () => setShowSearchBox(false);
    const openSearchBox = () => setShowSearchBox(true);
    const [searchValue, setSearchValue] = useState('');    
    return (
        <>
            <Row>
                <Col xs={12} sm={{ span: 10, offset: 1 }} lg={{ span: 8, offset: 2 }}>
                    <Card className={`${BSafesStyle.containerControlPanel} mb-4`}>
                        <Card.Body className='py-2'>
                            <Row>
                                <Col xs={4}>
                                    <Button variant='link' size='sm' className='text-white' onClick={closeFolder}><i className="fa fa-folder fa-lg" aria-hidden="true"></i></Button>
                                    {showListIcon && <Button variant='link' size='sm' className='text-white' onClick={handleIndexClick}><i className="fa fa-list-ul fa-lg" aria-hidden="true"></i></Button>}
                                </Col>
                                <Col xs={4}>
                                </Col>
                                <Col xs={4}>
                                    {showSearchIcon && !showSearchBox && <Button variant='link' onClick={openSearchBox} size='sm' className='text-white pull-right'><i className="fa fa-search fa-lg" aria-hidden="true"></i></Button>}
                                    <div className='pull-right'>
                                    <Button variant='link' size='sm' className='text-white' onClick={closeFolder}><i className="fa fa-step-forward fa-lg" aria-hidden="true"></i></Button>
                                     
                                    </div>

                                </Col>
                            </Row>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
            {
                <Collapse in={showSearchBox}>
                    <Row>
                        <Col xs={{ span: 12, }} sm={{ span: 10, offset: 1 }} lg={{ span: 8, offset: 2 }} >
                            <Card >
                                <Card.Body className='py-0'>
                                    <Row>
                                        <Col xs={{ span: 12, }} sm={{ span: 10, offset: 1 }} lg={{ span: 8, offset: 2 }} >
                                            <Form.Group>
                                                <InputGroup>
                                                    <Form.Control onChange={e=>setSearchValue(e.target.value)} value={searchValue}/>
                                                    <Button variant="link" onClick={()=>handleSearch(searchValue)}><i className="fa fa-search" aria-hidden="true"></i></Button>
                                                    <Button variant="link" onClick={closeSearhBox}><i className="fa fa-times" aria-hidden="true"></i></Button>
                                                </InputGroup>
                                            </Form.Group>
                                        </Col>
                                    </Row>
                                </Card.Body>
                            </Card>
                        </Col>
                    </Row>
                </Collapse>
            }
        </>
    )
}