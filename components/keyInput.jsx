import { useEffect, useRef, useState } from 'react'

import Button from 'react-bootstrap/Button'
import Form from 'react-bootstrap/Form'
import InputGroup from 'react-bootstrap/InputGroup'

import BSafesStyle from '../styles/BSafes.module.css'

import { debugLog } from '../lib/helper'

export default function KeyInput({onKeyChanged}) {
    const debugOn = false;
    const [masterKeyState, setMasterKeyState] = useState("");
    const [maskedKeyState, setMaskedKeyState] = useState("");
    const [hidden, setHidden] = useState(true);
    const [inputTimer, setInputTimer] = useState(null);
    const [cursor, setCursor] = useState(0);

    const inputRef = useRef(null);
    
    let selectionStart = 0;
    let selectionEnd = 0;
    let inputInfo = {};

    debugLog(debugOn, "Rendering XKeyInput ...:", masterKeyState);

    const handleKeyDown = e => {
        //e.preventDefault();

        selectionStart = e.target.selectionStart;
        selectionEnd = e.target.selectionEnd;
        inputInfo.type = 'KeyDown';
        inputInfo.data = e.keyCode;

        
        debugLog(debugOn, 'keyDown selection and keyCode', e.target.selectionStart + ', ' +  e.target.selectionEnd + ', ' + inputInfo.data);
        debugLog(debugOn, 'KeyDown input value', `${e.target.value}`);
    }

    const handlePaste = (e) => {
        
        selectionStart = e.target.selectionStart;
        selectionEnd = e.target.selectionEnd;

        inputInfo.type = "Paste";
        inputInfo.data = (e.clipboardData || window.clipboardData).getData('text');
        debugLog(debugOn, 'Paste (Start, End, Data)', `${e.target.selectionStart}, ${e.target.selectionEnd}, ${inputInfo.data}`);
    }

    const handleInput = (e) => {
        debugLog(debugOn, "handleInput: ", e.target.value);

        const originalInput = e.target.value;
        let inputLength = originalInput.length;

        if(!hidden) {
            let maskedInput = "";
            for(var i=0; i< e.target.value.length; i++) maskedInput += "*";
            debugLog(debugOn, maskedInput);
            setMasterKeyState(e.target.value);   
            setMaskedKeyState(maskedInput);

            let newText="";
            if(inputInfo.type === 'KeyDown') {
                newText = originalInput.charAt(selectionStart);
            } else {
                newText = inputInfo.data;
            } 
            setCursor(selectionStart + newText.length);
        } else {
            let part1, part2, part3;
            let maskedInput="";
            switch (inputInfo.data) {
                case 8: // backspace
                    if(masterKeyState.length === 0) break;
                    if(selectionEnd !== selectionStart) {
                        part1 = masterKeyState.substring(0, selectionStart);
                    } else {
                        part1 = masterKeyState.substring(0, selectionStart -1);
                    }
                    part3 = masterKeyState.substring(selectionEnd, masterKeyState.length);
                    setMasterKeyState(part1 + part3);

                    maskedInput="";
                    for(var i=0; i< inputLength; i++) maskedInput += "*";
                    setMaskedKeyState(maskedInput);
                    setCursor(selectionStart-1);
                    
                    break;
                case 46: // delete
                    if(masterKeyState.length === 0) break;
                    part1 = masterKeyState.substring(0, selectionStart);
                    part3 = masterKeyState.substring(selectionEnd, masterKeyState.length);
                    setMasterKeyState(part1 + part3); 

                    maskedInput="";
                    for(var i=0; i< inputLength; i++) maskedInput += "*";
                    setMaskedKeyState(maskedInput);
                    setCursor(selectionStart);
                      
                    break;
                default:                   
                    part1 = masterKeyState.substring(0, selectionStart);
                    part2 = masterKeyState.substring(selectionStart, selectionEnd);
                    part3 = masterKeyState.substring(selectionEnd, masterKeyState.length);
                    
                    let newText="";
                    if(inputInfo.type === 'KeyDown') {
                        newText = originalInput.charAt(selectionStart);
                    } else {
                        newText = inputInfo.data;
                        
                    } 
                    setMasterKeyState(part1 + newText + part3);

                    maskedInput="";
                    for(var i=0; i< selectionStart; i++) maskedInput += "*";
                    maskedInput += newText;
                    for(var i=selectionStart + newText.length; i< inputLength; i++)  maskedInput += "*";
                    debugLog(debugOn, "maskedInput: ", maskedInput);
                    setMaskedKeyState(maskedInput);
                    setCursor(selectionStart+newText.length);    
            }
        }
        
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

    const handleClick = (e) => {
        setHidden(!hidden);
    }

    useEffect(()=>{
        inputRef.current.setSelectionRange(cursor, cursor); 
    }, [cursor])

    useEffect(()=> {
        onKeyChanged(masterKeyState);
    }, [onKeyChanged, masterKeyState]);

    return (
        <>
            <InputGroup>
                <Form.Control ref={inputRef} type="text" autoComplete="off" 
                    onInput={handleInput}
                    onPaste={handlePaste}
                    onKeyDown={handleKeyDown}
                    value={hidden?maskedKeyState:masterKeyState}
                    className={BSafesStyle.inputBox}
                >
                </Form.Control>
                <Button onClick={handleClick} variant="dark">{hidden?<i id="1" className="fa fa-eye-slash fa-lg" aria-hidden="true"></i>:<i id="1" className="fa fa-eye fa-lg" aria-hidden="true"></i>}</Button>
            </InputGroup>
        </>
    )

}