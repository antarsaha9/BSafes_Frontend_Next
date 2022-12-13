import Container from 'react-bootstrap/Container'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Button from 'react-bootstrap/Button'

import BSafesStyle from '../styles/BSafes.module.css'

export default function TurningPageControls({onNextClicked, onPreviousClicked}) {


    return (
        <>
            <Button className={`${BSafesStyle.previousPageBtn} ${BSafesStyle.pageBtnFixed}`} onClick={onPreviousClicked}><i className="fa fa-chevron-left fa-lg" aria-hidden="true"></i></Button>
            <Button className={`${BSafesStyle.nextPageBtn} ${BSafesStyle.pageBtnFixed} pull-right`} onClick={onNextClicked}><i className="fa fa-chevron-right fa-lg" aria-hidden="true"></i></Button>
        </>
    )
}