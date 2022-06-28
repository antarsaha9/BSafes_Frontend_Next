import {useEffect, useState} from 'react';
import {useSelector} from 'react-redux';

export default function Counter() {
    const done = useSelector(state => state.counter.done);

    //setLocalCount(localCount+2);
    console.log(done)
    return (
        <div>
            <div>
                
                <span>{done? "Loaded":"Loading"}</span>
                <br/>
            </div>
        </div>
    )
}