import { useEffect, useRef, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useRouter } from "next/router";

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

export default function AboutUs() {
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
                <Row hidden className={BSafesStyle.descriptionRow}>
                    <Col xs={12} md={{span:10, offset:1}} xl={{span:8, offset:2}}>
                        <h2>We respect your privacy! </h2>
                        <p>Your device encrypts all your data before sending it to the server so no one can learn your content, not even BSafes.</p>
                    </Col>
                </Row>
                <br/>
                <Row className={BSafesStyle.descriptionRow}>
                    <Col xs={12} md={{span:10, offset:1}} xl={{span:8, offset:2}}>
                        <h1 className='display-1 text-center'>About Us</h1>
                    </Col>
                </Row>
                <br />
                <Row className={BSafesStyle.descriptionRow}>
                    <Col xs={12} md={{span:10, offset:1}} xl={{span:8, offset:2}}>
                        <p>{`Wu-Nan Technology was founded by two Taiwanese immigrants with over ten years of combined experience in the US defense and networking industries. Together with engineers in France and India, they developed BSafes, an end-to-end encrypted writing and record-keeping platform.`}</p>
                        <p>{`We started the BSafes project after a confidential record was made searchable on Google due to a misconfiguration in a cloud service. Resolving the issue and removing the leaked information online took a lot of effort. `}</p>
                        <p>{`Then, we searched for a cloud service that could provide convenience and strong security controls to protect our confidential records, such as videos, photos, documents, and other files. After extensive research, we discovered that end-to-end encrypted cloud storage options, such as Tresorit and Mega, were the most suitable solutions for our needs.`}</p>
                        <p>{`End-to-end encrypted cloud storage is secure because the users' devices encrypt a file before sending it to the server. The server receives obscured data, which no one can access. However, updating a single piece of information in a record was previously a time-consuming process that required users to download the file, edit it using a separate word processor, save the work, and then upload it to the server in different steps. This process was even more challenging to do on a mobile device. To make things easier and more efficient, we developed a solution called BSafes. `}</p>
                        <p>{`In 2017, we successfully launched BSafes, which met our goals -`}</p>
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
                    </Col>
                </Row>
            </Container>
            <Footer />
            <br/>
        </ContentPageLayout>
    )
}