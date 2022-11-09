import BSafesStyle from '../styles/BSafes.module.css'

export default function ContainerOpenButton({handleOpen}) {
    return (
        
        <div className={`${BSafesStyle.containerOpenBtn} text-center`} onClick={handleOpen}>
			<h6>Open</h6>
			<h3><i className="fa fa-circle" aria-hidden="true"></i></h3>
        </div>

    )
}