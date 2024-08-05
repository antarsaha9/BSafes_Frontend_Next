import { useEffect, useRef, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useRouter } from "next/router";

import Container from 'react-bootstrap/Container'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Image from 'react-bootstrap/Image';

import { Montserrat } from 'next/font/google'

import BSafesStyle from '../../styles/BSafes.module.css'
import PrivacyPolicyContent from '../../components/privacyPolicyContent';
import ContentPageLayout from '../../components/layouts/contentPageLayout';
import Footer from '../../components/footer';

export const monteserrat = Montserrat({
    subsets: ['latin'],
    display: 'swap',
})

export default function PrivacyPolicy() {
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
                <PrivacyPolicyContent/>
            </Container>
            <Footer />
            <br/>
        </ContentPageLayout>
    )
}