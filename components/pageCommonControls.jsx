import Button from 'react-bootstrap/Button'

import BSafesStyle from '../styles/BSafes.module.css'

export default function PageCommonControls() {
    return (
        <>
            {0?<Button className={`${BSafesStyle.btnCircle} ${BSafesStyle.btnFloating} ${BSafesStyle.btnFloatingWrite}`}><i className="fa fa-pencil fa-2x" aria-hidden="true"></i></Button>:<></>}
            {1?<Button className={`${BSafesStyle.btnCircle} ${BSafesStyle.btnFloating} ${BSafesStyle.btnFloatingSave}`} ><i className="fa fa-check fa-2x" aria-hidden="true"></i></Button>:<></>}
            {1?<Button className={`${BSafesStyle.btnCircle} ${BSafesStyle.btnFloating} ${BSafesStyle.btnFloatingCancel}`}><i className="fa fa-times fa-2x" aria-hidden="true"></i></Button>:<></>}
        </>
    )
}