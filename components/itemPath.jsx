import { useEffect, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'

const forge = require('node-forge');
const DOMPurify = require('dompurify');

import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Breadcrumb from 'react-bootstrap/Breadcrumb';

import BSafesStyle from '../styles/BSafes.module.css'

import { debugLog } from '../lib/helper'
import { decryptBinaryString } from '../lib/crypto'; 

export default function ItemPath() {
    const debugOn = true;
    
    const workspaceKey = useSelector( state => state.container.workspaceKey);
    const workspaceKeyReady = useSelector( state => state.container.workspaceKeyReady);
    const aborted = useSelector( state => state.page.aborted);
    const itemPath = useSelector( state => state.page.itemPath);
    
    const [pathItems, setPathItems] = useState([]);

    const breadItems = pathItems.map((item, index) => 
        <Breadcrumb.Item key={index} active={index===(pathItems.length-1)} href={item.link}>{item.icon && <i className={`${item.icon} px-1`} />}{item.title}</Breadcrumb.Item>  
    );

    useEffect(()=>{
        if(!aborted && itemPath && workspaceKeyReady) {
            debugLog(debugOn, "itemPath && workspaceKeyReady");
            const decryptedItems = itemPath.map((item, index) =>{
                const pathItemType = item._id.split(':')[0];
                let pathItemIcon, pathItemLink, encodedTitle, title, temp, itemTitleText, decoded, itemKey;
                switch(pathItemType) {
                    case 'u':
                        pathItemIcon = null;
                        itemTitleText = 'Personal';
                        pathItemLink = '/safe';
                        break;
                    case 'b':
                        pathItemIcon = "fa fa-archive";
                        pathItemLink = '/box/' + item._id;
                        break;
                    case 'f':
                        pathItemIcon = "fa fa-folder-o";
                        pathItemLink = '/folder/' + item._id;
                        break;
                    case 'n':
                        pathItemIcon = "fa fa-book";
                        pathItemLink = '/notebook/' + item._id;
                        break;
                    case 'd':
                        pathItemIcon = "fa fa-calendar";
                        pathItemLink = '/diary/' + item._id;
                        break;
                    case 'p':
                        pathItemIcon = "fa fa-file-text-o";
                        pathItemLink = '/page/' + item._id;
                        break;
                    case 'np':
                        pathItemIcon = "fa fa-file-text-o";
                        pathItemLink = '/notebook/p/' + item._id;
                        break;
                    case 'dp':
                        pathItemIcon = "fa fa-file-text-o";
                        pathItemLink = '/diary/p/' + item._id;
                    default:
                        break;
                }

                if(pathItemType === 'u') {
                } else if (item._source.envelopeIV && item._source.ivEnvelope && item._source.ivEnvelopeIV) { // legacy CBC-mode
                } else {
                    decoded = forge.util.decode64(item._source.keyEnvelope);
                    itemKey = decryptBinaryString(decoded, workspaceKey);
                    encodedTitle = decryptBinaryString(forge.util.decode64(item._source.title), itemKey);
                    title = forge.util.decodeUtf8(encodedTitle);
                    temp = document.createElement('span');
                    temp.innerHTML = title;
                    itemTitleText = temp.textContent || temp.innerText;
                }
                return {
                    title: itemTitleText,
                    icon: pathItemIcon,
                    link: pathItemLink,
                }
            })
            setPathItems(decryptedItems);
        }
    }, [aborted, itemPath, workspaceKeyReady])

    return (
        <>
            <Row>
                <Col xs={10} sm={11} className={`${BSafesStyle.itemPath} rounded-end`}>
                    <Breadcrumb className={`${BSafesStyle.itemPathBreadcrumb}`}>
                        <Breadcrumb.Item className={`${BSafesStyle.teamsPathItem}`} linkProps={{ className: BSafesStyle.teamsPathLink }}><i className="fa fa-building" aria-hidden="true" /> Teams </Breadcrumb.Item>
                        {breadItems}
                    </Breadcrumb>
                </Col>
            </Row>
            <Col xs={2} sm={1}>

            </Col>
        </>
    )
}