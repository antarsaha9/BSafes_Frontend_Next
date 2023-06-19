import { useEffect, useRef, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import {useRouter} from "next/router";

import Container from 'react-bootstrap/Container'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Form from 'react-bootstrap/Form'
import Button from 'react-bootstrap/Button'
import Spinner from 'react-bootstrap/Spinner';

import BSafesStyle from '../../styles/BSafes.module.css'

import ContentPageLayout from '../../components/layouts/contentPageLayout';

import { debugLog} from '../../lib/helper'
import { nicknameSignInAsyncThunk } from '../../reduxStore/v1AccountSlice';

export default function LogIn() {
    const debugOn = true;

    const dispatch = useDispatch();
    const router = useRouter();

    const [memberName, setMemberName] = useState('');
    const [password, setPassword] = useState('');

    const activity = useSelector(state=>state.v1Account.activity);
    const masterId = useSelector(state => state.v1Account.masterId);
    const displayMasterId = useSelector(state => state.v1Account.displayMasterId);

    const handleMemberName = (e) => {
        setMemberName(e.target.value);
    }

    const handlePassword = (e) => {
        setPassword(e.target.value);
    }

    const handleDone = (e) => {
        debugLog(debugOn, `${memberName} ${password}`);

        dispatch(authenticateManagedMemberAsyncThunk({masterId, memberName, password}));
    }

    useEffect(()=>{
        if(router.query.accountNickname) {
            const nickname = router.query.accountNickname;
            dispatch(nicknameSignInAsyncThunk({nickname}));
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps   
    }, [router.query.accountNickname]);

    return (
        <div className={BSafesStyle.managedMemberLoginBackground}>
            <ContentPageLayout showNavbarMenu={false} showPathRow={false}> 
                <Container className="mt-5 ">     
                    <Row>
                        <Col>
                            <h1 className='display-5 text-center'>Member Sign In</h1>
                        </Col>           
                    </Row>
                    <br />
                    <Row>
                        <Col xs={{span:12, offset:0}} sm={{span:12, offset:0}} md={{span:10, offset:1}} lg={{span:8, offset:2}}>
                            <Form style={{backgroundColor:'white'}}>
                                <br />
                                <Col xs={{span:10, offset:1}} sm={{span:8, offset:2}} >
                                    <Form.Group className="mb-3" controlId="exampleForm.ControlInput1">
                                        <Form.Label>Account ID</Form.Label>
                                        { (activity !== 'Done' && activity !== 'Error') &&
                                            <Row className="justify-content-center">
                                                <Spinner animation='border' />
                                            </Row>
                                        }
                                        <h4 >{displayMasterId}</h4>
                                    </Form.Group>
                                    <br />
                                    <Form.Group className="mb-3" controlId="MemberName">
                                        <Form.Label>Member Name</Form.Label>
                                        <Form.Control className='py-2' value={memberName} onChange={handleMemberName} type="text" placeholder='' autoComplete="off" />
                                    </Form.Group>
                                    <Form.Group className="mb-3" controlId="keyPassword">
                                        <Form.Label>Password</Form.Label>
                                        <Form.Control className='py-2' value={password} onChange={handlePassword} type="password" placeholder='' autoComplete="off" />
                                    </Form.Group>
                                    <Row>
                                        <Col>
                                            <Button className='pull-right' onClick={handleDone}>
                                                Done
                                            </Button>
                                        </Col>
                                    </Row>
                                    <p className="text-danger" >Invalid member !</p>
                                </Col>
                                <br />
                            </Form>
                        </Col>
                    </Row>
                </Container>
            </ContentPageLayout>
        </div>
    )
}