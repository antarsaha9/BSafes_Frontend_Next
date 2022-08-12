import { useEffect, useRef, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'

import Container from 'react-bootstrap/Container'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Form from 'react-bootstrap/Form'
import Button from 'react-bootstrap/Button'

import { debugLog, PostCall } from '../lib/helper'

import ContentPageLayout from '../components/layouts/contentPageLayout';

import { preflightAsyncThunk } from '../reduxStore/auth';

export default function Safe() {
    const debugOn = true;
    const isLoggedIn = useSelector(state => state.auth.isLoggedIn);
    
    return (
        <ContentPageLayout> 
            <Container className="mt-5 d-flex justify-content-center" style={{height:'80vh', backgroundColor: "white"}}>     
            {
                isLoggedIn?"In":"Out"
            }

            </Container>
        </ContentPageLayout>
    )
}