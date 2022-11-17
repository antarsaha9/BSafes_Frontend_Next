import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";

import BSafesStyle from '../styles/BSafes.module.css'

import Editor from "./editor";
//import { getPageCommentsThunk } from "../reduxStore/pageSlice";

export default function Comments({handlePenClicked, handleContentChanged, editable }) {
  const dispatch = useDispatch();

  const newCommentEditorMode = useSelector(state => state.page.newCommentEditorMode);
  const comments = useSelector(state => state.page.comments);
  const itemId = useSelector(state => state.page.id);

  useEffect(() => {
    if (itemId) {
//      dispatch(getPageCommentsThunk({ itemId }));
    }
  }, [itemId]);

  return (
    <div>
      <Row>
        <Col sm={{ span: 10, offset: 1 }} md={{ span: 8, offset: 2 }}>
          <h4 className="fw-normal">Comments</h4>
        </Col>
      </Row>
      {/* comments */}
      <CommentCard CommentCard key="New" commentIndex={"comment_New"} editorMode={newCommentEditorMode} onPenClicked={handlePenClicked} onContentChanged={handleContentChanged} editable={editable} />
      {comments?.map((comment, index) => <CommentCard key={index} commentIndex={"comment_" + index} comment={comment} editorMode={comment.editorMode} onPenClicked={handlePenClicked} onContentChanged={handleContentChanged} editable={editable} />)}
    </div>
  )

}

function CommentCard({ commentIndex, comment=null, editorMode, onContentChanged, onPenClicked, editable=true }) {

  return (
    <>
      <div className="comment">
        <Row>
          <Col sm={{ span: 10, offset: 1 }} md={{ span: 8, offset: 2 }}>
            <hr className="mt-0 mb-1" />
          </Col>
        </Row>
        <Row>
          <Col xs={{ span: 6 }} sm={{ span: 5, offset: 1 }} md={{ span: 4, offset: 2 }} >
            <h5 className="fw-normal">{comment?comment.writerName:'New'}</h5>
          </Col>
          <Col xs={{ span: 6 }} sm={{ span: 5 }} md={{ span: 4 }}>
            {comment && <h6 className="commentCreationTime text-end">Created, {comment.creationTime}</h6>}
          </Col>
        </Row>
        {comment && comment.creationTime !== comment.lastUpdateTime && <Row className="commentLastUpdateTimeRow">
          <Col xs={{ span: 6 }} sm={{ span: 5, offset: 1 }} md={{ span: 4, offset: 2 }}>
          </Col>
          <Col xs={{ span: 6 }} sm={{ span: 5 }} md={{ span: 4 }} >
            <p className="commentLastUpdateTime fs-6 text-end">Updated, {comment.lastUpdateTime}</p>
          </Col>
        </Row>}
        <Row>
          <Col xs={{ span: 12 }} sm={{ span: 10, offset: 1 }} md={{ span: 8, offset: 2 }}>
            <Editor editorId={commentIndex} mode={editorMode} content={comment?comment.content:''} onPenClicked={onPenClicked} onContentChanged={onContentChanged} editable={editable}/>
          </Col>
        </Row>
      </div>
    </>
  )
}