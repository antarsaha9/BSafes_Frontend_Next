import { forwardRef, useState } from 'react'

import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Button from 'react-bootstrap/Button'
import Card from 'react-bootstrap/Card'
import Collapse from 'react-bootstrap/Collapse';
import InputGroup from 'react-bootstrap/InputGroup';
import Form from 'react-bootstrap/Form';

import ReactDatePicker from 'react-datepicker'

import BSafesStyle from '../styles/BSafes.module.css'

export default function DiaryTopControlPanel({ datePickerViewMode = "dayMonth", startDate, setStartDate, showListIcon = false, showSearchIcon = false, handleSearch, onCoverClicked, onContentsClicked }) {
    const [showSearchBox, setShowSearchBox] = useState(false);

    const ExampleCustomInput = forwardRef(({ value, onClick }, ref) => (
        <Button variant='link' size='sm' className='text-white pull-right' onClick={onClick} ref={ref}><i className="fa fa-calendar fa-lg" aria-hidden="true"></i></Button>
    ));

    const extraProps = datePickerViewMode === 'monthYear' ? {
        showMonthYearPicker: true,
        showFullMonthYearPicker: true
    } : {}

    const closeSearhBox = () => setShowSearchBox(false);
    const openSearchBox = () => setShowSearchBox(true);

    return (
        <>
            <Row>
                <Col xs={12} sm={{ span: 10, offset: 1 }} lg={{ span: 8, offset: 2 }}>
                    <Card className={`${BSafesStyle.containerControlPanel}`}>
                        <Card.Body className={BSafesStyle.diaryControlPanelBody}>
                            <Row>
                                <Col xs={4}>
                                    <Button variant='link' size='sm' className='text-white' onClick={onCoverClicked}><i className="fa fa-book fa-lg" aria-hidden="true"></i></Button>
                                    {showListIcon && <Button variant='link' size='sm' className='text-white' onClick={onContentsClicked}><i className="fa fa-list-ul fa-lg" aria-hidden="true"></i></Button>}
                                </Col>
                                <Col xs={4}>
                                </Col>
                                <Col xs={4}>
                                    {showSearchIcon && !showSearchBox && <Button variant='link' onClick={openSearchBox} size='sm' className='text-white pull-right'><i className="fa fa-search fa-lg" aria-hidden="true"></i></Button>}
                                    <div className='pull-right'>
                                        <ReactDatePicker
                                            selected={startDate}                                         
                                            onChange={(date) => setStartDate(date)}
                                            customInput={<ExampleCustomInput />}
                                            showPopperArrow={false}
                                            {...extraProps}
                                        />
                                    </div>
                                </Col>
                            </Row>
                        </Card.Body>   
                    </Card>
                </Col>
            </Row>
        </>
    )
}