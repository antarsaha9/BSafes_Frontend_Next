import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Button from 'react-bootstrap/Button'
import Card from 'react-bootstrap/Card'

import BSafesStyle from '../styles/BSafes.module.css'

export default function TopControlPanel() {
    return (
        <Row>
            <Col xs={12} sm={{span:10, offset:1}} lg={{span:8, offset:2}}>
                <Card className={BSafesStyle.containerControlPanel}>
                    <Card.Body>
                        <Row>
                            <Col xs={4}>
                                <Button variant='link' size='sm' className='text-white'><i className="fa fa-square" aria-hidden="true"></i></Button>
                            </Col>
                            <Col xs={4}>
                            </Col>
                            <Col xs={4}>
                            <Button variant='link' size='sm' className='text-white pull-right'><i className="fa fa-ellipsis-v" aria-hidden="true"></i></Button>
                            </Col>
                        </Row>
                    </Card.Body>
                </Card>
            </Col> 
        </Row>
    )
}