import React from 'react'
import { useRouter } from 'next/router';
import Link from 'next/link'

import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'

import ButtonGroup from 'react-bootstrap/ButtonGroup'
import Dropdown from 'react-bootstrap/Dropdown'
import Form from 'react-bootstrap/Form'

import parse from "date-fns/parse";
import format from "date-fns/format";
import isSameDay from "date-fns/isSameDay";

import { getItemLink } from '../lib/bSafesCommonUI';

import BSafesStyle from '../styles/BSafes.module.css'
import { itemVersionsFetched } from '../reduxStore/pageSlice';
import { debugLog } from '../lib/helper';

export default function ItemRow({item}) {
    const debugOn = true;
    const router = useRouter();

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
        debugLog(debugOn, "rowClicked ...");
        const link = getItemLink(item);
        router.push(link);
        
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
                        <Col className={`${(day === 0 || day === 6)?BSafesStyle.diaryWeekendItem:''} ${isSameDay(new Date(), date)?BSafesStyle.diaryTodayItem:''}`} xs={{span:3, offset:1}} sm={{span:2, offset:1}} md={{span:1, offset:1}}>
                            <span className='fs-5' dangerouslySetInnerHTML={{__html: format(date, 'dd EEEEE')}} />
                        </Col> 
                        <Col xs={7} sm={8} md={9}>
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
        </>
    )
}