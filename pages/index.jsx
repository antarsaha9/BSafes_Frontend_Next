import { useEffect, useRef, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useRouter } from "next/router";
import Link from 'next/link';

import Container from 'react-bootstrap/Container'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Button from 'react-bootstrap/Button';
import Badge from 'react-bootstrap/Badge';
import Image from 'react-bootstrap/Image';
import Carousel from 'react-bootstrap/Carousel';

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

import { debugLog } from '../lib/helper'

import ContentPageLayout from '../components/layouts/contentPageLayout';
import DialerLock from '../components/dialerLock/dialerLock';

import { logInAsyncThunk } from '../reduxStore/auth'

export default function Home() {
    const debugOn = false;
    const router = useRouter();
    const dispatch = useDispatch();

    const [keyPassword, setKeyPassword] = useState("");
    const nicknameRef = useRef(null);
    const activity = useSelector(state => state.auth.activity);
    const isLoggedIn = useSelector(state => state.auth.isLoggedIn);

    const bsafesNativeToWebCall = () => {
        console.log('bsafesNativeToWebCall');
        //alert('bsafesNativeToWebCall');
    }

    const handleUnlock = () => {
        router.push("/logIn");
    }

    useEffect(() => {
        if (process.env.NEXT_PUBLIC_platform === 'iOS') {
            import('../lib/importCommonScripts').then(async ic => {
                await ic.commonScripts;
                console.log('window.bsafesNative.name: ', window.bsafesNative.name);
                window.bsafesNative.bsafesNativeToWebCall = bsafesNativeToWebCall;

                if (window.webkit && window.webkit.messageHandlers && window.webkit.messageHandlers.toggleMessageHandler) {
                    //alert('From js to swift');
                    console.log('From js to swift');
                    window.webkit.messageHandlers.toggleMessageHandler.postMessage({
                        "message": 'From js to swift'
                    });
                }
            });
        }
    }, [])

    useEffect(() => {
        if (isLoggedIn) {
            router.push('/safe');
        }
    }, [isLoggedIn])

    return (
        <ContentPageLayout publicPage={true} publicHooks={{ onOpen: handleUnlock }} showNavbarMenu={false} showPathRow={false}>
            <div className='p-2' style={{ color: 'White', backgroundColor: 'Red' }}>
                <p className={`${BSafesStyle.topAlertText} ${monteserrat.className}`}> {`👩🏻‍💻 Alert! AI's potential to affect privacy rights and the protection of users' personal data.`}</p>
            </div>
            <div style={{ height: '1px', backgroundColor: 'Grey' }}>
            </div>
            <div className={BSafesStyle.metalBackground} style={{ padding: '20px' }}>
                <Container>
                    <DialerLock size={120} fontSize={0.6} triangleSize={3} />
                    <h1 className={BSafesStyle.metalH1 + ' ' + orbitron.className}>
                        <span>Since 2017</span>
                        <span>Since 2017</span>
                    </h1>
                    <br />
                    <Row className={oswald.className} style={{ color: 'white' }}>
                        <Col md={12}>
                            <h1 className={`${BSafesStyle.bannerTextH1}`}>Protecting Your Confidential Records in an AI-Driven World</h1>
                        </Col>
                    </Row>
                    <br />
                    <Row>
                        <Col xs={6}>
                            <h1 className='display-3'>🗣️  📺  📷  📑</h1>
                            <h3 style={{ color: 'white' }}> AES-256 End-to-End Encryption with Your Own Key</h3>
                            <br />
                            {true && <Button variant='danger' onClick={handleUnlock}>TRY ME <i className="fa fa-arrow-right" aria-hidden="true"></i></Button>}
                        </Col>
                        <Col xs={6} style={{ position: 'relative', left: '-50px', top: '100px', zIndex: '500' }}>
                            <Link className={BSafesStyle.noUnderline} href='/'>
                                <div className={BSafesStyle.saleBadges}>
                                    <p>
                                        <span class={BSafesStyle.saleFirstLine}>50GB</span><br />
                                        <span class={BSafesStyle.saleSecondLine}>$2.95</span><br />
                                        <span class={BSafesStyle.saleThirdLine}>PER MONTH</span><br />
                                        <span class={BSafesStyle.saleForthLine}>30-day free trial</span>
                                    </p>
                                </div>
                            </Link>
                        </Col>
                    </Row>
                </Container>
                <br />
            </div>
            <div hidden className='p-2' style={{ color: 'black', backgroundColor: 'lightgrey' }}>
                <p className={`${BSafesStyle.hintText} ${monteserrat.className}`}> {`🧑🏿‍💻 Your device encrypts your data with a secret key known only to you, the server receives obscured data. Nobody, including BSafes, learns your data.`}</p>
            </div>
            <div style={{ height: '1px', backgroundColor: 'Grey' }}></div>
            <Carousel data-bs-theme="dark">
                <Carousel.Item interval={3000}>
                    <Image className={BSafesStyle.screenShotImage}
                        src="/images/BSafesPreview_Love_03.png"
                        alt="BSafes Preview"
                    />
                </Carousel.Item>
                <Carousel.Item interval={3000}>
                    <Image className={BSafesStyle.screenShotImage}
                        src="/images/BSafesPreview_Finance_01.png"
                        alt="BSafes Preview"
                    />
                </Carousel.Item>
                <Carousel.Item interval={3000}>
                    <Image className={BSafesStyle.screenShotImage}
                        src="/images/BSafesPreview_DoctorVisit_04.png"
                        alt="BSafes Preview"
                    />
                </Carousel.Item>
            </Carousel>
            <br />
            <br />
            <br />
            <Container>
                <br />
                <br />
                <Row className={monteserrat.className}>
                    <Col md={12}>
                        <p style={{ fontSize: "1.6rem" }}>BSafes is an end-to-end ecrypted cloud service for you to create and store confidential records that contain sensitive information, including text, videos, photos and any file attachemnts.</p>
                        <h2><Badge pill bg="warning">Coming soon</Badge></h2>
                    </Col>
                </Row>
            </Container>
            <br />
            <br />
            <br />
            <div className={monteserrat.className} style={{ backgroundColor: '#f4f4f4' }}>
                <Container>
                    <br />
                    <br />
                    <br />
                    <br />
                    <Row>
                        <h1 className='text-center display-1' style={{ fontWeight: '450', color: 'black' }}>Secure by Design. Secure by Default.</h1>
                    </Row>
                    <Row >
                        <Col md={12}>
                            <p style={{ fontSize: "1.6rem" }}>BSafes is designed for data privacy and security from the start. With one click, your device automatically encrypts and backs up your data without any configuration. Because your device encrypts data with a secret key that only you know, the server receives obscured data. Your secret key is never sent to the server, so nobody, including BSafes, can access your data.</p>
                            <p style={{ fontSize: "1.6rem" }}>2FA included.</p>
                            <h2><Badge pill bg="warning">Coming soon</Badge></h2>
                        </Col>
                    </Row>
                    <Row >
                        <Col md={12}>
                            <div className={BSafesStyle.featureCard}>
                               <Container>
                                    <Row style={{paddingTop:'100px'}}>
                                        <Col xs={12} lg={6} style={{paddingLeft:'45px', paddingRight:'45px', maxHeight:'500px', overflow:'hidden'}}>
                                            <h1>Start with a page</h1>
                                            <p style={{ fontSize: "1.2rem" }}>BSafes is designed for data privacy and security from the start. With one click, your device automatically encrypts and backs up your data without any configuration. Because your device encrypts data with a secret key that only you know, the server receives obscured data. Your secret key is never sent to the server, so nobody, including BSafes, can access your data.</p>
                                        </Col>
                                        <Col xs={12} lg={6} style={{textAlign:'center', maxHeight:'500px', overflow:'hidden'}}>
                                            <Image style={{margin:'auto', width:'420px'}} src='/images/FinanceIPhone.png'></Image>
                                        </Col>
                                    </Row>
                               </Container>
                            </div>
                        </Col>
                    </Row>
                    <br />
                    <br />
                    <br />
                </Container>
            </div>

            <Container>
                <br />
                <br />

                <hr />
                <Row>
                    <Col>
                        <h2><Badge pill bg="primary">Functions</Badge></h2>
                        <ul>
                            <li>
                                <h6>Protecting confidential records, with end-to-end encryption.</h6>
                            </li>
                            <li>
                                <h6>Writing securely with rich text. Inserting photos and videos.</h6>
                            </li>
                            <li>
                                <h6>Adding sensitive videos, photos, text and file to one record.</h6>
                            </li>
                            <li>
                                <h6>Organizing records with boxes, folders, notebooks and diaries.</h6>
                            </li>
                            <li>
                                <h6>Locating records with search capability.</h6>
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