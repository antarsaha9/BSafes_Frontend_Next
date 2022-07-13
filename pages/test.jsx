import Container from 'react-bootstrap/Container'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Form from 'react-bootstrap/Form'

import ContentPageLayout from '../components/layouts/contentPageLayout';

import KeyInput from "../components/keyInput";

export default function CreateKey() {
    return (
        <ContentPageLayout> 
            <div className="d-flex align-items-center justify-content-center" style={{height:'80vh', backgroundColor: "yellow"}}>
                <div className="p-3 d-inline-block" style={{height: "100%", backgroundColor: "white"}}>
                    Hello
                </div>
            </div>
        </ContentPageLayout>
    )
}