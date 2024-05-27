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
import Accordion from 'react-bootstrap/Accordion';
import Table from 'react-bootstrap/Table';


import { Montserrat, Tourney, Oswald, Tilt_Warp, Outfit } from 'next/font/google'

import BSafesStyle from '../styles/BSafes.module.css'

import { debugLog } from '../lib/helper'

import ContentPageLayout from '../components/layouts/contentPageLayout';
import Footer from '../components/footer';
import DialerLock from '../components/dialerLock/dialerLock';
import ComplianceBadge from '../components/complianceBadge';

import { logInAsyncThunk } from '../reduxStore/auth'

export const monteserrat = Montserrat({
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

export const tiltWarp = Tilt_Warp({
    subsets: ['latin'],
    display: 'swap',
})

export const bannerFont = Outfit({
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
            <div style={{ height: '1px', backgroundColor: 'Grey' }}>
            </div>
            <div>
                <br />
                <Container>
                    <Row>
                        <Col xs={12} md={{ span: 10, offset: 1 }} xl={{ span: 8, offset: 2 }}>
                            <img className='mx-auto d-block' src="/images/mySafe_Small.png" />
                            <div className="text-center">
                                <Button variant='danger' size='sm' onClick={handleUnlock}>TRY ME <i className="fa fa-arrow-right" aria-hidden="true"></i></Button>
                            </div>
                            <h1 className={`fw-bold text-center m-0 ${tourney.className}`} style={{ fontSize: '5.0rem' }}>🎉 Bit Safes</h1>
                            <div className={`${monteserrat.className} ${BSafesStyle.descriptionRow}`}>
                                <h5 className='fw-light text-center m-0'>with AES-256 End-to-End Encryption.</h5>
                                <div hidden className={BSafesStyle.ribbonBannerRight}>Powered by <span style={{ fontSize: '24px' }}>15-Million-Download-Per-Week, Open-Source Forge Crypto</span> Module.</div>
                                <p className='text-center m-0' style={{ fontSize: '0.8rem' }}><span style={{ fontSize: '1.6rem' }}>🌎</span></p>
                                <p className='text-center m-0' style={{ fontSize: '0.8rem' }}>Global Privacy Infrastructure with Secure Data Centers in US, Canada, UK, France, Netherlands, Germany, Australia, Japan, and Singapore.</p>
                                <p className='text-center m-0' style={{ fontSize: '0.8rem' }}><span style={{ borderBottom: 'solid', borderWidth: '1px', borderColor: '#5499C7' }}>Software made in USA, Taiwan, France & India. Since 2017</span></p>
                            </div>
                            <div className={bannerFont.className} style={{ padding: '10px', color: 'black' }}>
                                <h1 className={BSafesStyle.bannerTextH1} style={{ fontWeight: '900', borderLeft: 'solid', borderWidth: '12px', borderColor: '#7D3C98', paddingLeft: '12px' }}>Protecting <span style={{ backgroundColor: 'yellow' }}>Sensitive Information</span> in an <span style={{ backgroundColor: 'orange' }}>AI-Driven World</span></h1>
                            </div>
                        </Col>
                    </Row>
                </Container>
            </div>
            <div className={`fw-bold text-center m-0 ${monteserrat.className} ${BSafesStyle.ribbonBannerRight}`} style={{ fontStyle: 'italic' }}><span hidden style={{ color: '#DFFF00' }}>Boost Privacy & Productivity - </span> Write, Add Media, Encrypt, and Backup. <span style={{ color: 'yellow' }}>BSafes Makes it Simple!</span>&nbsp;</div>
            <div className={`fw-bold text-center m-0 ${monteserrat.className} ${BSafesStyle.ribbonBanner}`} style={{ fontStyle: 'italic' }}>Any Device, <span style={{ color: '#DFFF00' }}>Any Media</span>, Anytime, Anywhere</div>
            <div className='mt-3 mb-3 text-center'>
                <h1 style={{ fontSize: '48px' }}>📖</h1>
                <Link href='https://support.bsafes.com/category/get-started' target='_blank' style={{ textDecoration: 'none', fontSize: '1.0rem', backgroundColor: '#006bce', color: 'white', padding: '10px', position: 'relative', zIndex: '1000' }}>Get Started Guide <i className="fa fa-arrow-right" aria-hidden="true"></i></Link>
            </div>
            <div className={BSafesStyle.carouselRow}>
                <Carousel data-bs-theme="dark">
                    <Carousel.Item interval={3000}>
                        <div className={BSafesStyle.previewImageLove}>

                        </div>
                    </Carousel.Item>
                    <Carousel.Item interval={3000}>
                        <div className={BSafesStyle.previewImageFinance}>
                        </div>
                    </Carousel.Item>
                    <Carousel.Item interval={3000}>
                        <div className={BSafesStyle.previewImageDoctorVisit}>
                        </div>
                    </Carousel.Item>
                </Carousel>
            </div>
            <p className={`text-center ${monteserrat.className}`}>Actual Screenshots</p>
            <div className='text-center'>
                <Link className='text-center' href='/public/licenses' target='_blank' style={{ textDecoration: 'none' }}>Licenses</Link>
                <span> | </span>
                <Link className='text-center' href='/public/screenshots' target='_blank' style={{ textDecoration: 'none' }}>See More Screenshots ...</Link>
            </div>
            <br />
            <div className={BSafesStyle.serviceIntroBackground} style={{ topB: 'solid' }}>
                <br />
                <Container>
                    <Row className={`${BSafesStyle.descriptionRow} ${monteserrat.className}`}>
                        <Col xs={12} md={{ span: 10, offset: 1 }} xl={{ span: 8, offset: 2 }}>
                            <h3 className='text-center display-3' style={{ fontWeight: '450', color: 'black' }}>Write, Add Media, and <span style={{ backgroundColor: 'yellow', color: 'black', padding: '3px' }}>One-Click</span> <span style={{ backgroundColor: 'red', color: 'white', padding: '3px' }}>Encryption+Backup</span></h3>
                            <p className={BSafesStyle.descriptionText}>BSafes is an end-to-end encrypted platform for writing, record keeping, and secure storage of visual-rich media and any files. No one else can see your data, including BSafes staff and server machines.</p>
                            <h2 hidden><Badge pill bg="warning">Coming soon</Badge></h2>
                        </Col>
                    </Row>
                </Container>
                <br />
                <Container>
                    <Row className={`${monteserrat.className} ${BSafesStyle.descriptionRow}`}>
                        <Col xs={12} md={{ span: 10, offset: 1 }} xl={{ span: 8, offset: 2 }}>
                            <h3 className='text-center display-6' style={{ fontWeight: '450', color: 'black' }}>Your <span style={{ textDecoration: 'underline yellow', textDecorationThickness: '10px' }}>Private Story</span> Deserves Absolution Protection</h3>
                            <p style={{ color: 'black' }}><span style={{ fontSize: '2rem' }}> 🛁 </span>Rest assured that your information is fully encrypted and secure. From your relationships to your finance, health, family, and business, all of your data is protected end-to-end. You can trust that your privacy is our top priority.</p>
                        </Col>
                    </Row>
                    <br />
                    <Row className={`${monteserrat.className} ${BSafesStyle.descriptionRow}`}>
                        <Col xs={12} md={{ span: 10, offset: 1 }} xl={{ span: 8, offset: 2 }}>
                            <h3 className='text-center display-5' style={{ fontWeight: '450', color: 'black' }}>Simplicity & Productivity</h3>
                            <p style={{ color: 'black' }}><span style={{ fontSize: '2rem' }}> 📝 📺 📷 </span> Consolidate all relevant text, videos, images, and files on the same page for streamlined access and efficient organization.</p>
                        </Col>
                    </Row>
                    <Row className={`${monteserrat.className} ${BSafesStyle.descriptionRow}`}>
                        <Col xs={12} md={{ span: 10, offset: 1 }} xl={{ span: 8, offset: 2 }}>
                            <Accordion defaultActiveKey="1">
                                <Accordion.Item eventKey="0">
                                    <Accordion.Header>Specification</Accordion.Header>
                                    <Accordion.Body>
                                        <Table striped bordered hover size="sm">
                                            <thead>
                                                <tr>
                                                    <th>#</th>
                                                    <th>Feature</th>
                                                    <th></th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                <tr>
                                                    <td>✦</td>
                                                    <td>End-to-End Encryption</td>
                                                    <td>✅</td>
                                                </tr>
                                                <tr>
                                                    <td>✦</td>
                                                    <td>More than Storage</td>
                                                    <td>✅ Write, Add Media, Encrypt & Backup</td>
                                                </tr>
                                                <tr>
                                                    <td>✦</td>
                                                    <td>Rich Text Editor</td>
                                                    <td>✅</td>
                                                </tr>
                                                <tr>
                                                    <td>✦</td>
                                                    <td>Upload and Embed Media in Text</td>
                                                    <td>✅</td>
                                                </tr>
                                                <tr>
                                                    <td>✦</td>
                                                    <td>Upload Images</td>
                                                    <td>✅</td>
                                                </tr>
                                                <tr>
                                                    <td>✦</td>
                                                    <td>Upload Videos</td>
                                                    <td>✅</td>
                                                </tr>
                                                <tr>
                                                    <td>✦</td>
                                                    <td>Video Playback Without a Full Download</td>
                                                    <td>✅  Short Buffering Time.</td>
                                                </tr>
                                                <tr>
                                                    <td>✦</td>
                                                    <td>Video Seeking</td>
                                                    <td>✅  Short Buffering Time.</td>
                                                </tr>
                                                <tr>
                                                    <td>✦</td>
                                                    <td>Video Gallery</td>
                                                    <td>✅</td>
                                                </tr>
                                                <tr>
                                                    <td>✦</td>
                                                    <td>Image Gallery</td>
                                                    <td>✅</td>
                                                </tr>
                                                <tr>
                                                    <td>✦</td>
                                                    <td>Attach Files</td>
                                                    <td>✅</td>
                                                </tr>
                                                <tr>
                                                    <td>✦</td>
                                                    <td>Video and File Size</td>
                                                    <td>{`10GB and More, Bound by Your Device's Storage.`}</td>
                                                </tr>
                                                <tr>
                                                    <td>✦</td>
                                                    <td>Tags</td>
                                                    <td>✅</td>
                                                </tr>
                                                <tr>
                                                    <td>✦</td>
                                                    <td>Search</td>
                                                    <td>By Tags and Titles</td>
                                                </tr>
                                                <tr>
                                                    <td>✦</td>
                                                    <td>More than Files and Folders</td>
                                                    <td>✅</td>
                                                </tr>
                                                <tr>
                                                    <td>✦</td>
                                                    <td>Page</td>
                                                    <td>✅</td>
                                                </tr>
                                                <tr>
                                                    <td>✦</td>
                                                    <td>Folder</td>
                                                    <td>✅</td>
                                                </tr>
                                                <tr>
                                                    <td>✦</td>
                                                    <td>Notebook</td>
                                                    <td>✅</td>
                                                </tr>
                                                <tr>
                                                    <td>✦</td>
                                                    <td>Diary</td>
                                                    <td>✅</td>
                                                </tr>
                                                <tr>
                                                    <td>✦</td>
                                                    <td>Box</td>
                                                    <td>✅</td>
                                                </tr>
                                                <tr>
                                                    <td>✦</td>
                                                    <td>Any Item in Box</td>
                                                    <td>✅</td>
                                                </tr>
                                                <tr>
                                                    <td>✦</td>
                                                    <td>Box in Box</td>
                                                    <td>✅</td>
                                                </tr>
                                                <tr>
                                                    <td>✦</td>
                                                    <td>Workspace</td>
                                                    <td>✅</td>
                                                </tr>
                                                <tr>
                                                    <td>✦</td>
                                                    <td>Key Derivation</td>
                                                    <td>Argon2id</td>
                                                </tr>
                                                <tr>
                                                    <td>✦</td>
                                                    <td>Client-Side Encryption</td>
                                                    <td>✅</td>
                                                </tr>
                                                <tr>
                                                    <td>✦</td>
                                                    <td>Encryption in Transit</td>
                                                    <td>✅</td>
                                                </tr>
                                                <tr>
                                                    <td>✦</td>
                                                    <td>Encryption at Rest</td>
                                                    <td>✅</td>
                                                </tr>
                                                <tr>
                                                    <td>✦</td>
                                                    <td>Encryption Alogrithm</td>
                                                    <td>AES-256-GCM</td>
                                                </tr>
                                                <tr>
                                                    <td>✦</td>
                                                    <td>Storage Size</td>
                                                    <td>Unlimted, Pay by Required Storage.</td>
                                                </tr>
                                                <tr>
                                                    <td>✦</td>
                                                    <td>Revision History</td>
                                                    <td>✅</td>
                                                </tr>
                                                <tr>
                                                    <td>✦</td>
                                                    <td>Data Centers</td>
                                                    <td>US, Canada, UK, France, Netherlands, Germany, Australia, Japan, and Singapore.</td>
                                                </tr>
                                            </tbody>
                                        </Table>
                                    </Accordion.Body>
                                </Accordion.Item>
                            </Accordion>
                        </Col>
                    </Row>
                </Container>
                <br />
                <div className="text-center">
                    <Button variant='danger' onClick={handleUnlock}>TRY ME <i className="fa fa-arrow-right" aria-hidden="true"></i></Button>
                </div>
                <br />
            </div>
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
                                            <p className={BSafesStyle.featureCardFont}>AI-powered tools learn from your data, but can also pose a risk to sensitive information. BSafes encrypts your data on your device before sending it to the server, making it extremely difficult, if not impossible, for anyone else to learn from obscured data.</p>
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
                            {true && <DialerLock size={120} fontSize={0.6} triangleSize={3} className='text-center' />}
                        </Col>
                    </Row>
                    <br />
                    <Row>
                        <Col xs={12} md={{ span: 10, offset: 1 }} xl={{ span: 8, offset: 2 }}>
                            <h1 className='text-center display-1' style={{ fontWeight: '450', color: 'black' }}>Privacy & Security by Design & by Default.</h1>
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
                            <div className={BSafesStyle.featureCard} style={{ backgroundColor: '#D6EAF8' }}>
                                <Container>
                                    <Row style={{ paddingTop: '0px' }}>
                                        <Col xs={12} md={6}>
                                            <div className={BSafesStyle.featureCardIconAndText}>
                                                <ComplianceBadge />
                                            </div>
                                        </Col>
                                        <Col xs={12} md={6} className={BSafesStyle.featureCardText}>
                                            <h1 className={BSafesStyle.featureCardTitle}>Regulatory Compliance</h1>
                                            <p className={BSafesStyle.featureCardFont}>{`BSafes is compliant with global data privacy and security regulations such as GDPR, CCPA, HIPAA, PCI, and HITECH, thanks to its end-to-end encryption.`}</p>
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
                                        <Col xs={12} md={6} className={BSafesStyle.featureCardText}>
                                            <h1 className={BSafesStyle.featureCardTitle}>Start with a page</h1>
                                            <p className={BSafesStyle.featureCardFont}>To secure sensitive content, create a page. You can write, add videos, photos, and any files. Everything is encrypted and backed up by your device.</p>
                                            <Link href='https://support.bsafes.com/article/start' target='_blank'>Details</Link>
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
                                            <h1 className={BSafesStyle.featureCardTitle}>Drag-and-Drop Videos, Photos and any Files</h1>
                                            <p className={BSafesStyle.featureCardFont}>{`Uploading visual content is very simple. All media is encrypted before being uploaded to the server. There are virtually no limits on file size; it is only bound by your device's storage. You can easily view the video later on any device without the need for a full download.`}</p>
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
                            <div className={BSafesStyle.featureCard} style={{ backgroundColor: '#F5EEF8' }}>
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
                                            <p className={BSafesStyle.featureCardFont}><span style={{ fontSize: '2rem' }}> 📋 📔 🗓️ 📁 🗃️ </span>Add new pages, notebooks, or diaries in boxes or folders to efficiently search for items. A clean workspace improves productivity.</p>
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
                                        <span className={BSafesStyle.saleFirstLine}>20GB</span><br />
                                        <span className={BSafesStyle.saleSecondLine}>$2.99</span><br />
                                        <span className={BSafesStyle.saleThirdLine}>PER MONTH</span><br />
                                        <span className={BSafesStyle.saleForthLine}>30-day free trial</span><br />
                                        <span className={BSafesStyle.saleFifthLine}>More Storage <i className="fa fa-arrow-right" aria-hidden="true"></i></span>
                                    </p>
                                </div>
                            </Link>
                        </Col>
                    </Row>
                    <br />
                    <br />
                    <div className="text-center">
                        <Button variant='danger' onClick={handleUnlock}>TRY ME <i className="fa fa-arrow-right" aria-hidden="true"></i></Button>
                    </div>
                    <br />
                    <Row id="aboutUs" >
                        <Col md={12}>
                            <div className={BSafesStyle.featureCard} style={{ backgroundColor: '#FDEDEC' }}>
                                <Container>
                                    <Row style={{ paddingTop: '0px' }}>
                                        <Col xs={12} className={BSafesStyle.featureCardText}>
                                            <h1 className={BSafesStyle.featureCardTitle}>About Us</h1>
                                            <p className={BSafesStyle.featureCardFont}>We started the BSafes project after a confidential record was made searchable on Google due to a misconfiguration in a cloud service. Resolving the issue and removing the leaked information online took a lot of effort.</p>
                                            <p className={BSafesStyle.featureCardFont}>Then, we searched for a cloud service that could provide convenience and strong security controls to protect our confidential records, such as videos, photos, documents, and other files. After extensive research, we discovered that end-to-end encrypted cloud storage options, such as Tresorit and Mega, were the most suitable solutions for our needs.</p>
                                            <p className={BSafesStyle.featureCardFont}>{`End-to-end encrypted cloud storage is secure because the users' devices encrypt a file before sending it to the server. The server receives obscured data, which no one can access. However,`} <span>updating a single piece of information in a record was previously a time-consuming process that required users to download the file, edit it using a separate word processor, save the work, and then upload it to the server in different steps. This process was even more challenging to do on a mobile device. To make things easier and more efficient, we developed a solution called BSafes</span></p>
                                            <p className={BSafesStyle.featureCardFont}>In 2017, we successfully launched BSafes, which met our goals -</p>
                                            <ul>
                                                <li>It must be end-to-end encrypted;</li>
                                                <li>It must work on any device - a computer (Windows, Mac, Linux), a phone or a tablet (IOS, Android);</li>
                                                <li>It must feature a rich-text editor for us to update a record easily;</li>
                                                <li>It must allow us to easily add videos, photos, documents, and any files to a record. A video file size could be 10 GB or more and should be playable before downloading the whole video.</li>
                                                <li>It must allow us to search for a record by title or tags;</li>
                                                <li>It must be intuitive, offering a seamless experience over physical and online workspaces. It must provide pages, notebooks, diaries, folders, and boxes for content management.</li>
                                                <li>{`It must retain a record's revision history;`}</li>
                                                <li>The backend infrastructure must be reliable and scalable;</li>
                                            </ul>
                                            <Image className={BSafesStyle.featureCardNormalImage} style={{ width: "30%" }} src='/images/team_320.png'></Image>
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