import { useEffect, useRef, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useRouter } from "next/router";
import Link from 'next/link';

import Container from 'react-bootstrap/Container'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Image from 'react-bootstrap/Image';

import { Montserrat} from 'next/font/google'

import BSafesStyle from '../../styles/BSafes.module.css'

import ContentPageLayout from '../../components/layouts/contentPageLayout';
import Footer from '../../components/footer';


export const monteserrat = Montserrat({
    subsets: ['latin'],
    display: 'swap',
})

export default function License() {
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
                <Image className={BSafesStyle.featureCardNormalImage} style={{width:"30%"}} src='/images/license_320.png'></Image>
                <br/>
                <Row className={BSafesStyle.descriptionRow}>
                    <Col xs={12} md={{span:10, offset:1}} xl={{span:8, offset:2}}>
                        <h1 className='display-1 text-center'>Licenses</h1>
                    </Col>
                </Row>
                <br />
                <Row className={BSafesStyle.descriptionRow}>
                    <Col xs={12} md={{span:10, offset:1}} xl={{span:8, offset:2}}>
                        <p>{`On the BSafes website, we use the following photos and images under CC licenses -`}</p>
                        <ul>
                            <li><Link href='https://open.oregonstate.education/aandp/back-matter/creative-commons-license/'>'ANATOMY & PHYSIOLOGY'</Link> by Lindsay M. Biga, Sierra Dawson, Amy Harwell, Robin Hopkins, Joel Kaufmann, Mike LeMaster, Philip Matern, Katie Morrison-Graham, Devon Quick & Jon Runyeon under CC BY-SA </li>
                            <li><Link href='https://www.pexels.com/photo/photo-of-people-holding-hands-3228734/'>Photo Of People Holding Hands</Link> by Fauxels</li>
                            <li><Link href='https://www.pexels.com/video/couple-sweet-moments-together-4873472/'>Video, Couple Sweet Moments Together</Link> by Vlada Karpovich</li>
                            <li><Link href='https://www.pexels.com/photo/a-couple-hugging-at-the-beach-14106978/'>Photo, A Couple Hugging at the Beach</Link> by Edward Eyer</li>
                            <li><Link href='https://www.pexels.com/video/close-up-view-of-a-person-holding-his-mastercard-4873111/'>Video, Close-Up View of a Person Holding His Mastercard</Link> by Tima Miroshnichenko</li>
                            <li><Link href='https://www.pexels.com/photo/close-up-photography-two-brown-cards-259200/'>Photo, A Couple Hugging at the Beach</Link> by Pixabay</li>
                            <li><Link href='https://www.pexels.com/video/a-pregnant-woman-having-her-medical-check-up-7089940/'>Video, A Pregnant Woman Having Her Medical Check-up</Link> by MART PRODUCTION</li>
                            <li><Link href='https://www.pexels.com/photo/technology-computer-health-hospital-7089623/'>Photo, Ultrasound</Link> by MART PRODUCTION</li>
                        </ul>
                    </Col>
                </Row>
            </Container>
            <Footer />
            <br/>
        </ContentPageLayout>
    )
}