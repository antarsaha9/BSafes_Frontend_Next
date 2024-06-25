import { useEffect, useState } from 'react'
import { useRouter } from "next/router";

import Container from 'react-bootstrap/Container'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Card from 'react-bootstrap/Card';
import Button from 'react-bootstrap/Button'
import Form from 'react-bootstrap/Form'
import InputGroup from 'react-bootstrap/InputGroup'
import Modal from 'react-bootstrap/Modal';

import { Montserrat } from 'next/font/google'

export const monteserrat = Montserrat({
    subsets: ['latin'],
    display: 'swap',
})

import ContentPageLayout from '../../components/layouts/contentPageLayout';

export default function BSafes() {
    const router = useRouter();

    const handleGo = () => {
        router.push("/logIn");
    }

    useEffect(() => {
    }, [])

    return (
        <ContentPageLayout showNaveBar={false} showNavbarMenu={false} showPathRow={false}>
            <br />
            <Container className={`${monteserrat.className}`}>
                <Row className='fixed-bottom'>
                    <Col className='text-center'>
                        <p>Be Aware of Your Surroundings.</p>
                        <Button variant='light' size='sm' onClick={handleGo}>Go</Button>
                    </Col>
                </Row>
            </Container>
        </ContentPageLayout>
    )
}
