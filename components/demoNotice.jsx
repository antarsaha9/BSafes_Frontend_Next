import Link from 'next/link'
import Image from 'next/image'

import Container from 'react-bootstrap/Container'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Button from 'react-bootstrap/Button';

import { Montserrat } from 'next/font/google'

export const monteserrat = Montserrat({
    subsets: ['latin'],
    display: 'swap',
})

import BSafesStyle from '../styles/BSafes.module.css'

export default function DemoNotice() {
    return (
        <div style={{ backgroundColor: 'yellow', borderTop: 'solid' }}>
            <Container className={monteserrat.className}>
                <h3>Try it! Write, add photos, videos & attachments!</h3>
                <Button variant='danger' size='sm'>Help</Button>
                <p>Your data is not backed up with this sample!</p>
                <br/>
                <Button variant='danger' size='sm'>Own It!</Button>
            </Container>
        </div>
    )
}