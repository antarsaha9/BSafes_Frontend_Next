import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useSelector, useDispatch } from 'react-redux'

import Container from 'react-bootstrap/Container'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'

import BSafesStyle from '../../../styles/BSafes.module.css'

import Scripts from "../../../components/scripts";
import ContentPageLayout from '../../../components/layouts/contentPageLayout';
import TopControlPanel from "../../../components/topControlPanel";
import ItemTopRows from "../../../components/itemTopRows";
import Editor from "../../../components/editor";
import ContainerOpenButton from "../../../components/containerOpenButton";
import PageCommonControls from "../../../components/pageCommonControls";

import { clearContainer, initWorkspace } from "../../../reduxStore/containerSlice";
import { clearPage, getPageItemThunk, decryptPageItemThunk, saveTitleThunk } from "../../../reduxStore/pageSlice";

import { debugLog } from "../../../lib/helper";
import { getLastAccessedItem } from "../../../lib/bSafesCommonUI";

export default function Notebook() {
    const debugOn = true;
    debugLog(debugOn, "Rendering item");
    // const dispatch = useDispatch();
    // const router = useRouter();

    // const [pageItemId, setPageItemId] = useState(null);
    // const [pageCleared, setPageCleared] = useState(false); 
    // const [isOpen, setIsOpen] = useState(false);

    // const {itemId} = router.query;
    // if(itemId && !pageItemId) {
    //     setPageItemId(itemId);
    // }

    // const searchKey = useSelector( state => state.auth.searchKey);
    // const searchIV = useSelector( state => state.auth.searchIV);
    // const expandedKey = useSelector( state => state.auth.expandedKey );

    // const space = useSelector( state => state.page.space);
    // const workspaceKey = useSelector( state => state.container.workspaceKey);
    // const workspaceSearchKey = useSelector( state => state.container.searchKey);
    // const workspaceSearchIV = useSelector( state => state.container.searchIV);

    const activity = useSelector( state => state.page.activity);
    const [editingEditorId, setEditingEditorId] = useState(null);

    const [titleEditorMode, setTitleEditorMode] = useState("ReadOnly");
    const titleEditorContent = useSelector(state => state.page.title);
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
    const handlePenClicked = (editorId) => {
        debugLog(debugOn, `pen ${editorId} clicked`);
        if(editorId === 'title') {
            setTitleEditorMode("Writing");
            setEditingEditorId("title");
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

    return (
        <div>
            <div className={BSafesStyle.pageBackground}>
                <ContentPageLayout>
                    <Container>
                        <br />
                        <TopControlPanel></TopControlPanel>
                        <br />
                        <div className={`${BSafesStyle.diaryPanel} ${BSafesStyle.pagePanel} ${BSafesStyle.containerCoverPanel} ${BSafesStyle.containerPanel}`}>
                            <ItemTopRows />
                            <Row style={{ marginTop: '20px' }} className=" mx-0">
                                <Col xs={12} sm={10} md={8}>
                                    <h2 >Today</h2>
                                    <h4 >Sunday, Nov. 20, 2022</h4>
                                </Col>
                            </Row>
                            <Row className="justify-content-center">
                                <Col className={BSafesStyle.containerTitleLabel} xs="10" sm="10" md="8" >
                                    <Editor editorId="title" mode={titleEditorMode} content={titleEditorContent} onContentChanged={handleContentChanged} onPenClicked={handlePenClicked} editable={!editingEditorId && (activity === "Done")} />
                                </Col>
                            </Row>
                        </div>


                    </Container>
                </ContentPageLayout>
                <Scripts />
            </div>
        </div>
    )
}
