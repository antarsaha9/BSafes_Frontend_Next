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
                <Row className={oswald.className} style={{color: 'black' }}>
                    <Col xs={12} md={{span:10, offset:1}} xl={{span:8, offset:2}}>
                        <h1 className={`${BSafesStyle.bannerTextH1}`}>Protecting Sensitive Information in an AI-Driven World</h1>
                    </Col>
                </Row>
                <Row className={BSafesStyle.descriptionRow}>
                    <Col xs={12} md={{span:10, offset:1}} xl={{span:8, offset:2}}>
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
            <div className={BSafesStyle.carouselRow}>
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
            </div>
            <Container>
                <br />
                <br />
                <Row className={`${BSafesStyle.descriptionRow} ${monteserrat.className}`}>
                    <Col xs={12} md={{span:10, offset:1}} xl={{span:8, offset:2}}>
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
                    <Row >
                        <Col md={12}>
                            <div className={BSafesStyle.featureCard}>
                                <Container>
                                    <Row style={{ paddingTop: '0px' }}>
                                        <Col xs={12} md={6}>
                                            <Image className={BSafesStyle.featureCardIcon} src='/images/icon_noAI.png'></Image>
                                        </Col>
                                        <Col xs={12} md={6} className={BSafesStyle.featureCardText}>
                                            <h1 className={BSafesStyle.featureCardTitle}>Generative AI needs lots of data</h1>
                                            <p className={BSafesStyle.featureCardFont}>Microsoft 365, Google Docs, and other generative AI tools learn from your data. Configuration errors may occur even though they provide various configuration options for protecting sensitive information. It is vital to refrain from entering sensitive information into those AI tools to avoid the risks of such data being used as training data and disclosed to third parties. With BSafes, since your device encrypts all your data before sending it to the server, it can not learn from obscured data..</p>
                                        </Col>
                                    </Row>
                                </Container>
                            </div>
                        </Col>
                    </Row>
                    <br />
                    <br />
                    <Row>
                        <Col xs={12} md={{span:10, offset:1}} xl={{span:8, offset:2}}>
                            <h1 className='text-center display-1' style={{ fontWeight: '450', color: 'black' }}>Secure by Design. Secure by Default.</h1>
                        </Col>
                    </Row>
                    <Row className={BSafesStyle.descriptionRow}>
                        <Col xs={12} md={{span:10, offset:1}} xl={{span:8, offset:2}}>
                            <p className={BSafesStyle.descriptionText}>We designed BSafes for data privacy and security from the start. Your device encrypts all your data with a secret key known only to you and then sends the obscured data to the server. Because no one else has the key, nobody could learn your data, not even BSafes. BSafes adopts Zero-Trust & Zero-Knowledge principles.</p>
                            <p style={{ fontSize: "1.6rem" }}></p>
                            <p style={{ fontSize: "1.6rem" }}>2FA included.</p>
                            <h2><Badge pill bg="warning">Coming soon</Badge></h2>
                        </Col>
                    </Row>
                    <Row >
                        <Col md={12}>
                            <div className={BSafesStyle.featureCard}>
                                <Container>
                                    <Row style={{ paddingTop: '0px' }}>
                                        <Col xs={12} md={6} className={BSafesStyle.featureCardText}>
                                            <h1 className={BSafesStyle.featureCardTitle}>Start with a page</h1>
                                            <p className={BSafesStyle.featureCardFont}>You could write and embed videos and photos with a secure, rich-text editor. In addition, you could create a video gallery and a photo gallery, as well as add attachments. Your device encrypts and then backs up everything.</p>
                                        </Col>
                                        <Col xs={12} md={6} className={BSafesStyle.featureCardImage}>
                                            <Image className={BSafesStyle.featureCardNormalImage} src='/images/feature_startAPage.png'></Image>
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
                                        <Col xs={12} md={6} className={BSafesStyle.featureCardImageTop}>
                                            <Image className={BSafesStyle.featureCardNormalImage} src='/images/feature_oneClick.png'></Image>
                                        </Col>
                                        <Col xs={12} md={6} className={BSafesStyle.featureCardText}>
                                            <h1 className={BSafesStyle.featureCardTitle}>One-Click Encrypt & Back Up</h1>
                                            <p className={BSafesStyle.featureCardFont}>After writing, with one click, your device automatically encrypts and backs up your data to the server. Because the server receives the obscured data encrypted by a key known only to you, no one can see your data.</p>
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
                                        <Col xs={12} className={BSafesStyle.featureCardText}>
                                            <h1 className={BSafesStyle.featureCardTitle}>Drag-and-Drop Videos, Photos and Attachment</h1>
                                            <p className={BSafesStyle.featureCardFont}>Effortlessly add visual-rich content to your writing and a record. Your device encrypts all media and uploads to the server.</p>
                                            <Image className={BSafesStyle.featureCardNormalImage} src='/images/LoveMacbook.png'></Image>
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
                                        <Col xs={12} md={6}>
                                            <Image className={BSafesStyle.featureCardIcon} src='/images/icon_thunder.png'></Image>
                                        </Col>
                                        <Col xs={12} md={6} className={BSafesStyle.featureCardText}>
                                            <h1 className={BSafesStyle.featureCardTitle}>More productive than a secure storage solution</h1>
                                            <p className={BSafesStyle.featureCardFont}>{`You don't have to write with a word processor, encrypt the document, and then upload it to cloud storage in separate steps. BSafes enables you to create content with visual-rich media. Your content is encrypted and backed up to a secure cloud storage with one click. It is much quicker to update your writing because you don't have to download, edit, and then upload again.`}</p>
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
                                        <Col xs={12} className={BSafesStyle.featureCardText}>
                                            <h1 className={BSafesStyle.featureCardTitle}>A Clean Space for Your Contents</h1>
                                            <p className={BSafesStyle.featureCardFont}>Add additional pages, notebooks, and diaries. Use boxes and folders to organize them. Search for a particular item efficiently. A clean workspace boosts your productivity.</p>
                                            <Image className={BSafesStyle.featureCardNormalImage} src='/images/personalSpaceIPad.png'></Image>
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
                                        <Col xs={12} className={BSafesStyle.featureCardText}>
                                            <h1 className={BSafesStyle.featureCardTitle}>About Us</h1>
                                            <p className={BSafesStyle.featureCardFont}>We started the BSafes project after a confidential record became Google searchable due to misconfiguration in a cloud service. It costs efforts to fix the issue and clear the online footprint of the leaked information.</p>
                                            <p className={BSafesStyle.featureCardFont}>We loved the convenience of cloud services but felt we needed the most robust security controls possible to protect our confidential records, including videos, photos, documents, or any files. We searched for services to fit our needs. The closest solution is end-to-end encrypted cloud storage, such as Tresorit and Mega.</p>
                                            <p className={BSafesStyle.featureCardFont}>End-to-end encrypted cloud storage is secure because, by default, user devices encrypt a file before sending it to the server. The server receives obscured data, and nobody can learn from it. However, to update a single piece of information in a record, we had to download the file, edit it with a separate word processor, save the work, and then upload it to the server in different steps. And it was challenging and time-consuming to do on a mobile device. Therefore, we set out to develop our solution - BSafes.</p>
                                            <p className={BSafesStyle.featureCardFont}>In 2017, BSafes was born, and it met our goals -</p>
                                            <ul>
                                                <li>It must be end-to-end encrypted;</li>
                                                <li>It must work on any device - a computer(Windows, Mac, Linux), a phone or a tablet(IOS, Android);</li>
                                                <li>It must feature a rich-text editor for us to update a record easily;</li>
                                                <li>It must allow us to easily add videos, photos, documents, and any files to a record. A video file size could be 10 GB or more and should be playable before downloading the whole video.</li>
                                                <li>It must allow us to search for a record by title or tags;</li>
                                                <li>It must be intuitive, offering a seamless experience over physical and online workspaces. It must provide pages, notebooks, diaries, folders, and boxes for content management.</li>
                                                <li>{`It must retain a record's revision history;`}</li>
                                                <li>The backend infrastructure must be reliable and scalable;</li>
                                            </ul>
                                            <Image className={BSafesStyle.featureCardNormalImage} style={{width:"30%"}} src='/images/team_small.png'></Image>
                                        </Col>
                                    </Row>
                                </Container>
                            </div>
                        </Col>
                    </Row>
                    <br />
                </Container>
            </div>
            <Container className={monteserrat.className}>
                <Row>
                    <Col className='text-center'>
                        <p className={BSafesStyle.footerText}>© 2020 Wu-Nan Technology Inc.</p>
                        <p>Registered office: 16192 Coastal Highway, Lewes, Delaware 19958</p>
                    </Col>
                </Row>
            </Container>
        </ContentPageLayout>
    )
}