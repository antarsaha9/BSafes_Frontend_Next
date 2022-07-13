import Container from 'react-bootstrap/Container'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Form from 'react-bootstrap/Form'
import Button from 'react-bootstrap/Button'

import ContentPageLayout from '../components/layouts/contentPageLayout';

import KeyInput from "../components/keyInput";

export default function CreateKey() {
    return (
        <ContentPageLayout> 
            <Container className="mt-5 d-flex justify-content-center" style={{height:'80vh', backgroundColor: "white"}}>     
                <Row>
                    <Col>
                        <h1>Create Your Key</h1>
                        <hr></hr>
                        <Form>
                            <Form.Group className="mb-3" controlId="Nickname">
                                <Form.Label>Nickname</Form.Label>
                                <Form.Control size="lg" type="text" placeholder='Enter a nickname' />
                            </Form.Group>
                            <Form.Group className="mb-3" controlId="keyPassword">
                                <Form.Label>Key Password</Form.Label>
                                <KeyInput />
                                <Form.Text id="passwordHelpBlock" muted>
                Your password must be longer than 8 characters, contain letters and numbers
                                </Form.Text>
                            </Form.Group>
                            <Form.Group className="mb-3" controlId="ConfirmkeyPassword">
                                <Form.Label>Please retype to confirm</Form.Label>
                                <KeyInput />
                            </Form.Group>
                            <Button variant="dark">Submit</Button>
                        </Form>
                    </Col>           
                </Row>
            </Container>
        </ContentPageLayout>
    )
}