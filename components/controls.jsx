import React from 'react';
import {useSelector, useDispatch} from 'react-redux';
import {decrement, increment, waitAndIncrement} from '../reduxStore/counter/counterSlice';

export default function Controls() {
    const dispatch = useDispatch()

    return (
        <div>
            <div>
                <button aria-label="Increment value"
                    onClick={() => dispatch(increment())}
                >
                    Increment
                </button>
            
                <button aria-label="Increment value"
                    onClick={() => dispatch(decrement())}
                >
                    Decrement
                </button>

                <button aria-label="Wait and Increment value"
                    onClick={() => dispatch(waitAndIncrement())}
                >
                    Wait and Increment
                </button>
            </div>
        </div>
    )
}