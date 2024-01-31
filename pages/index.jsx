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

import BSafesStyle from '../styles/BSafes.module.css'

import { debugLog } from '../lib/helper'

import ContentPageLayout from '../components/layouts/contentPageLayout';
import Footer from '../components/footer';
import DialerLock from '../components/dialerLock/dialerLock';
import ComplianceBadge from '../components/complianceBadge';

import { logInAsyncThunk } from '../reduxStore/auth'

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
                    </Row>
                </Container>
                <br />
            </div>
            <Container>
                <br />
                <Row className={oswald.className} style={{ color: 'black' }}>
                    <Col xs={12} md={{ span: 10, offset: 1 }} xl={{ span: 8, offset: 2 }}>
                        <h1 className={`${BSafesStyle.bannerTextH1}`}>Protecting Sensitive Information in an AI-Driven World</h1>
                    </Col>
                </Row>
                <Row hidden className={`${monteserrat.className} ${BSafesStyle.descriptionRow}`}>
                    <Col xs={12} md={{ span: 10, offset: 1 }} xl={{ span: 8, offset: 2 }}>
                        <br />
                        <h1 className='display-6'>🗣️  📺  📷  📑</h1>
                        <p className={BSafesStyle.descriptionText}>🔰 BSafes offers a secure writing and record-keeping platform. With AES-256 end-to-end encryption, no one can see your private writings, videos, photos, and files.</p>
                        <h2>🌐 <Badge bg="primary">GDPR</Badge> <Badge bg="primary">CCPA</Badge> <Badge bg="primary">HIPPA</Badge> <Badge bg="primary">HITECH</Badge></h2>
                        <p className={BSafesStyle.descriptionText}>Due to its end-to-end encryption nature, BSafes complies with data privacy and security laws & regulations worldwide, including GDPR, CCPA, HIPPA, and HITECH.</p>
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
                    <Col xs={12} md={{ span: 10, offset: 1 }} xl={{ span: 8, offset: 2 }}>
                        <h1 className='text-center display-1' style={{ fontWeight: '450', color: 'black' }}>Be Bold</h1>
                        <p className={BSafesStyle.descriptionText}>BSafes is an end-to-end encrypted platform for writing, record keeping, and secure storage of visual-rich media and attachments. Keep your creative ideas, privacy, and secrets safe..</p>
                        <h2 hidden><Badge pill bg="warning">Coming soon</Badge></h2>
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
                                            <div className={BSafesStyle.featureCardIconAndText}>
                                                <Image className={BSafesStyle.featureCardNormalIcon} src='/images/icon_noAI.png'></Image>
                                                <p className={`text-center ${BSafesStyle.featureCardTextUnderIcon}`}>For Sensitive Information</p>
                                            </div>
                                        </Col>
                                        <Col xs={12} md={6} className={BSafesStyle.featureCardText}>
                                            <h1 className={BSafesStyle.featureCardTitle}>Generative AI needs lots of data</h1>
                                            <p className={BSafesStyle.featureCardFont}>AI tools like Microsoft 365 and Google Docs learn from your data, but can also pose a risk to sensitive information. BSafes encrypts your data on your device before sending it to the server, making it impossible for the server to learn from obscured data.</p>
                                        </Col>
                                    </Row>
                                </Container>
                            </div>
                        </Col>
                    </Row>
                    <br />
                    <br />
                    <Row>
                        <Col xs={12} md={{ span: 10, offset: 1 }} xl={{ span: 8, offset: 2 }}>
                            <h1 className='text-center display-1' style={{ fontWeight: '450', color: 'black' }}>Secure by Design. Secure by Default.</h1>
                        </Col>
                    </Row>
                    <Row className={BSafesStyle.descriptionRow}>
                        <Col xs={12} md={{ span: 10, offset: 1 }} xl={{ span: 8, offset: 2 }}>
                            <p className={BSafesStyle.descriptionText}>BSafes encrypts your data with a secret key known only to you, and then sends it to the server. No one, not even BSafes, can access your data because only you have the key. This follows the Zero-Trust & Zero-Knowledge principles.</p>
                            <p style={{ fontSize: "1.6rem" }}></p>
                            <p style={{ fontSize: "1.6rem" }}>2FA included.</p>
                            <h2 hidden><Badge pill bg="warning">Coming soon</Badge></h2>
                        </Col>
                    </Row>
                    <Row >
                        <Col md={12}>
                            <div className={BSafesStyle.featureCard} style={{backgroundColor:'#D6EAF8'}}>
                                <Container>
                                    <Row style={{ paddingTop: '0px' }}>
                                        <Col xs={12} md={6}>
                                            <div className={BSafesStyle.featureCardIconAndText}>
                                                <ComplianceBadge />
                                            </div>
                                        </Col>
                                        <Col xs={12} md={6} className={BSafesStyle.featureCardText}>
                                            <h1 className={BSafesStyle.featureCardTitle}>Regulatory Compliance</h1>
                                            <p className={BSafesStyle.featureCardFont}>{`BSafes is compliant with global data privacy and security regulations such as GDPR, CCPA, HIPAA, and HITECH, thanks to its end-to-end encryption.`}</p>
                                        </Col>
                                    </Row>
                                </Container>
                            </div>
                        </Col>
                    </Row>
                    <br/>
                    <Row >
                        <Col md={12}>
                            <div className={BSafesStyle.featureCard}>
                                <Container>
                                    <Row style={{ paddingTop: '0px' }}>
                                        <Col xs={12} md={6} className={BSafesStyle.featureCardText}>
                                            <h1 className={BSafesStyle.featureCardTitle}>Start with a page</h1>
                                            <p className={BSafesStyle.featureCardFont}>To secure sensitive content, create a page. You can add text, videos, photos, and attachments. Everything is encrypted and backed up by your device.</p>
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
                                            <p className={BSafesStyle.featureCardFont}>With just one click, your device automatically encrypts and backs up your data to the server. The server then receives the obscured data, encrypted with a key that only you know, ensuring complete security.</p>
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
                                            <h1 className={BSafesStyle.featureCardTitle}>Drag-and-Drop Videos, Photos and Attachments</h1>
                                            <p className={BSafesStyle.featureCardFont}>Adding visual content is now effortless. All media is encrypted before uploading to the server.</p>
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
                                            <p className={BSafesStyle.featureCardFont}>{`With BSafes, you can create and store content in a single, streamlined process. You don't need to use a separate word processor, encrypt the document, and then upload it to cloud storage. With BSafes, you can create content that includes visual-rich media, with the added security of encryption and backup to a secure cloud storage - all with just one click. Updating your writing is much quicker with BSafes, as you don't have to download, edit, and then upload again.`}</p>
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
                                            <p className={BSafesStyle.featureCardFont}>Add new pages, notebooks, or diaries in boxes or folders to efficiently search for items. A clean workspace improves productivity.</p>
                                            <Image className={BSafesStyle.featureCardNormalImage} src='/images/personalSpaceIPad.png'></Image>
                                        </Col>
                                    </Row>
                                </Container>
                            </div>
                        </Col>
                    </Row>
                    <br />
                    <Row>
                        <Col xs={12} style={{ position: 'relative', left: '0px', top: '0px', zIndex: '500' }}>
                            <Link className={BSafesStyle.noUnderline} href='/public/pricing'>
                                <div className={BSafesStyle.saleBadges}>
                                    <p>
                                        <span className={BSafesStyle.saleFirstLine}>50GB</span><br />
                                        <span className={BSafesStyle.saleSecondLine}>$2.95</span><br />
                                        <span className={BSafesStyle.saleThirdLine}>PER MONTH</span><br />
                                        <span className={BSafesStyle.saleForthLine}>30-day free trial</span><br />
                                        <span className={BSafesStyle.saleFifthLine}>More Storage <i className="fa fa-arrow-right" aria-hidden="true"></i></span>
                                    </p>
                                </div>
                            </Link>
                        </Col>
                    </Row>
                    <Row id="aboutUs" >
                        <Col md={12}>
                            <div className={BSafesStyle.featureCard}>
                                <Container>
                                    <Row style={{ paddingTop: '0px' }}>
                                        <Col xs={12} className={BSafesStyle.featureCardText}>
                                            <h1 className={BSafesStyle.featureCardTitle}>About Us</h1>
                                            <p className={BSafesStyle.featureCardFont}>We started the BSafes project after a confidential record was made searchable on Google due to a misconfiguration in a cloud service. Resolving the issue and removing the leaked information online took a lot of effort.</p>
                                            <p className={BSafesStyle.featureCardFont}>Then, we searched for a cloud service that could provide convenience and strong security controls to protect our confidential records, such as videos, photos, documents, and other files. After extensive research, we discovered that end-to-end encrypted cloud storage options, such as Tresorit and Mega, were the most suitable solutions for our needs.</p>
                                            <p className={BSafesStyle.featureCardFont}>{`End-to-end encrypted cloud storage is secure because the users' devices encrypt a file before sending it to the server. The server receives obscured data, which no one can access. However, updating a single piece of information in a record was previously a time-consuming process that required users to download the file, edit it using a separate word processor, save the work, and then upload it to the server in different steps. This process was even more challenging to do on a mobile device. To make things easier and more efficient, we developed a solution called BSafes.`}</p>
                                            <p className={BSafesStyle.featureCardFont}>In 2017, we successfully launched BSafes, which met our goals -</p>
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
                                            <Image className={BSafesStyle.featureCardNormalImage} style={{ width: "30%" }} src='/images/team_small.png'></Image>
                                        </Col>
                                    </Row>
                                </Container>
                            </div>
                        </Col>
                    </Row>
                    <br />
                </Container>
            </div>
            <Footer />
            <br />
        </ContentPageLayout>
    )
}