import { useSelector } from 'react-redux'
import Button from 'react-bootstrap/Button'

import BSafesStyle from '../styles/BSafes.module.css'

export default function PageCommonControls({ isEditing, onWrite, readyForSaving = true, onSave, onCancel, canEdit = true }) {
    const contentType = useSelector(state => state.page.contentType) || 'WritingPage';
    return (
        <>
            {(canEdit && !isEditing) ? <Button onClick={onWrite} className={`${BSafesStyle.btnCircle} ${BSafesStyle.btnFloating} ${BSafesStyle.btnFloatingWrite}`}>
                {contentType === "DrawingPage" ?
                    <i className="fa fa-paint-brush fa-2x" aria-hidden="true"></i> 
                    :
                    <i className="fa fa-pencil fa-2x" aria-hidden="true"></i>
                }
            </Button> : <></>}
            {(isEditing && readyForSaving) ? <Button onClick={onSave} className={`${BSafesStyle.btnCircle} ${BSafesStyle.btnFloating} ${BSafesStyle.btnFloatingSave}`} ><i className="fa fa-check fa-2x" aria-hidden="true"></i></Button> : <></>}
            {isEditing ? <Button onClick={onCancel} className={`${BSafesStyle.btnCircle} ${BSafesStyle.btnFloating} ${BSafesStyle.btnFloatingCancel}`}><i className="fa fa-times fa-2x" aria-hidden="true"></i></Button> : <></>}
        </>
    )
}