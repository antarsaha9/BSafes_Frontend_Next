import { useSelector } from 'react-redux'
import BSafesStyle from '../styles/BSafes.module.css'

export default function ContainerOpenButton({ handleOpen }) {
    const workspace = useSelector(state => state.container.workspace);

    return (

        <div className={`${BSafesStyle.containerOpenBtn} text-center`} onClick={handleOpen} style={{ cursor: 'pointer' }}>
            <h6>Open</h6>
            {(workspace && workspace.startsWith("d:")) ?
                <h3><i className="fa fa-unlock-alt" aria-hidden="true"></i></h3> :
                <h3><i className="fa fa-lock" aria-hidden="true"></i></h3>
            }

        </div>

    )
}