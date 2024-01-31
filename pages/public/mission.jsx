import { useEffect, useRef, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useRouter } from "next/router";

import Container from 'react-bootstrap/Container'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Image from 'react-bootstrap/Image';

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

export default function Mission() {
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
            <Container className={monteserrat.className} style={{color: 'black' }}>
                <br />
                <Image className={BSafesStyle.featureCardNormalImage} style={{width:"30%"}} src='/images/dataProtection_small.png'></Image>
                <br/>
                <Row className={BSafesStyle.descriptionRow}>
                    <Col xs={12} md={{span:10, offset:1}} xl={{span:8, offset:2}}>
                        <h1 className='display-1 text-center'>Mission</h1>
                    </Col>
                </Row>
                <br />
                <Row className={BSafesStyle.descriptionRow}>
                    <Col xs={12} md={{span:10, offset:1}} xl={{span:8, offset:2}}>
                        <p>{`At our core, we believe that privacy is a fundamental human right. That's why we are fully committed to safeguarding your data privacy and security while ensuring that you remain productive. You can rest assured that your information is in good hands with us.`}</p>
                    </Col>
                </Row>
            </Container>
            <Footer />
            <br/>
        </ContentPageLayout>
    )
}