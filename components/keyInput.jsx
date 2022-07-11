import { legacy_createStore } from '@reduxjs/toolkit';
import { useState } from 'react'
import { Form } from 'react-bootstrap'

export default function KeyInput() {
    let keyTimer = null;
    let key = "";

    const handleInput = e => {
        
        console.log(e.target.value);
        const originalInput = e.target.value;
        let inputLength = originalInput.length;
        if(originalInput.length < key.length){
            key = key.substring(0, inputLength);
        } else {
            key = key + originalInput.charAt(inputLength - 1);
        }
        console.log("Key: ", key)

        if(keyTimer) {
            clearTimeout(keyTimer);
            keyTimer = null;
            let maskedInput="";
            for(var i=0; i< inputLength-1; i++) maskedInput += "*";
            e.target.value = maskedInput + originalInput.charAt(inputLength-1);
        }

        keyTimer = setTimeout(() => {
            let maskedInput="";
            for(var i=0; i< inputLength; i++) maskedInput += "*";
            e.target.value = maskedInput;
        }, 1000)
    }

    return (
        <Form.Control type="text" onInput={handleInput}></Form.Control>
    )
}