import { useEffect, useState } from "react";
import {useRouter} from "next/router";
import { useSelector, useDispatch } from 'react-redux'

import Container from 'react-bootstrap/Container'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'

import BSafesStyle from '../../styles/BSafes.module.css'

import Scripts from "../../components/scripts";
import ContentPageLayout from '../../components/layouts/contentPageLayout';
import TopControlPanel from "../../components/topControlPanel";
import ItemTopRows from "../../components/itemTopRows";
import Editor from "../../components/editor";
import ContainerOpenButton from "../../components/containerOpenButton";
import PageCommonControls from "../../components/pageCommonControls";

import { clearContainer, initWorkspace } from "../../reduxStore/containerSlice";
import { clearPage, getPageItemThunk, decryptPageItemThunk, saveTitleThunk } from "../../reduxStore/pageSlice";

import { debugLog } from "../../lib/helper";
import { getLastAccessedItem } from "../../lib/bSafesCommonUI";

export default function Diary() {
    const debugOn = true;
    debugLog(debugOn, "Rendering item");
    const dispatch = useDispatch();
    const router = useRouter();

    const [pageItemId, setPageItemId] = useState(null);
    const [pageCleared, setPageCleared] = useState(false); 
    const [isOpen, setIsOpen] = useState(false);

    const {itemId} = router.query;
    if(itemId && !pageItemId) {
        setPageItemId(itemId);
    }

    const searchKey = useSelector( state => state.auth.searchKey);
    const searchIV = useSelector( state => state.auth.searchIV);
    const expandedKey = useSelector( state => state.auth.expandedKey );

    const space = useSelector( state => state.page.space);
    const workspaceKey = useSelector( state => state.container.workspaceKey);
    const workspaceSearchKey = useSelector( state => state.container.searchKey);
    const workspaceSearchIV = useSelector( state => state.container.searchIV);

    const activity = useSelector( state => state.page.activity);
    const [editingEditorId, setEditingEditorId] = useState(null);

    const [titleEditorMode, setTitleEditorMode] = useState("ReadOnly");
    const titleEditorContent = useSelector(state => state.page.title);


    const handlePenClicked = (editorId) => {
        debugLog(debugOn, `pen ${editorId} clicked`);
        if(editorId === 'title') {
            setTitleEditorMode("Writing");
            setEditingEditorId("title");
        } 
    }
    
    const handleContentChanged = (editorId, content) => {
        debugLog(debugOn, `editor-id: ${editorId} content: ${content}`);
        
        if(editingEditorId === "title") {
            if(content !== titleEditorContent) {
                dispatch(saveTitleThunk(content, workspaceSearchKey, workspaceSearchIV));
            } else {
                setEditingEditorMode("ReadOnly");
                setEditingEditorId(null);
            }
        }  
    }

    const setEditingEditorMode = (mode) => {
        switch(editingEditorId) {
            case 'title':
                setTitleEditorMode(mode);
                break;
            default:
        }
    }

    const handleWrite = () =>{
        debugLog(debugOn, "handleWrite");
        setTitleEditorMode("Writing");
        setEditingEditorId("title");
    }

    const handleSave = () => {
        debugLog(debugOn, "handleSave");
        setEditingEditorMode("Saving");
    }

    const handleCancel = () => {
        debugLog(debugOn, "handleCancel");
        setEditingEditorMode("ReadOnly");
        setEditingEditorId(null);
    }

    const handleOpen = async () => {
        debugLog(debugOn, "handleOpen");
        try {
            const item = await getLastAccessedItem(pageItemId);
            if(item) {
                debugLog(debugLog, item);
            } else {
                debugLog(debugLog, "lastAccessedItem not set");
                const idParts = pageItemId.split(":");
                const firstPage = `/diary/p/np:${idParts[1]}:${idParts[2]}:${idParts[3]}:1`;
                router.push(firstPage);
            }
        } catch (error) {
            debugLog(debugOn, error)
        }
    }

    useEffect(()=>{
        if(!router.isReady || pageItemId) return;
        const {itemId} = router.query;
        setPageItemId(itemId);
    }, [router.isReady]);

    useEffect(()=>{
        dispatch(clearPage());
        dispatch(clearContainer());
        setPageCleared(true);
    }, []);

    useEffect(()=>{
        if(pageItemId && pageCleared) {
            dispatch(getPageItemThunk({itemId}));
        }
    }, [pageCleared, pageItemId]);

    useEffect(() => {
        if(activity === "Done") {
            if(editingEditorId) {
                setEditingEditorMode("ReadOnly");
                setEditingEditorId(null);
            }
        } else if (activity === "Error") {
            if(editingEditorId) {
                setEditingEditorMode("Writing");
            }
        }
    }, [activity]);

    useEffect(()=>{
        if(space && pageCleared) {
            if (space.substring(0, 1) === 'u') {
                dispatch(initWorkspace({space, workspaceKey: expandedKey, searchKey, searchIV }));
	        } else {
            }
        }
    }, [space]);

    useEffect(()=>{
        if(workspaceKey && pageCleared) {
            dispatch(decryptPageItemThunk({workspaceKey}));
        }
    }, [workspaceKey]);

    return (
        <div>
            <div className={BSafesStyle.pageBackground}>
                <ContentPageLayout>
                    <Container> 
                        <br />
                        <TopControlPanel></TopControlPanel>
                        <br />                            
                    { !isOpen &&
                        <div className={`${BSafesStyle.diaryPanel} ${BSafesStyle.diaryCoverPanel} ${BSafesStyle.containerCoverPanel} ${BSafesStyle.containerPanel}`}>
                            <ItemTopRows />
                            <br />
                            <br />
                            <Row className="justify-content-center">
                                <Col className={BSafesStyle.containerTitleLabel} xs="10" sm="10" md="8" >
                                    <Editor editorId="title" mode={titleEditorMode} content={titleEditorContent} onContentChanged={handleContentChanged} onPenClicked={handlePenClicked} editable={!editingEditorId && (activity === "Done")} />
                                </Col> 
                            </Row>
                            <br />
                            <Row>
                                <Col>
                                    <ContainerOpenButton handleOpen={handleOpen} />
                                </Col>
                            </Row>
                            <PageCommonControls isEditing={editingEditorId} onWrite={handleWrite} onSave={handleSave} onCancel={handleCancel}/>
                        </div>                  
                    }  
                    { isOpen &&
                    <div className={`${BSafesStyle.pagePanel} ${BSafesStyle.diaryPanel} ${BSafesStyle.containerContentsPanel}`}>
                        <br />
                        <br />
				        <h2 className="text-center">Contents</h2>

                        <Row>
                            <Col xs={{span:2, offset:1}} sm={{span:2, offset:1}} md={{span:1, offset:1}}>
           	                    Page 
                            </Col> 
                            <Col xs={{span:8, offset:0}} sm={{span:8, offset:0}} md={{span:9, offset:0}}>
              	                Title 
                            </Col>
                        </Row>
                    </div>
                    }  
                    </Container> 
                </ContentPageLayout>
                <Scripts />
            </div>
        </div>
    )
}
