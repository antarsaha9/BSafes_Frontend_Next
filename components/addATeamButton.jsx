import { useState } from 'react'

import Button from 'react-bootstrap/Button'
import NewTeamModal from './newTeamModal'

import BSafesStyle from '../styles/BSafes.module.css'

import { debugLog } from '../lib/helper'

export default function AddATeamButton({addATeam}) {
    const debugOn = false;
    
    return (
        <>
            <Button variant="primary" className={BSafesStyle.btnCircle} onClick={addATeam}>
                <i id="1" className="fa fa-plus fa-lg" aria-hidden="true"></i>
            </Button>       
        </> 
    )
}