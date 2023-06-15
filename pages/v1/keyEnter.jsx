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

import { debugLog} from '../../lib/helper'

import ContentPageLayout from '../../components/layouts/contentPageLayout';
import KeyInput from "../../components/keyInput";

import { logInAsyncThunk } from '../../reduxStore/auth'

export default function LogIn() {

    return (
        <div className={BSafesStyle.managedMemberLoginBackground}>
            <ContentPageLayout showNavbarMenu={false} showPathRow={false}> 
                <Container className="mt-5 ">     
                    <Row>
                        <Col>
                            <h1 className='display-5 text-center'>Member Sign In</h1>
                        </Col>           
                    </Row>
                    <Row>
                        <Col xs={{span:12, offset:0}} sm={{span:12, offset:0}} md={{span:10, offset:1}} lg={{span:8, offset:2}}>
                            <Form style={{backgroundColor:'white'}}>
                                <br />
                                <Col xs={{span:10, offset:1}} sm={{span:8, offset:2}} >
                                    <Form.Group className="mb-3" controlId="exampleForm.ControlInput1">
                                        <Form.Label>Account ID</Form.Label>
                                        <h4 >email@example.com</h4>
                                    </Form.Group>
                                    <Form.Group className="mb-3" controlId="Nickname">
                                        <Form.Label>Member Name</Form.Label>
                                        <Form.Control className='py-2' type="text" placeholder='' autoComplete="off" />
                                    </Form.Group>
                                    <Form.Group className="mb-3" controlId="keyPassword">
                                        <Form.Label>Password</Form.Label>
                                        <Form.Control className='py-2' type="password" placeholder='' autoComplete="off" />
                                    </Form.Group>
                                    <Row>
                                        <Col>
                                            <Button className='pull-right'>
                                                Done
                                            </Button>
                                        </Col>
                                    </Row>
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