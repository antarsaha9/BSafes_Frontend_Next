import { useDispatch, useSelector } from 'react-redux';

import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';

import { answerSyncFailurePromptThunk } from '../reduxStore/localExportSlice';

/**
 * Shown during an export when the local backup couldn't be updated (e.g. no network).
 * Lets the user export what's already in the local backup, or stop the export.
 */
export default function ExportSyncFailureModal() {
    const dispatch = useDispatch();
    const prompt = useSelector(state => state.localExport.syncFailurePrompt);

    const answer = (exportAnyway) => dispatch(answerSyncFailurePromptThunk(exportAnyway));

    return (
        <Modal show={!!prompt} onHide={() => answer(false)} centered>
            <Modal.Header closeButton>
                <Modal.Title>Couldn&apos;t update your local backup</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <p>Before exporting, the app tries to bring your local backup up to date. This failed:</p>
                <p className='text-muted'><small>{prompt && prompt.reason}</small></p>
                <p className='mb-0'>
                    You can still export what&apos;s already in your local backup, but recent changes
                    (and anything not downloaded yet) may be missing.
                </p>
            </Modal.Body>
            <Modal.Footer>
                <Button variant='outline-secondary' onClick={() => answer(false)}>Cancel export</Button>
                <Button onClick={() => answer(true)}>Export anyway</Button>
            </Modal.Footer>
        </Modal>
    );
}
