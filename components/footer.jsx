import Link from 'next/link'
import Image from 'next/image'

import Container from 'react-bootstrap/Container'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'

import { Montserrat } from 'next/font/google'

export const monteserrat = Montserrat({
    subsets: ['latin'],
    display: 'swap',
})

import BSafesStyle from '../styles/BSafes.module.css'

export default function Footer() {
    return (
        <div style={{ backgroundColor: 'white', borderTop: 'solid' }}>
            <Container className={monteserrat.className}>
                <br />
                <Row>
                    <Col className='text-center'>
                        <p className={BSafesStyle.footerText}>© 2024 Wu-Nan Technology Inc.</p>
                        <p>Registered office: 16192 Coastal Highway, Lewes, Delaware 19958</p>
                    </Col>
                </Row>
                <Row>
                    <Col className='text-center'>
                        <Link className={BSafesStyle.footerSmallText} href="/public/privacyPolicy">Privacy Policy</Link>&nbsp;&nbsp;
                        <Link className={BSafesStyle.footerSmallText} href="/public/termsOfService">Terms of Service</Link>
                    </Col>
                </Row>
                <Row>
                    <Col className='text-center'>
                        <span className={BSafesStyle.footerSmallText}>{`BSafes only uses strictly necessary cookies when you need customer support & payment service. We don't track your other activities.`}</span>
                    </Col>
                </Row>
                <Link href="https://support.bsafes.com">
                    <img src="/images/supportIcon_120.png" className={BSafesStyle.supportButton} />
                </Link>
            </Container>
        </div>
    )
}