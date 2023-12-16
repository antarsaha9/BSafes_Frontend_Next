import { useEffect, useRef, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import {useRouter} from "next/router";

import Container from 'react-bootstrap/Container'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Button from 'react-bootstrap/Button';
import Badge from 'react-bootstrap/Badge';

import BSafesStyle from '../styles/BSafes.module.css'

import { debugLog} from '../lib/helper'

import ContentPageLayout from '../components/layouts/contentPageLayout';
import KeyInput from "../components/keyInput";

import { logInAsyncThunk } from '../reduxStore/auth'

export default function Home() {
    const debugOn = false;
    const router = useRouter();
    const dispatch = useDispatch();
    
    const [keyPassword, setKeyPassword] = useState("");
    const nicknameRef = useRef(null);
    const activity = useSelector(state=>state.auth.activity);
    const isLoggedIn = useSelector(state=>state.auth.isLoggedIn);

    const handleUnlock = () => {
        router.push("/logIn");
    }

    useEffect(()=> {
        if(isLoggedIn) {
            router.push('/safe');
        }
    }, [isLoggedIn])

    return (
        <ContentPageLayout showNavbarMenu={false} showPathRow={false}> 
            <Container>   
                <br />
                <br />
                <br />  
                <Row>
                    <Col md={6}>
                        <h1>Protecting Your Confidential Records in the Cloud. Coming Soon ...</h1>
                    </Col>
                </Row>
                <br />
                <Row>
                    <Col xs={6}>
                        <Button className="" variant='danger' onClick={handleUnlock}>30-day free trial</Button>
                    </Col>           
                </Row>
                <br />
                <br />
                <hr />
                <Row>
                    <Col>
                    <h2><Badge pill bg="primary">Functions</Badge></h2>
                    <ul>
                        <li>
                            <h6>Protect sensitive videos, photos, text and file in one record, with end-to-end encryption.</h6>
                        </li>
                        <li>
                            <h6>Organize your records with boxes, folders, notebooks and diaries.</h6>
                        </li>
                        <li>
                            <h6>Access your records anytime, anywhere, on any devices.</h6>
                        </li>
                    </ul>
                    </Col>
                </Row>
                <Row>
                    <Col>
                    <h2><Badge pill bg="info">Benefits</Badge></h2>
                    <ul>
                        <li>
                            <h6>Enhance your data security.</h6>
                        </li>
                        <li>
                            <h6>Boost your productivity.</h6>
                        </li>
                        <li>
                            <h6>30-day free trial with all features.</h6>
                        </li>
                        <li>
                            <h6>Cost effective. Starting at 2.95 usd for 50GB.</h6>
                        </li>
                    </ul>
                    </Col>
                </Row>
                <Row>
                    <Col>
                    <h2><Badge pill bg="success">Features</Badge></h2>
                    <ul>
                        <li>
                            <h6>End-to-end encryption.</h6>
                        </li>
                        <li>
                            <h6>Encrypt & backup with one-click.</h6>
                        </li>
                        <li>
                            <h6>Built-in secure rich-text editor.</h6>
                        </li>
                        <li>
                            <h6>Add photos, videos and attachments easily with drag-and-drop.</h6>
                        </li>
                        <li>
                            <h6>Open multiple records with multi-tab support.</h6>
                        </li>
                        <li>
                            <h6>Efficent search.</h6>
                        </li>
                        <li>
                            <h6>Anonymous identity.</h6>
                        </li>

                    </ul>
                    </Col>
                </Row>
                <Row>
                    <Col>
                    <h2><Badge pill bg="dark">Specifications</Badge></h2>
                    <ul>
                        <li>
                            <h6>AES-256 client-side encryption.</h6>
                        </li>
                        <li>
                            <h6>Argon-2 key generation.</h6>
                        </li>
                        <li>
                            <h6>Compatiable with modern browsers on all devices.</h6>
                        </li>
                    </ul>
                    </Col>
                </Row>
            </Container>
        </ContentPageLayout>
    )
}