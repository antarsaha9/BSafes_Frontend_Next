import { useEffect, useState, forwardRef } from 'react';
import { useSelector, useDispatch } from 'react-redux'
import { useRouter } from 'next/router';

import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';
import Form from 'react-bootstrap/Form';
import InputGroup from 'react-bootstrap/InputGroup';

import ContentPageLayout from '../../components/layouts/contentPageLayout'

import BSafesStyle from '../../styles/BSafes.module.css'

import { clearMemberSearchResult, findMemberByIdThunk, addMemberToTeamThunk} from '../../reduxStore/teamSlice';
import { debugLog } from '../../lib/helper';

export default function TeamMembers(props) {
    const debugOn = true;

    const dispatch = useDispatch();
    const router = useRouter();

    const [addingMember, setAddingMember] = useState(false);
    const [searchValue, setSearchValue] = useState("");

    const memberSearchResult = useSelector(state=>state.team.memberSearchResult);
    
    const searchResult =()=> {
        if(memberSearchResult) {
           if(memberSearchResult.id) {
                return (<MemberCard member={memberSearchResult} handleAdd={addMemberToTeam}></MemberCard>)
           } else {
                return (<h1>Not Found!</h1>);
           }
        }
    }

    const addMemberToTeam = () => {
        dispatch(addMemberToTeamThunk({member:memberSearchResult}));
    }
     
    const handleAddMembers = () => {
        dispatch(clearMemberSearchResult());
        setSearchValue('');
        setAddingMember(true);
    }

    const onSubmit = () => {
        dispatch(findMemberByIdThunk({id:searchValue}));
    }
    const onSearchValueChanged = (e) => {
        setSearchValue(e.target.value);
    }

    return (
        <div className={BSafesStyle.spaceBackground}>
            <ContentPageLayout key={router.pathname}>
                <Container fluid>
                    <br />
                    <br />
                    <br />
                    {addingMember ?
                        <>
                            <Row>
                                <Col>
                                    <h1 className="text-center display-5">Adding Members</h1>
                                </Col>
                            </Row>
                            <Row>
                                <Col>
                                    <div className='d-flex justify-content-center mb-3'>
                                        <Button variant="light" className={BSafesStyle.btnCircle} onClick={() => setAddingMember(false)}>
                                            <i id="1" className="fa fa-times fa-lg " aria-hidden="true"></i>
                                        </Button>
                                    </div>
                                </Col>
                            </Row>
                            <Row className="justify-content-center">
                                <Col md={8} lg={6}>
                                    <Form onSubmit={onSubmit}>
                                        <InputGroup className="mb-3">
                                            <Form.Control size="lg" type="text"
                                                value={searchValue}
                                                onChange={onSearchValueChanged}
                                            />
                                            <Button variant="link" onClick={onSubmit}>
                                                <i id="1" className="fa fa-search fa-lg text-dark" aria-hidden="true" ></i>
                                            </Button>
                                        </InputGroup>
                                    </Form>
                                </Col>
                            </Row>
                            {searchResult()}
                        </>
                        :
                        <>
                            <Row>
                                <Col>
                                    <h1 className="text-center display-5">Members</h1>
                                </Col>
                            </Row>
                            <Row >
                                <Col>
                                    <div className='d-flex justify-content-center mb-3'>
                                        <Button variant="primary" className={BSafesStyle.btnCircle} onClick={handleAddMembers}>
                                            <i id="1" className="fa fa-plus fa-lg" aria-hidden="true"></i>
                                        </Button>
                                    </div>
                                </Col>
                            </Row>
                        </>
                    }
                </Container>
            </ContentPageLayout>
        </div>
    )
}

function ellipsisButton({ children, onClick }, ref) {
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
            <i className="fa fa-ellipsis-v text-dark" aria-hidden="true"></i>
            {children}
        </a>
    )
}

function MemberCard({ member, handleAdd, handleDelete }) {
    const componnet = (
        <Row >
            <Col xs={12} sm={{ span: 10, offset: 1 }} md={{ span: 8, offset: 2 }} class="marginTop7Px">
                <Card>
                    <Card.Body className="p-2">
                        <div>
                            <Row >
                                <Col xs={9}>
                                    <h6 className="fs-5 display-6">{member.id}</h6>
                                </Col>
                                <Col xs={3}>
                                    {handleDelete && <Dropdown align="end" className="justify-content-end pull-right">
                                        <Dropdown.Toggle as={ellipsisToggle} variant="link" />

                                        <Dropdown.Menu>
                                            <Dropdown.Item onClick={() => handleAddClicked("addAnItemBefore")}>Delete</Dropdown.Item>
                                        </Dropdown.Menu>
                                    </Dropdown>}
                                    {handleAdd &&
                                        <Button variant='link' className="justify-content-end pull-right border-0 text-black">
                                            <i id="1" className="fa fa-plus fa-lg" aria-hidden="true"></i>
                                        </Button>}
                                </Col>
                            </Row>
                        </div>
                    </Card.Body>
                </Card>
            </Col>
        </Row>
    )
    return componnet;
}