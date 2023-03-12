import {useRef} from 'react'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Card from 'react-bootstrap/Card'
import ProgressBar from 'react-bootstrap/ProgressBar'

export default function AttachmentPanel ({panelIndex, panel}) {
    return (
        <Card>
            <Card.Body>
                <Row>
                    <Col>
                    <h6><i className="fa fa-file-o" aria-hidden="true"></i> <span className="attachmentFileName">{panel.fileName}</span></h6>
                    </Col>
                </Row>
                <Row>
                    <Col>
                        {(panel.status === "Uploading" || panel.status === "Downloading")?<ProgressBar now={panel.progress} />:""}  
                    </Col>
                </Row>
            </Card.Body>
        </Card>
    )
}