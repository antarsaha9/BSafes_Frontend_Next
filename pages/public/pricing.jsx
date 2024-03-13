import { useEffect, useRef, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useRouter } from "next/router";
import Link from 'next/link';

import Container from 'react-bootstrap/Container'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Image from 'react-bootstrap/Image';
import Table from 'react-bootstrap/Table';

import { Inter, Roboto_Mono, Montserrat, Orbitron, Tourney, Oswald } from 'next/font/google'

import BSafesStyle from '../../styles/BSafes.module.css'

import ContentPageLayout from '../../components/layouts/contentPageLayout';
import Footer from '../../components/footer';

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

export default function Pricing() {
    const debugOn = false;
    const router = useRouter();

    const isLoggedIn = useSelector(state => state.auth.isLoggedIn);

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
            <Container className={monteserrat.className} style={{ color: 'black' }}>
                <br />
                <Image className={BSafesStyle.featureCardNormalImage} style={{ width: "30%" }} src='/images/dataProtection_small.png'></Image>
                <Row hidden className={BSafesStyle.descriptionRow}>
                    <Col xs={12} md={{ span: 10, offset: 1 }} xl={{ span: 8, offset: 2 }}>
                        <h2>We respect your privacy! </h2>
                        <p>Your device encrypts all your data before sending it to the server so no one can learn your content, not even BSafes.</p>
                    </Col>
                </Row>
                <br />
                <Row className={BSafesStyle.descriptionRow}>
                    <Col xs={12} md={{ span: 10, offset: 1 }} xl={{ span: 8, offset: 2 }}>
                        <h1 className='display-1 text-center'>Pricing</h1>
                    </Col>
                </Row>
                <br />
                <br />
                <Row className={BSafesStyle.descriptionRow}>
                    <Col xs={12} md={{ span: 10, offset: 1 }} xl={{ span: 8, offset: 2 }}>
                        <Row>
                            <Col xs={12} style={{ position: 'relative', left: '0px', top: '0px', zIndex: '500' }}>
                                    <div className={BSafesStyle.saleBadges}>
                                        <p>
                                            <span className={BSafesStyle.saleFirstLine}>50GB</span><br />
                                            <span className={BSafesStyle.saleSecondLine}>$2.95</span><br />
                                            <span className={BSafesStyle.saleThirdLine}>PER MONTH</span><br />
                                            <span className={BSafesStyle.saleForthLine}>30-day free trial</span><br />
                                            <span className={BSafesStyle.saleFifthLine}>Try Now! <i className="fa fa-arrow-right" aria-hidden="true"></i></span>
                                        </p>
                                    </div>
                            </Col>
                        </Row>
                    </Col>
                </Row>
                <br />
                <Row>
                    <Col xs={12} md={{ span: 10, offset: 1 }} xl={{ span: 8, offset: 2 }}>
                        <p>You only pay for the storage you need, yet still enjoy all features.</p>
                    </Col>
                </Row>
                <Row>
                    <Col xs={12} md={{ span: 10, offset: 1 }} xl={{ span: 8, offset: 2 }}>
                        <Table striped bordered hover>
                            <thead>
                                <tr>
                                    <th>Storage Size</th>
                                    <th>Price (USD)</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>50GB</td>
                                    <td>$2.95</td>
                                </tr>
                                <tr>
                                    <td>200GB</td>
                                    <td>$4.95</td>
                                </tr>
                                <tr>
                                    <td>500GB</td>
                                    <td>$9.95</td>
                                </tr>
                                <tr>
                                    <td>1TB</td>
                                    <td>$19.95</td>
                                </tr>
                                <tr>
                                    <td>2TB</td>
                                    <td>$34.95</td>
                                </tr>
                                <tr>
                                    <td>3TB</td>
                                    <td>$49.95</td>
                                </tr>
                                <tr>
                                    <td>Extra TB</td>
                                    <td>$15.00</td>
                                </tr>
                            </tbody>
                        </Table>
                    </Col>
                </Row>
            </Container>
            <Footer />
            <br />
        </ContentPageLayout>
    )
}