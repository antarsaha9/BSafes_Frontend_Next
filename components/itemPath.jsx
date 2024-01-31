import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { useRouter } from 'next/router';

const forge = require('node-forge');
const DOMPurify = require('dompurify');
import parse from "date-fns/parse";
import format from "date-fns/format";

import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Breadcrumb from 'react-bootstrap/Breadcrumb';
import Dropdown from 'react-bootstrap/Dropdown';

import BSafesStyle from '../styles/BSafes.module.css'

import { debugLog } from '../lib/helper'
import { decryptBinaryString } from '../lib/crypto'; 

export default function ItemPath() {
    const debugOn = false;

    const router = useRouter();
    
    const workspaceName = useSelector( state => state.container.workspaceName);
    const workspaceKey = useSelector( state => state.container.workspaceKey);
    const workspaceKeyReady = useSelector( state => state.container.workspaceKeyReady);
    const aborted = useSelector( state => state.page.aborted);
    const itemPath = useSelector( state => state.page.itemPath);
    
    const [pathItems, setPathItems] = useState([]);

    const breadItems = pathItems.map((item, index) => 
        (index!==(pathItems.length-1))?
        <Breadcrumb.Item key={index} onClick={()=>router.push(item.link)} /*href={item.link}*/ active={ false }>{item.icon && <i className={`${item.icon} px-1`} />}{item.title}</Breadcrumb.Item>  
        : 
        <Breadcrumb.Item key={index} active={true}>{item.icon && <i className={`${item.icon} px-1`} />}{item.title}</Breadcrumb.Item>
    );

    const getNewTabItems = () => {
        let newItems = [];
        for(let i=pathItems.length-1; i>=0; i--) {
            let item = pathItems[i];
            if(item.type === 'u' || item.type === 'p' || item.type === 'np' || item.type === 'dp') continue;
            newItems.push(<Dropdown.Item key={i} href={item.link} target='_blank'>{item.icon && <i className={`${item.icon} px-1`} />}{item.title}</Dropdown.Item>)
        }
        return newItems;
    }
    const newTabItems = getNewTabItems();
    
    useEffect(()=>{
        if(!aborted && itemPath && workspaceKeyReady) {
            debugLog(debugOn, "itemPath && workspaceKeyReady");
            const decryptedItems = itemPath.map((item) =>{
                const pathItemType = item._id.split(':')[0];
                let pathItemIcon, pathItemLink, encodedTitle, title, temp, itemTitleText, itemKey, itemIV;
                switch(pathItemType) {
                    case 'u':
                        pathItemIcon = null;
                        itemTitleText = workspaceName;
                        pathItemLink = '/safe';
                        break;
                    case 't1':
                        pathItemIcon = null;
                        itemTitleText = workspaceName;
                        const teamId = item._id.slice(0, -4)
                        pathItemLink = '/team/' + teamId;
                        break;
                    case 'tm':
                        pathItemIcon = "fa fa-users";
                        itemTitleText = 'Members';
                        pathItemLink = '/teamMembers/' + item._id;
                        break;
                    case 'ac':
                        pathItemIcon = "fa fa-tasks";
                        itemTitleText = 'Activities';
                        pathItemLink = '/activities/' + item._id;
                        break;
                    case 'b':
                        pathItemIcon = "fa fa-archive";
                        pathItemLink = '/box/contents/' + item._id;
                        break;
                    case 'f':
                        pathItemIcon = "fa fa-folder-o";
                        pathItemLink = '/folder/contents/' + item._id;
                        break;
                    case 'n':
                        pathItemIcon = "fa fa-book";
                        pathItemLink = '/notebook/contents/' + item._id;
                        break;
                    case 'd':
                        pathItemIcon = "fa fa-calendar";
                        pathItemLink = '/diary/contents/' + item._id;
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
                        break;
                    case 't':
                        pathItemIcon = "fa fa-trash";
                        pathItemLink = '/trashBox/' + item._id;
                        break;
                    default:
                        break;
                }

                if(pathItemType === 'u' || pathItemType === 't1' || pathItemType === 't' || pathItemType === 'tm' || pathItemType === 'ac' ) {
                } else if(pathItemType === 'np' ) {
                    itemTitleText = 'Page: ' + item._id.split(':').pop();
                } else if(pathItemType === 'dp' ) {
                    let dateStr = item._id.split(':').pop();
                    let date = parse(dateStr, 'yyyy-LL-dd', new Date());
                    itemTitleText = format(date, 'EEEE, LLL. dd, yyyy') ;
                } else { 
                    try {
                        if (item._source.envelopeIV && item._source.ivEnvelope && item._source.ivEnvelopeIV) { // legacy CBC-mode
                            itemKey = decryptBinaryString(forge.util.decode64(item._source.keyEnvelope), workspaceKey, forge.util.decode64(item._source.envelopeIV));
                            itemIV = decryptBinaryString(forge.util.decode64(item._source.ivEnvelope), workspaceKey, forge.util.decode64(item._source.ivEnvelopeIV));
                        } else { 
                            itemKey = decryptBinaryString(forge.util.decode64(item._source.keyEnvelope), workspaceKey);
                        }   
                        if(item._source.title) {
                            encodedTitle = decryptBinaryString(forge.util.decode64(item._source.title), itemKey, itemIV);
                            title = forge.util.decodeUtf8(encodedTitle);
                            title = DOMPurify.sanitize(title);
                            temp = document.createElement('span');
                            temp.innerHTML = title;
                            itemTitleText = temp.textContent || temp.innerText;
                        } else {
                            itemTitleText = '';
                        }      
                    } catch(error) {
                        itemTitleText = 'Error!';
                    }   
                }
                return {
                    type: pathItemType,
                    title: itemTitleText,
                    icon: pathItemIcon,
                    link: pathItemLink,
                }
            })
            setPathItems(decryptedItems);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps    
    }, [aborted, itemPath, workspaceKeyReady])

    return (
        <>
            <Container fluid>
                <Row>
                    <Col xs={10} md={11} className={`${BSafesStyle.itemPath} rounded-end`}>
                        <Breadcrumb className={`${BSafesStyle.itemPathBreadcrumb}`}>
                            <Breadcrumb.Item /*href="/teams"*/ onClick={()=>router.push('/teams')} active={false} className={`${BSafesStyle.teamsPathItem}`} linkProps={{ className: BSafesStyle.teamsPathLink }}><i className="fa fa-building" aria-hidden="true" /> Spaces </Breadcrumb.Item>
                            {breadItems}
                        </Breadcrumb>
                    </Col>
                    <Col xs={2} md={1}>
                        <Dropdown align="end" className="justify-content-end pull-right">
                            <Dropdown.Toggle size='sm' variant="primary" bsPrefix='px-3 py-2'>
                                <span><i className="fa fa-plus" aria-hidden="true"></i></span>
                            </Dropdown.Toggle>
                            <Dropdown.Menu>
                                {newTabItems}
                                <Dropdown.Item href='/teams' target='_blank'><span className='fw-bold'>Spaces</span></Dropdown.Item>
                                <Dropdown.Item href='/safe' target='_blank'><span className='fw-bold'>Personal</span></Dropdown.Item>                
                            </Dropdown.Menu>
                        </Dropdown>
                        
                    </Col>
                </Row>     
            </Container>
        </>
    )
}