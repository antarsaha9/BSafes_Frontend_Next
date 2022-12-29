import { useRef, useEffect, useState, forwardRef } from "react";
import { useRouter } from "next/router";
import { useSelector } from 'react-redux'

import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import InputGroup from "react-bootstrap/InputGroup";
import Button from 'react-bootstrap/Button'
import ButtonGroup from "react-bootstrap/ButtonGroup";
import Card from 'react-bootstrap/Card'
import Form from 'react-bootstrap/Form'
import Dropdown from 'react-bootstrap/Dropdown'

import BSafesStyle from '../styles/BSafes.module.css'

import { debugLog } from "../lib/helper";


export default function TopControlPanel({pageNumber=null, onCoverClicked=null, onContentsClicked, onPageNumberChanged=null, onGotoFirstItem=null, onGotoLastItem=null, onAdd=null, onSubmitSearch=null, onCancelSearch=null}) {
    const debugOn = true;
    debugLog(debugOn, "Rendering TopControlPanel:", pageNumber)
    const pageNumberInputRef = useRef(null);
    const searchInputRef = useRef(null);
    const router = useRouter();
    
    const [showSearchBar, setShowSearchBar] = useState(false);
    const [searchValue, setSearchValue] = useState("");
    const pageItemId = useSelector( state => state.page.id);
    const position = useSelector( state => state.page.position);

    const container = useSelector( state => state.container.container);
    const mode = useSelector( state => state.container.mode);

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

    const onShowSearchBarClicked = (e) => {
        setShowSearchBar(true);
    }

    const onSearchValueChanged = (e) => {
        debugLog(debugOn, "search value:", e.target.value);
        setSearchValue(e.target.value);
    }

    const onSearchEntered = (e) => {
        e.preventDefault();
        onSubmitSearch(searchValue);
    }

    const onCancelSearchClicked = (e) => {
        e.preventDefault();
        setSearchValue('');
        setShowSearchBar(false);
        onCancelSearch();
    }

    useEffect(()=>{
        if(!pageNumberInputRef.current ) return;
        pageNumberInputRef.current.value = pageNumber;
    }, [pageNumber]);
    
    useEffect(()=>{
        if(showSearchBar) {
            searchInputRef.current.focus();
        }
    }, [showSearchBar])

    return (
    <>
        <Row>
            <Col xs={12} sm={{span:10, offset:1}} lg={{span:8, offset:2}}>
                <Card className={`${BSafesStyle.containerControlPanel}`}>
                    <Card.Body className=''>
                        <Row>
                            <Col xs={4}>
                                {!container && <Button variant='link' size='sm' className='text-white'><i className="fa fa-square fa-lg" aria-hidden="true"></i></Button> }
                                {container && (container.startsWith('u') || container.startsWith('t')) && <Button variant='link' size='sm' className='text-white' onClick={onCoverClicked}><i className="fa fa-square fa-lg" aria-hidden="true"></i></Button>}
                                {( pageNumber || (container && (container.startsWith('n') ))) && <Button variant='link' size='sm' className='text-white' onClick={onCoverClicked}><i className="fa fa-book fa-lg" aria-hidden="true"></i></Button>}
                                {( container && container.startsWith('f')) && <Button variant='link' size='sm' className='text-white' onClick={onCoverClicked}><i className="fa fa-folder-o fa-lg" aria-hidden="true"></i></Button>}
                                {( container && container.startsWith('b')) && <Button variant='link' size='sm' className='text-white' onClick={onCoverClicked}><i className="fa fa-archive fa-lg" aria-hidden="true"></i></Button>}
                                {( pageNumber || 
                                  (container && (
                                  (container.startsWith('n') && !router.asPath.includes('\/contents\/')) || 
                                  (container.startsWith('f') && !router.asPath.includes('\/contents\/')) ||
                                  (container.startsWith('b') && !router.asPath.includes('\/contents\/')) 
                                  ))) && <Button variant='link' size='sm' className='text-white' onClick={onContentsClicked}><i className="fa fa-list-ul fa-lg" aria-hidden="true"></i></Button>}
                            </Col>
                            <Col xs={8}>
                                { ( pageNumber || (container && container.startsWith('n'))) && 
                                    <Form.Group className='pull-right'>                
                                        <Form.Control ref={pageNumberInputRef} type="text" defaultValue={pageNumber?pageNumber:''} className={`${BSafesStyle.pageNavigationPart} ${BSafesStyle.pageNumberInput} pt-0 pb-0`} />                    
                                        <Button variant='link' size='sm' className='text-white' id="gotoPageBtn" onClick={pageNumberChanged}><i className="fa fa-arrow-right fa-lg" aria-hidden="true"></i></Button>
										<Button variant='link' size='sm' className='text-white' id="gotoFirstItemBtn" onClick={onGotoFirstItem}><i className="fa fa-step-backward fa-lg" aria-hidden="true"></i></Button>
										<Button variant='link' size='sm' className='text-white' id="gotoLastItemBtn" onClick={onGotoLastItem}><i className="fa fa-step-forward fa-lg" aria-hidden="true"></i></Button>
                                        { router.asPath.includes('\/contents\/') && !showSearchBar &&                            
                                            <Button variant='link' size='sm' className='text-white' onClick={onShowSearchBarClicked}><i className="fa fa-search fa-lg" aria-hidden="true"></i></Button>
                                        }
                                    </Form.Group>
                                }
                                { ( (container && (container.startsWith('f') || container.startsWith('b')))) && 
                                    <ButtonGroup className='pull-right'>  
                                        { container.startsWith('f') &&  
                                        <>       
										    <Button variant='link' size='sm' className='text-white' id="gotoFirstItemBtn" onClick={onGotoFirstItem}><i className="fa fa-step-backward fa-lg" aria-hidden="true"></i></Button>
										    <Button variant='link' size='sm' className='text-white' id="gotoLastItemBtn" onClick={onGotoLastItem}><i className="fa fa-step-forward fa-lg" aria-hidden="true"></i></Button>
                                        </>
                                        }
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
                                        { router.asPath.includes('\/contents\/') && !showSearchBar &&
                                        <>
                                            <Button variant='link' size='sm' className='text-white' onClick={onShowSearchBarClicked}><i className="fa fa-search fa-lg" aria-hidden="true"></i></Button>
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
        { showSearchBar &&
        <>
            <br/>
            <Row>
                <Col xs={12} sm={{span:10, offset:1}} lg={{span:8, offset:2}}>
                    <Card className={`${BSafesStyle.containerControlPanel}`}>
                        
                        <Form onSubmit={onSearchEntered} className={BSafesStyle.searchBar}>
                            <InputGroup>
                                <Form.Control ref={searchInputRef} type="text" className={`${BSafesStyle.searchBarInput} text-white display-1`}
                                    value={searchValue} 
                                    onChange={onSearchValueChanged}
                                />
                                <Button variant="link">
                                    <i id="1" className="fa fa-search fa-lg text-white" aria-hidden="true" onClick={onSearchEntered}></i>
                                </Button>
                                <Button variant="link">
                                    <i id="1" className="fa fa-times fa-lg text-white" aria-hidden="true" onClick={onCancelSearchClicked}></i>
                                </Button>
                            </InputGroup>
                        </Form>
                    </Card>
                </Col> 
            </Row>
        </>
        }
    </>                            
    )
}