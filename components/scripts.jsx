import {useState} from 'react'
import Script from 'next/script'
import { useSelector, useDispatch } from 'react-redux'
import { loaded } from '../reduxStore/scriptsSlice';

import { debugLog } from '../lib/helper';

var count = 0;
export default function Scripts() {
    const debugOn = false;
    const dispatch = useDispatch();
    
    const scripts = useSelector(state => state.scripts.scripts);
    const scriptsLoaded = useSelector(state => state.scripts.done);

    debugLog(debugOn, "Render count:", count);
    
    count ++;
    
    const scriptElements = scripts.map( (script, index) => 
        <Script 
            key={index}
            id={script.id}
            src={script.src}
            onLoad={() => {                        
                dispatch(loaded(index));
            }}
        />
    );

    return (
        <div>

            {
                scriptElements
            }
            
        </div>
    )
}