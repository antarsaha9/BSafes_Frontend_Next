import { CircularProgressbar, buildStyles} from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';

import BSafesStyle from '../styles/BSafes.module.css'

export default function ItemsMovingProgress() {
    return (
        <div className={`${BSafesStyle.itemsMovingProgress}`} hidden >
            <CircularProgressbar
                value={60}
                text={`1/60`}
                background
                backgroundPadding={6}
                styles={buildStyles({
                    backgroundColor: "rgba(0, 0, 0, 0.5)",
                    textColor: "#fff",
                    pathColor: "#fff",
                    trailColor: "transparent"
                })}
            />
        </div>
    )
}