import { useState } from 'react'

import Button from 'react-bootstrap/Button'
import ItemTypeModal from './itemTypeModal'

import BSafesStyle from '../styles/BSafes.module.css'

import { debugLog } from '../lib/helper'

export default function AddAnItemButton({forcedType=null, addAnItem, pageOnly=false}) {
    const debugOn = false;
    const [show, setShow] = useState(false);

    const handleClose = () => setShow(false);
    const handleClicked = () => {
        if(forcedType) {
            addAnItem(forcedType, 'addAnItemOnTop');
        } else {
            setShow(true);
        }
    }

    const optionSelected = (itemType) => {
        debugLog(debugOn, itemType)
        
        setShow(false);
        addAnItem(itemType, 'addAnItemOnTop');
    }

    return (
        <>
            <Button variant="primary" className={BSafesStyle.btnCircle} onClick={handleClicked}>
                <i id="1" className="fa fa-plus fa-lg" aria-hidden="true"></i>
            </Button>

            <ItemTypeModal pageOnly={pageOnly} show={show} handleClose={handleClose} optionSelected={optionSelected} />
        </> 
    )
}