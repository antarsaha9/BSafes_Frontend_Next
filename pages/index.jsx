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
            <div hidden className='p-2' style={{ color: 'White', backgroundColor: 'Red' }}>
                <p className={`${BSafesStyle.topAlertText} ${monteserrat.className}`}><span style={{ fontSize: "1.6rem" }}>👩🏻‍💻</span> {`Alert! AI's potential to affect privacy rights and the protection of personal data.`}</p>
            </div>
            <div style={{ height: '1px', backgroundColor: 'Grey' }}>
            </div>
            <div className={BSafesStyle.metalBackground} style={{ padding: '20px' }}>
                <Container>
                    <Row>
                        <Col xs={6}>
                            <DialerLock size={120} fontSize={0.6} triangleSize={3} />
                            <h1 className={BSafesStyle.metalH1 + ' ' + orbitron.className}>
                                <span>Since 2017</span>
                                <span>Since 2017</span>
                            </h1>
                            <br />
                            <br />
                            {true && <Button variant='danger' onClick={handleUnlock}>TRY ME <i className="fa fa-arrow-right" aria-hidden="true"></i></Button>}
                        </Col>
                        <Col xs={6} style={{ position: 'relative', left: '-50px', top: '100px', zIndex: '500' }}>
                            <Link className={BSafesStyle.noUnderline} href='/'>
                                <div className={BSafesStyle.saleBadges}>
                                    <p>
                                        <span className={BSafesStyle.saleFirstLine}>50GB</span><br />
                                        <span className={BSafesStyle.saleSecondLine}>$2.95</span><br />
                                        <span className={BSafesStyle.saleThirdLine}>PER MONTH</span><br />
                                        <span className={BSafesStyle.saleForthLine}>30-day free trial</span>
                                    </p>
                                </div>
                            </Link>
                        </Col>
                    </Row>
                </Container>
                <br />
            </div>
            <Container>
                <br />
                <Row className={oswald.className} style={{ color: 'black' }}>
                    <Col md={12}>
                        <h1 className={`${BSafesStyle.bannerTextH1}`}>Protecting Sensitive Information in an AI-Driven World</h1>
                    </Col>
                </Row>
                <Row>
                    <Col xs={12}>
                        <br />
                        <h1 className='display-6'>🗣️  📺  📷  📑</h1>
                        <p className={BSafesStyle.descriptionText}>🔐 With military-grade (AES-256) end-to-end encryption, no one can see your private writings, videos, photos, and files.</p>
                        <br />
                    </Col>
                </Row>
            </Container>
            <div hidden className='p-2' style={{ color: 'black', backgroundColor: 'lightgrey' }}>
                <p className={`${BSafesStyle.hintText} ${monteserrat.className}`}> {`🧑🏿‍💻 Your device encrypts your data with a secret key known only to you, the server receives obscured data. Nobody, including BSafes, learns your data.`}</p>
            </div>
            <div style={{ height: '1px', backgroundColor: 'Grey' }}></div>
            <Carousel data-bs-theme="dark">
                <Carousel.Item interval={3000}>
                    <Image className={BSafesStyle.screenShotImage}
                        src="/images/BSafesPreview_Love_11.png"
                        alt="BSafes Preview"
                    />
                </Carousel.Item>
                <Carousel.Item interval={3000}>
                    <Image className={BSafesStyle.screenShotImage}
                        src="/images/BSafesPreview_Finance_11.png"
                        alt="BSafes Preview"
                    />
                </Carousel.Item>
                <Carousel.Item interval={3000}>
                    <Image className={BSafesStyle.screenShotImage}
                        src="/images/BSafesPreview_DoctorVisit_11.png"
                        alt="BSafes Preview"
                    />
                </Carousel.Item>
            </Carousel>
            <Container>
                <br />
                <br />
                <Row className={monteserrat.className}>
                    <Col md={12}>
                    <h1 className='text-center display-1' style={{ fontWeight: '450', color: 'black' }}>Be Bold</h1>
                        <p className={BSafesStyle.descriptionText}>BSafes is a safe place for writing and record keeping with visual-rich media (videos, photos, images) and additional attachments. Be bold about your creative ideas, privacy, and secrets because no one else can see them.</p>
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
                            <p className={BSafesStyle.descriptionText}>We designed BSafes for data privacy and security from the start. Your device encrypts all your data with a secret key known only to you and then sends the obscured data to the server. Because no one else has the key, nobody could learn your data, not even BSafes.</p>
                            <p style={{ fontSize: "1.6rem" }}>2FA included.</p>
                            <h2><Badge pill bg="warning">Coming soon</Badge></h2>
                        </Col>
                    </Row>
                    <Row >
                        <Col md={12}>
                            <div className={BSafesStyle.featureCard}>
                                <Container>
                                    <Row style={{ paddingTop: '0px' }}>
                                        <Col xs={12} lg={6} className={BSafesStyle.featureCardText}>
                                            <h1 className={BSafesStyle.featureCardTitle}>Start with a page</h1>
                                            <p className={BSafesStyle.featureCardFont}>You could write and embed videos and photos with a secure, rich-text editor. In addition, you could create a video gallery and a photo gallery, as well as add attachments. Your device encrypts and then backs up everything.</p>
                                        </Col>
                                        <Col xs={12} lg={6} className={BSafesStyle.featureCardImage}>
                                            <Image style={{ margin: 'auto', width: '80%' }} src='/images/feature_startAPage.png'></Image>
                                        </Col>
                                    </Row>
                                </Container>
                            </div>
                        </Col>
                    </Row>
                    <br />
                    <Row >
                        <Col md={12}>
                            <div className={BSafesStyle.featureCard}>
                                <Container>
                                    <Row style={{ paddingTop: '0px' }}>
                                        <Col xs={12} lg={6} className={BSafesStyle.featureCardText}>
                                            <h1 className={BSafesStyle.featureCardTitle}>One-Click Encrypt & Back Up</h1>
                                            <p className={BSafesStyle.featureCardFont}>After writing, with one click, your device automatically encrypts and backs up your data to the server. Because the server receives the obscured data encrypted by a key known only to you, no one can see your data.</p>
                                        </Col>
                                        <Col xs={12} lg={6} className={BSafesStyle.featureCardImageTop}>
                                            <Image style={{ margin: 'auto', width: '80%' }} src='/images/feature_oneClick.png'></Image>
                                        </Col>
                                    </Row>
                                </Container>
                            </div>
                        </Col>
                    </Row>
                    <br />
                    <Row >
                        <Col md={12}>
                            <div className={BSafesStyle.featureCard}>
                                <Container>
                                    <Row style={{ paddingTop: '0px' }}>
                                        <Col xs={12} lg={6}>
                                            <Image className={BSafesStyle.featureCardIcon} src='/images/icon_thunder.png'></Image>
                                        </Col>
                                        <Col xs={12} lg={6} className={BSafesStyle.featureCardText}>
                                            <h1 className={BSafesStyle.featureCardTitle}>More productive than a secure storage solution</h1>
                                            <p className={BSafesStyle.featureCardFont}>{`You don't have to write with a word processor, encrypt the document, and then upload it to cloud storage in separate steps. BSafes enables you to write directly online. With one click, your data is secured. It is much quicker to update your writing because you don't have to download, edit, and then upload again.`}</p>
                                        </Col>
                                    </Row>
                                </Container>
                            </div>
                        </Col>
                    </Row>
                    <br />
                    <Row >
                        <Col md={12}>
                            <div className={BSafesStyle.featureCard}>
                                <Container>
                                    <Row style={{ paddingTop: '0px' }}>
                                        <Col xs={12} lg={6} className={BSafesStyle.featureCardText}>
                                            <h1 className={BSafesStyle.featureCardTitle}>Do not use AI tools for sensitive information</h1>
                                            <p className={BSafesStyle.featureCardFont}>Microsoft 365, Google Docs, and other generative AI tools learn from your data. It is vital to refrain from entering sensitive information into those AI tools to avoid the risks of such data being used as training data and being disclosed to third parties. With BSafes, since your device encrypts all your data before sending it to the server, it can not learn from obscured data.</p>
                                        </Col>
                                        <Col xs={12} lg={6}>
                                            <Image className={BSafesStyle.featureCardRightIcon} src='/images/icon_noAI.png'></Image>
                                        </Col>
                                    </Row>
                                </Container>
                            </div>
                        </Col>
                    </Row>
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