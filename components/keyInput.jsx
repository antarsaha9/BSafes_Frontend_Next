import { legacy_createStore } from '@reduxjs/toolkit';
import { data } from 'jquery';
import { useEffect, useRef, useState } from 'react'
import { Button, Form, InputGroup } from 'react-bootstrap'

var masterKey = "";
var maskedKey = "";

export default function KeyInput() {
    const inputRef = useRef(null);
    let inputTimer = null;
    let selectionStart = 0;
    let selectionEnd = 0;
    let inputInfo = {};

    const [hidden, setHidden] = useState(true);

    const handleKeyDown = e => {
        //e.preventDefault();

        selectionStart = e.target.selectionStart;
        selectionEnd = e.target.selectionEnd;
        inputInfo.type = 'KeyDown';
        inputInfo.data = e.keyCode;

        console.log('keyDown selection and keyCode', e.target.selectionStart + ', ' +  e.target.selectionEnd + ', ' + inputInfo.data);
        console.log('KeyDown input value', `${e.target.value}`);
    }

    const handleInput = e => {
        e.preventDefault();

       // console.log('selection', e.target.selectionStart + ', ' +  e.target.selectionEnd);
        console.log("handleInput");
        console.log(e.target.value);
        const originalInput = e.target.value;
        let inputLength = originalInput.length;

        if(!hidden) {
            masterKey = originalInput;
        } else {
            let part1, part2, part3;
            switch (inputInfo.data) {
                case 8: // backspace
                    if(masterKey.length === 0) break;
                    if(selectionEnd !== selectionStart) {
                        part1 = masterKey.substring(0, selectionStart);
                    } else {
                        part1 = masterKey.substring(0, selectionStart -1);
                    }
                    part3 = masterKey.substring(selectionEnd, masterKey.length);
                    masterKey = part1 + part3;
                    break;
                case 46: // delete
                    if(masterKey.length === 0) break;
                    part1 = masterKey.substring(0, selectionStart);
                    part3 = masterKey.substring(selectionEnd, masterKey.length);
                    masterKey = part1 + part3;         
                    break;
                default:                   
                    part1 = masterKey.substring(0, selectionStart);
                    part2 = masterKey.substring(selectionStart, selectionEnd);
                    part3 = masterKey.substring(selectionEnd, masterKey.length);
                    
                    if(inputInfo.type === 'KeyDown') {
                        let newChar = originalInput.charAt(selectionStart);
                        masterKey = part1 + newChar + part3;
                    } else {
                        masterKey = part1 + inputInfo.data + part3;
                    }
                    
            }
           
        }
        
        maskedKey="";
        for(var i=0; i< inputLength; i++) maskedKey += "*";

        console.log("Master Key: ", masterKey);
        if(inputTimer) {
            clearTimeout(inputTimer);
            inputTimer = null;
            
            if(hidden) {
                if(inputInfo.data === 8) {
                    e.target.value = maskedKey;
                    e.target.setSelectionRange(selectionStart-1, selectionStart-1);
                } else {
                    let maskedInput="";
                    for(var i=0; i< selectionStart; i++) maskedInput += "*";
                    maskedInput += originalInput.charAt(selectionStart);
                    for(var i=selectionStart+1; i< masterKey.length; i++)  maskedInput += "*";
                    console.log("maskedInput: ", maskedInput);
                    e.target.value = maskedInput;
                    e.target.setSelectionRange(selectionStart+1, selectionStart+1);
                }
            } else {
                e.target.value = masterKey;
            }
        }

        inputTimer = setTimeout(() => {         
            if(hidden){              
                e.target.value = maskedKey;
                if(inputInfo.data === 8) {
                    e.target.setSelectionRange(selectionStart-1, selectionStart-1);
                } else if(inputInfo.type === 'Paste'){
                    let cursorPosition = selectionStart + inputInfo.data.length;
                    e.target.setSelectionRange(cursorPosition, cursorPosition);
                } else {
                    e.target.setSelectionRange(selectionStart+1, selectionStart+1);
                }
            } else {
                e.target.value = masterKey;
            }
            inputTimer = null;
        }, 1000)
    }

    const handlePaste = (e) => {
        
        selectionStart = e.target.selectionStart;
        selectionEnd = e.target.selectionEnd;

        inputInfo.type = "Paste";
        inputInfo.data = (e.clipboardData || window.clipboardData).getData('text');
        console.log('Paste (Start, End, Data)', `${e.target.selectionStart}, ${e.target.selectionEnd}, ${inputInfo.data}`);
    }

    const handleClick = e => {
        e.preventDefault();

        setHidden(!hidden);
    }
   
    useEffect(() => {
        if(hidden) {
            inputRef.current.value = maskedKey;
        } else {
            inputRef.current.value = masterKey;
        }
    }, [hidden])

    return (
        <>
            <InputGroup>
                <Form.Control ref={inputRef} type="text" 
                    onInput={handleInput}
                    onPaste={handlePaste}
                    onKeyDown={handleKeyDown}
                    >
                </Form.Control>
                <Button onClick={handleClick} variant="dark">{hidden?<i id="1" className="fa fa-eye-slash fa-lg" aria-hidden="true"></i>:<i id="1" className="fa fa-eye fa-lg" aria-hidden="true"></i>}</Button>
            </InputGroup>
        </>
    )
}