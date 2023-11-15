import { useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import {useRouter} from "next/router";

import Container from 'react-bootstrap/Container'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Form from 'react-bootstrap/Form'
import Button from 'react-bootstrap/Button'
import Spinner from 'react-bootstrap/Spinner';

import { debugLog } from '../lib/helper'

import ContentPageLayout from '../components/layouts/contentPageLayout';

import { logOutAsyncThunk } from '../reduxStore/auth'

export default function LogOut() {
    const debugOn = false;
    const router = useRouter();
    const dispatch = useDispatch();

    const activity = useSelector(state=>state.auth.activity);
    const isLoggedIn = useSelector(state=>state.auth.isLoggedIn);

    const handleSubmit = async e => { 
        debugLog(debugOn,  "handleSubmit");
        dispatch(logOutAsyncThunk());     
    }

    useEffect(()=> {
        if(!isLoggedIn) {
            router.push('/logIn');
        }
    }, [isLoggedIn])


    return (
        <ContentPageLayout> 
            <Container className="mt-5 d-flex justify-content-center" style={{height:'80vh', backgroundColor: "white"}}>     
                <Row>
                    <Col>
                        <Form>
                            <Button variant="dark" onClick={handleSubmit} disabled={activity==="LoggingOut"}>
                                {(activity==="LoggingOut")?
                                    <Spinner animation="border" role="status">
                                        <span className="visually-hidden">Loading...</span>
                                    </Spinner>
                                    :'Lock'
                                }
                                
                            </Button>
                        </Form>
                    </Col>           
                </Row>
            </Container>
        </ContentPageLayout>
    )
}