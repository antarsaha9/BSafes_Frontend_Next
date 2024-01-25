import Link from 'next/link'

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
        <Container className={monteserrat.className}>
            <Row>
                <Col className='text-center'>
                    <p className={BSafesStyle.footerText}>© 2024 Wu-Nan Technology Inc.</p>
                    <p>Registered office: 16192 Coastal Highway, Lewes, Delaware 19958</p>
                </Col>
            </Row>
            <Row>
                <Col className='text-center'>
                    <Link href="/public/privacyPolicy">Privacy Policy</Link>&nbsp;&nbsp;
                    <Link href="/public/termsOfService">Terms of Service</Link>
                </Col>
            </Row>
        </Container>
    )
}