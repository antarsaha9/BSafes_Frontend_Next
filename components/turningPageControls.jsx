import Container from 'react-bootstrap/Container'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Button from 'react-bootstrap/Button'

import BSafesStyle from '../styles/BSafes.module.css'

export default function TurningPageControls({onNextClicked, onPreviousClicked}) {


    return (
        <div className={BSafesStyle.turningPageRow}>
            <Row>
                <Col lg={{span:10, offset:1}}>
                    <Button className={`${BSafesStyle.previousPageBtn} ${BSafesStyle.pageBtn}`} onClick={onPreviousClicked}><i className="fa fa-chevron-left" aria-hidden="true"></i></Button>
                    <Button className={`${BSafesStyle.nextPageBtn} ${BSafesStyle.pageBtn} pull-right`} onClick={onNextClicked}><i className="fa fa-chevron-right" aria-hidden="true"></i></Button>
                </Col>    
            </Row>
        </div>
    )
}