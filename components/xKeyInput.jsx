import { legacy_createStore } from '@reduxjs/toolkit';
import { data } from 'jquery';
import { useEffect, useRef, useState } from 'react'
import { Button, Form, InputGroup } from 'react-bootstrap'

import { debugLog } from '../lib/helper'

export default function XKeyInput({onKeyChanged}) {
    const debugOn = true;
    const [masterKeyState, setMasterKeyState] = useState("");
    const [maskedKeyState, setMaskedKeyState] = useState("");
    const [hidden, setHidden] = useState(true);
    const [inputTimer, setInputTimer] = useState(null);

    const inputRef = useRef(null);



    debugLog(debugOn, "Rendering XKeyInput ...:", masterKeyState);


    const handleInput = (e) => {
        debugLog(debugOn, "handleInput: ", e.target.value);
        if(hidden) {
            setMasterKeyState(masterKeyState + e.target.value.substring(e.target.value.length-1, e.target.value.length));   
        } else {
            setMasterKeyState(e.target.value);
        }
        let maskedInput = "";
        for(var i=0; i< e.target.value.length-1; i++) maskedInput += "*";
        maskedInput += e.target.value.substring(e.target.value.length-1, e.target.value.length);
        debugLog(debugOn, maskedInput);
        setMaskedKeyState(maskedInput);
        
        if(inputTimer) { 
            debugLog(debugOn, "inputTimer exists");
            clearTimeout(inputTimer);
            setInputTimer(null);
            setInputTimer(setTimeout(()=>{
                let maskedInput = "";
                for(var i=0; i< e.target.value.length; i++) maskedInput += "*";
                setMaskedKeyState(maskedInput);
                setInputTimer(null);
            }, 500));
        } else {
            setInputTimer(setTimeout(()=>{
                let maskedInput = "";
                for(var i=0; i< e.target.value.length; i++) maskedInput += "*";
                setMaskedKeyState(maskedInput);
                setInputTimer(null);
            }, 500));
        }
    }

    const handlePaste = (e) => {

    }

    const handleKeyDown = (e) => {

    }

    const handleClick = (e) => {
        setHidden(!hidden);
    }


    return (
        <>
            <InputGroup>
                <Form.Control ref={inputRef} type="text" autoComplete="off" 
                    onInput={handleInput}
                    onPaste={handlePaste}
                    onKeyDown={handleKeyDown}
                    value={hidden?maskedKeyState:masterKeyState}
                >
                </Form.Control>
                <Button onClick={handleClick} variant="dark">{hidden?<i id="1" className="fa fa-eye-slash fa-lg" aria-hidden="true"></i>:<i id="1" className="fa fa-eye fa-lg" aria-hidden="true"></i>}</Button>
            </InputGroup>
        </>
    )

}