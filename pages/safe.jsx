import { useEffect, useRef, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'

import Container from 'react-bootstrap/Container'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Form from 'react-bootstrap/Form'
import Button from 'react-bootstrap/Button'
import InputGroup from 'react-bootstrap/InputGroup'

import jquery from "jquery"

const forge = require('node-forge');

import { debugLog, PostCall } from '../lib/helper'

import ContentPageLayout from '../components/layouts/contentPageLayout';
import Scripts from '../components/scripts'

import Workspace from '../components/workspace'


export default function Safe() {

    return (
        <ContentPageLayout> 
            <Row className="justify-content-center">
                <Col lg={8}>
                    <Workspace />
                </Col> 
            </Row>
           
        </ContentPageLayout>
    )
}