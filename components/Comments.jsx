import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { Col, Row } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import { getPageCommentsThunk } from "../reduxStore/pageSlice";
import Editor from "./editor";

export default function Comments({ editorMode, handlePenClicked, editingEditorId, editable }) {
  const router = useRouter();
  const dispatch = useDispatch();
  const { itemId } = router.query;
  const itemComments = useSelector(state => state.page.itemComments);

  useEffect(() => {
    if (itemId) {
      dispatch(getPageCommentsThunk({ itemId }));
    }
  }, [itemId]);

  return (
    <div class="comments">
      <Row>
        <Col sm={{ span: 10, offset: 1 }} md={{ span: 8, offset: 2 }}>
          <h4>Comments</h4>
        </Col>
      </Row>
      {/* comments */}
      {itemComments?.map((p, i) => <CommentCard {...{ ...p, editorMode, handlePenClicked, editingEditorId, editable }} key={i} />)}
      <CommentCard {...{ editorMode, handlePenClicked, editingEditorId, editable }} />
    </div>
  )

}

function CommentCard({ writerName = 'New', creationTime, lastUpdateTime, content, id, editorMode, handlePenClicked, editingEditorId, editable }) {
  const newComment = writerName === 'New';
  const editorId = "comment-" + id || 'New';
  var commentEditorMode = 'ReadOnly';
  if (editorMode === 'Writing') {
    if (editingEditorId === editorId)
      commentEditorMode = editorMode;
  }
  // const [editorMode, setEditorMode] = useState("ReadOnly");
  // const handleClick = () => {
  //   console.log('called');
  //   setEditorMode('Writing');
  // }
  return (
    <>
      <div class="comment">
        <Row>
          <Col sm={{ span: 10, offset: 1 }} md={{ span: 8, offset: 2 }}>
            <hr class="marginTopBottom0Px" />
          </Col>
        </Row>
        <Row>
          <Col sm={{ span: 5, offset: 1 }} md={{ span: 4, offset: 2 }} xs={{ span: 6 }} >
            <h5 class="commentWriterName">{writerName}</h5>
          </Col>
          <Col xs={{ span: 6 }} sm={{ span: 5 }} md={{ span: 4 }}>
            {!newComment && <h6 class="commentCreationTime textAlignRight">Created, {creationTime}</h6>}
          </Col>
        </Row>
        {creationTime !== lastUpdateTime && <Row class="commentLastUpdateTimeRow">
          <Col xs={{ span: 6 }} sm={{ span: 5 }} md={{ span: 4 }}>
          </Col>
          <Col xs={{ span: 6 }} sm={{ span: 5 }} md={{ span: 4 }} >
            <p class="commentLastUpdateTime fontSize14Px textAlignRight">Updated, {lastUpdateTime}</p>
          </Col>
        </Row>}
        <Row>
          <Col xs={{ span: 6 }} sm={{ span: 10, offset: 1 }} md={{ span: 8, offset: 2 }}>
            <Editor editorId={editorId} mode={editorMode} content={content} editable={editable} onPenClicked={handlePenClicked} />
          </Col>
        </Row>
      </div>
    </>
  )
}