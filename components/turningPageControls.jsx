import { useState } from "react";
import Button from 'react-bootstrap/Button'
import Toast from 'react-bootstrap/Toast';
import ToastContainer from 'react-bootstrap/ToastContainer';

import BSafesStyle from '../styles/BSafes.module.css'

export default function TurningPageControls({onNextClicked, onPreviousClicked, cover=false, showAlert=false, alertClosed=null}) {

    const [closeAlert, setCloseAlert] = useState(false);

    return (
        <>
            <Button className={`${BSafesStyle.previousPageBtn} ${cover?BSafesStyle.coverBtnFixed:BSafesStyle.pageBtnFixed}`} onClick={()=> {setCloseAlert(false); onPreviousClicked();}}><i className="fa fa-chevron-left fa-lg" aria-hidden="true"></i></Button>
            <Button className={`${BSafesStyle.nextPageBtn} ${cover?BSafesStyle.coverBtnFixed:BSafesStyle.pageBtnFixed} pull-right`} onClick={()=>{setCloseAlert(false); onNextClicked();}}><i className="fa fa-chevron-right fa-lg" aria-hidden="true"></i></Button>
            <ToastContainer
                className="p-3"
                position={cover?'top-center':'middle-center'}
                style={{ zIndex: 10000 }}
            >
                <Toast show={showAlert && !closeAlert} onClose={()=>{setCloseAlert(true); alertClosed();}} bg='warning'>
                    <Toast.Header>
                        <strong className="me-auto">Alert</strong>
                        <small></small>
                    </Toast.Header>
                    <Toast.Body>Hello, your have reached the end.</Toast.Body>
                </Toast>
            </ToastContainer>
        </>
    )
}