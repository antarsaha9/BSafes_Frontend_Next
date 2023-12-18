import { useEffect, useRef, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import {useRouter} from "next/router";

import Container from 'react-bootstrap/Container'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Button from 'react-bootstrap/Button';

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
            <Container className="mt-5 d-flex justify-content-center" style={{height:'80vh', backgroundColor: "white"}}>     
                <Row>
                    <Col>
                        <Button onClick={handleUnlock}>Unlock</Button>
                    </Col>           
                </Row>
            </Container>
        </ContentPageLayout>
    )
}