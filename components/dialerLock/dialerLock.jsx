import React, { useEffect, useRef, useState } from "react";
import { isMobile } from "react-device-detect";

import dialerLockStyles from "./dialerLock.module.css"

import {sleep} from '../../lib/helper'

export default function DialerLock({size=360, fontSize=1, triangleSize=10}) {
    const maxValue = 100;
    const [angle, setAngle] = useState(180);

    const knob = useRef();

    const data = [];
    for(let i=0; i < maxValue; i++) {
        data.push(i);
    }

    useEffect(() => {
        let init,
        rotate,
        start,
        stop,
        active = false,
        rotation = 0,
        startAngle = 0,
        center = {
            x:0,
            y:0,
        },
        R2D = 180/ Math.PI,
        thisKnob = knob.current;     

        let startEvent, moveEvent, stopEvent;
        if(isMobile) {
            startEvent = "touchstart";
            moveEvent = "touchmove";
            stopEvent = "touchend";
        } else {
            startEvent = "mousedown";
            moveEvent = "mousemove";
            stopEvent = "mouseup";
        }

        init = function() {         
                thisKnob.addEventListener(startEvent, start, false);              
        };

        window.addEventListener(moveEvent, (event) => {
            if(active === true) {
                event.preventDefault();
                rotate(event);
            }
        });

        window.addEventListener(stopEvent, (event) => {
            if(active === true) {
                event.preventDefault();
                stop(event);
            }
        });

        start = function (e) {
            e.preventDefault();
            let bb = this.getBoundingClientRect(),
            t = bb.top,
            l = bb.left,
            h = bb.height,
            w = bb.width,
            x,
            y;

            center = {
                x: l + w/2,
                y: t + h/2,
            };

            if(isMobile) {
                x = e.touches[0].clientX - center.x;
                y = e.touches[0].clientY - center.y;
            } else {
                x = e.clientX - center.x;
                y = e.clientY - center.y;
            }
            
            startAngle = R2D * Math.atan2(y,x);
            console.log("mousedown: [startAngle", startAngle);

            return (active = true);
        };

        rotate = function (e) {
            e.preventDefault();
            let x, y, d;
            if(isMobile) {
                x = e.touches[0].clientX - center.x;
                y = e.touches[0].clientY - center.y;
                d = R2D * Math.atan2(y, x);
            } else {
                x = e.clientX - center.x;
                y = e.clientY - center.y;
                d = R2D * Math.atan2(y,x);
            }
            
            rotation = d - startAngle;

            let finalAngle = angle + rotation;
            
            console.log("mousemove: [finalAngle]", finalAngle)
            
            setAngle(finalAngle);
        };

        stop = function() {
            return (active = false);
        }

        init();
        
        const animate = async () => {
            setAngle(angle + 80);
            await sleep(1200);
            setAngle(angle - 60);
        }

        animate();
        /*const interval = setInterval(() => {
            console.log('This will be called every 2 seconds');
            setAngle(angle+180);
          }, 1000);
        
        return () => clearInterval(interval);*/

    }, []);
    

    return (
        <div className={dialerLockStyles.component} style={{width:`${size}px`, height:`${size}px`}}>
            <div className={dialerLockStyles.ring}>
                <div className={dialerLockStyles.triangle} style={{borderWidth:`${triangleSize}px ${triangleSize}px 0 ${triangleSize}px`, transform:`translateX(-${triangleSize}px)`}}></div>
                <div className={dialerLockStyles.hole}>
                    <div className={dialerLockStyles.plate}>
                        <div className={dialerLockStyles.knobBottom}>
                            <div ref={knob} className={dialerLockStyles.knobTop}>
                            </div>
                        </div>
                        
                    </div>
                    <div className={dialerLockStyles.numberPlate} style={{transform: `rotate(${angle}deg)`}}>
                        {
                            data.map((d,i) => (
                                (i%10 === 0)?
                                    (<div key={i} className={dialerLockStyles.numberBox} style={{transform: `rotate(${i*3.6}deg)`}}>
                                        <div className={dialerLockStyles.bar}></div>
                                        <span className={dialerLockStyles.number} style={{fontSize:`${fontSize}rem`}}>{d}</span> 
                                     </div>):
                                    (<div key={i} className={dialerLockStyles.numberBox} style={{transform: `rotate(${i*3.6}deg)`}} >
                                        <div className={dialerLockStyles.shortBar}></div> 
                                     </div>)

                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}