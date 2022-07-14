import { useEffect } from 'react'
import { useSelector } from 'react-redux'

import Container from 'react-bootstrap/Container'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Form from 'react-bootstrap/Form'
import Button from 'react-bootstrap/Button'

import jquery from "jquery"

const forge = require('node-forge');
const argon2 = require('argon2-browser')

import { calculateExpandedKey } from '../lib/helper'

import ContentPageLayout from '../components/layouts/contentPageLayout';
import Scripts from '../components/scripts'

import KeyInput from "../components/keyInput";
import { FormText } from 'react-bootstrap'

export default function CreateKey() {
    const scriptsLoaded = useSelector(state => state.scripts.done);

    const handleSubmit = async e => { 
        console.log("handleSubmit");
        const nickname = "apple102";
        const password = "Wishing you well!";

        await calculateExpandedKey(nickname, password);
 /*       // Deriving the salt from nickname
        let md = forge.md.sha256.create();
        md.update(nickname);      
        let result = forge.util.hexToBytes(md.digest().toHex())
        let keySalt = result.substring(0, 16);
        console.log("keySalt:", keySalt.length);
        
        
        try {
            const result= await argon2.hash({
                pass: password, 
                salt: keySalt,
                time: 2,
                mem: 100 * 1024,
                hashLen: 32,
                parallelism: 2,
                type: argon2.ArgonType.Argon2id
            })
            console.log(result.hashHex);

            const expandedKey = forge.util.hexToBytes(result.hashHex);
            console.log(expandedKey);
        } catch (e) {
            console.error(e);
        }
        */
    }

    useEffect(()=> {
        window.$ = window.jQuery = jquery;
        if(scriptsLoaded) {
            //argon2Functions.loadArgon2('native-wasm');
        }
    }, [scriptsLoaded]);


    return (
        <ContentPageLayout> 
            <Container className="mt-5 d-flex justify-content-center" style={{height:'80vh', backgroundColor: "white"}}>     
                <Row>
                    <Col>
                        <h1>Create Your Key</h1>
                        <hr></hr>
                        <Form>
                            <Form.Group className="mb-3" controlId="Nickname">
                                <Form.Label>Nickname</Form.Label>
                                <Form.Control size="lg" type="text" placeholder='Enter a nickname' />
                            </Form.Group>
                            <Form.Group className="mb-3" controlId="keyPassword">
                                <Form.Label>Key Password</Form.Label>
                                <KeyInput />
                                <Form.Text id="passwordHelpBlock" muted>
                Your password must be longer than 8 characters, contain letters and numbers
                                </Form.Text>
                            </Form.Group>
                            <Form.Group className="mb-3" controlId="ConfirmkeyPassword">
                                <Form.Label>Please retype to confirm</Form.Label>
                                <KeyInput />
                            </Form.Group>
                            <Button variant="dark" onClick={handleSubmit}>Submit</Button>
                        </Form>
                    </Col>           
                </Row>
            </Container>
            <Scripts />
        </ContentPageLayout>
    )
}