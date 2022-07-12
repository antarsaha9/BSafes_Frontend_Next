import { legacy_createStore } from '@reduxjs/toolkit';
import { useEffect, useRef, useState } from 'react'
import { Button, Form, InputGroup } from 'react-bootstrap'

var masterKey = "";
var maskedKey = "";

export default function KeyInput() {
    const inputRef = useRef(null);
    let inputTimer = null;

    const [hidden, setHidden] = useState(true);

    const handleKeyDown = e => {
        //e.preventDefault();

        console.log('keyDown selection', e.target.selectionStart + ', ' +  e.target.selectionEnd);

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
            /* Assuming the change only happens at the end of masterKey */
            if(originalInput.length < masterKey.length){
                masterKey = masterKey.substring(0, inputLength);
            } else {
                masterKey = masterKey + originalInput.charAt(inputLength -1);
            }
        }
        
        maskedKey="";
        for(var i=0; i< inputLength; i++) maskedKey += "*";

        console.log("Master Key: ", masterKey);
        if(inputTimer) {
            clearTimeout(inputTimer);
            inputTimer = null;
            let maskedInput="";
            if(hidden) {
                for(var i=0; i< inputLength-1; i++) maskedInput += "*";
                e.target.value = maskedInput + originalInput.charAt(inputLength-1);
            } else {
                e.target.value = masterKey;
            }
        }

        inputTimer = setTimeout(() => {         
            if(hidden){
                e.target.value = maskedKey;
            } else {
                e.target.value = masterKey;
            }
        }, 1000)
    }

    const handlePaste = (e) => {
        
        e.preventDefault();
        
        console.log('selection', e.target.selectionStart + ', ' +  e.target.selectionEnd);
        
        let paste = (e.clipboardData || window.clipboardData).getData('text');

        
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
                    onKeyDown={handleKeyDown}>
                </Form.Control>
                <Button onClick={handleClick} variant="outline-dark">{hidden?<i id="1" className="fa fa-eye-slash fa-lg" aria-hidden="true"></i>:<i id="1" className="fa fa-eye fa-lg" aria-hidden="true"></i>}</Button>
            </InputGroup>
            
        </>
    )
}