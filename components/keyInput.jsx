import { useEffect, useRef, useState } from 'react'

import Button from 'react-bootstrap/Button'
import Form from 'react-bootstrap/Form'
import InputGroup from 'react-bootstrap/InputGroup'

import BSafesStyle from '../styles/BSafes.module.css'

import { debugLog } from '../lib/helper'

export default function KeyInput({onKeyChanged}) {
    const debugOn = false;
    const [keyValue, setKeyValue] = useState('');
    const [hidden, setHidden] = useState(true);

    const handleChange = (e) => {
        setKeyValue(e.target.value);
        onKeyChanged(e.target.value);
    }

    const handleClick = (e) => {
        setHidden(!hidden);
    }

    return (
        <>
            <InputGroup >
                <Form.Control type={hidden?'password':'text'} 
                    onChange={handleChange}
                    value={keyValue}
                    className={BSafesStyle.inputBox}
                >
                </Form.Control>
                <Button className={BSafesStyle.inputButton} onClick={handleClick} variant="dark">{hidden?<i id="1" className="fa fa-eye-slash fa-lg" aria-hidden="true"></i>:<i id="1" className="fa fa-eye fa-lg" aria-hidden="true"></i>}</Button>
            </InputGroup>
        </>
    )

}