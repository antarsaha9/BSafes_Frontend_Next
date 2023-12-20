import { useEffect, useRef, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import {useRouter} from "next/router";

import Container from 'react-bootstrap/Container'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Button from 'react-bootstrap/Button';
import Badge from 'react-bootstrap/Badge';

import { Inter, Roboto_Mono, Montserrat, Orbitron, Tourney, Oswald } from 'next/font/google'
 
export const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
})
 
export const roboto_mono = Roboto_Mono({
  subsets: ['latin'],
  display: 'swap',
})

export const monteserrat = Montserrat({
    subsets: ['latin'],
    display: 'swap',
})

export const orbitron = Orbitron({
    subsets: ['latin'],
    display: 'swap',
})

export const tourney = Tourney({
    subsets: ['latin'],
    display: 'swap',
})

export const oswald = Oswald({
    subsets: ['latin'],
    display: 'swap',
})

import BSafesStyle from '../styles/BSafes.module.css'

import { debugLog} from '../lib/helper'

import ContentPageLayout from '../components/layouts/contentPageLayout';
import DialerLock from '../components/dialerLock/dialerLock';

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
        <ContentPageLayout publicPage={true} publicHooks={{onOpen:handleUnlock}} showNavbarMenu={false} showPathRow={false}> 
            <div className={BSafesStyle.metalBackground} style={{height:`200px`, padding:'20px'}}>
                <DialerLock size={120} fontSize={0.6} triangleSize={3}/>
                <h1 className={BSafesStyle.metalH1+' '+ orbitron.className}>
                    <span>Since 2017</span>
                    <span>Since 2017</span>
                </h1>

                <br />
                <Button className={BSafesStyle.metallicButton} onClick={handleUnlock}>TRY ME ! 30-day free <i className="fa fa-arrow-right" aria-hidden="true"></i></Button>
            </div>
            <Container>   
                <br />
                <br />            
                <Row className={oswald.className}>
                    <Col md={6}>
                        <h1>Protecting Your Confidential Records in the Cloud.</h1>
                        <p>BSafes is an end-to-end ecrypted web app for you to write securely, protect and origanize sensitve videos, photos, text, documents and files in the cloud.</p>
                        <h2><Badge pill bg="warning">Coming soon</Badge></h2>
                    </Col>
                </Row>
                <hr />
                <Row>
                    <Col>
                    <h2><Badge pill bg="primary">Functions</Badge></h2>
                    <ul>
                        <li>
                            <h6>Protecting confidential records, with end-to-end encryption.</h6>
                        </li>
                        <li>
                            <h6>Adding sensitive videos, photos, text and file to one record.</h6>
                        </li>
                        <li>
                            <h6>Organizing records with boxes, folders, notebooks and diaries.</h6>
                        </li>
                        <li>
                            <h6>Access to records anytime, anywhere, on any devices.</h6>
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
                        <li>
                            <h6>Versiosn history.</h6>
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
                            <h6>2 factor authentication.</h6>
                        </li>
                        <li>
                            <h6>Compatiable with modern browsers on all devices.</h6>
                        </li>
                    </ul>
                    </Col>
                </Row>
                <Row>
                    <Col xs={12} className='text-center'>
                        <Button variant="danger" onClick={handleUnlock}>Try me <i className="fa fa-arrow-right" aria-hidden="true"></i></Button>
                    </Col>           
                </Row>
            </Container>
        </ContentPageLayout>
    )
}