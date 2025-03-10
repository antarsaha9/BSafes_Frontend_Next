import { useState } from 'react'
import { useRouter } from 'next/router'

import Button from 'react-bootstrap/Button'
import TryItemTypeModal from './tryItemTypeModal'

import BSafesStyle from '../styles/BSafes.module.css'

import { debugLog } from '../lib/helper'
import { setupDemo } from '../lib/demoHelper'

export default function TryMeButton({ forcedType = null, addAnItem, pageOnly = false, size = '' }) {
    const debugOn = false;
    const router = useRouter();

    const [show, setShow] = useState(false);

    const handleClose = () => setShow(false);
    const handleTryMe = () => {
        setShow(true);
    }
    const handleClicked = () => {
        if (forcedType) {
            addAnItem(forcedType, 'addAnItemOnTop');
        } else {
            setShow(true);
        }
    }

    const optionSelected = (productID) => {
        debugLog(debugOn, productID)
        setShow(false);
        const link = `/pd/${productID}`;
        setupDemo();
        router.push(link);
    }

    return (
        <>
            <div className="text-center">
                <Button variant='danger' size={size} onClick={handleTryMe}>TRY ME <i className="fa fa-arrow-right" aria-hidden="true"></i></Button>
            </div>
            <TryItemTypeModal pageOnly={pageOnly} show={show} handleClose={handleClose} optionSelected={optionSelected} />
        </>
    )
}