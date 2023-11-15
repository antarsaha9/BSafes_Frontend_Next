import { useSelector } from "react-redux";
import { CircularProgressbar, buildStyles} from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';

import BSafesStyle from '../styles/BSafes.module.css'

export default function ItemsMovingProgress() {
    const movingItemsTask = useSelector(state=>state.container.movingItemsTask);

    return (
        <>
        { movingItemsTask &&
            <div className={`${BSafesStyle.itemsMovingProgress}`} >
            
                <CircularProgressbar
                    value={60}
                    text={`${movingItemsTask.completed}/${movingItemsTask.numberOfItems}`}
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
        }
        </>
        

    )
}