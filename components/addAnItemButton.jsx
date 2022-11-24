import { useEffect, useRef, useState } from 'react'

import Button from 'react-bootstrap/Button'
import ItemTypeModal from './itemTypeModal'

import BSafesStyle from '../styles/BSafes.module.css'

import { debugLog } from '../lib/helper'

export default function AddAnItemButton({addAnItem, pageOnly=false}) {
    const debugOn = false;
    const [show, setShow] = useState(false);

    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);

    const optionSelected = (itemType) => {
        debugLog(debugOn, itemType)
        
        setShow(false);
        addAnItem(itemType, 'addAnItemOnTop');
    }

    return (
        <>
            <Button variant="primary" className={BSafesStyle.btnCircle} onClick={handleShow}>
                <i id="1" className="fa fa-plus fa-lg" aria-hidden="true"></i>
            </Button>

            <ItemTypeModal show={show} handleClose={handleClose} optionSelected={optionSelected} />
        </> 
    )
}