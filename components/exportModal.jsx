import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';

import { startExportThunk, loadLastFolderThunk } from '../reduxStore/localExportSlice';
import { showFolder, canShowFolder } from '../lib/exportFsAccess';

export default function ExportModal({ show, onClose }) {
    const dispatch = useDispatch();
    const lastFolderName = useSelector(state => state.localExport.lastFolderName);
    const lastFolderPath = useSelector(state => state.localExport.lastFolderPath);
    const [updateFirst, setUpdateFirst] = useState(true);
    const [fullReexport, setFullReexport] = useState(false);

    useEffect(() => {
        if (show) dispatch(loadLastFolderThunk());
    }, [show, dispatch]);

    const startExport = (useLastFolder) => {
        onClose();
        dispatch(startExportThunk({ useLastFolder, updateFirst, fullReexport }));
    };

    return (
        <Modal show={show} onHide={onClose} centered>
            <Modal.Header closeButton>
                <Modal.Title><i className="fa fa-suitcase" aria-hidden="true"></i> Export</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <p>All your content will be downloaded and saved <strong>decrypted</strong> as regular files. Anyone with access to that folder can read them.</p>
                {lastFolderName
                    ? <p className='mb-0'>
                        Export to: <strong><i className="fa fa-folder" aria-hidden="true"></i> {lastFolderName}</strong>
                        {canShowFolder() && <Button variant='link' size='sm' className='py-0' onClick={() => showFolder({ path: lastFolderPath })}>Show in folder</Button>}
                        <br /><small className='text-muted' style={{ wordBreak: 'break-all' }}>{lastFolderPath}</small>
                        <br /><small className='text-muted'>Only new and changed pages are exported; pages deleted in the app are removed from the export.</small>
                    </p>
                    : <p className='mb-0 text-muted'>No export folder chosen yet.</p>}
                <Form.Check
                    type='checkbox'
                    id='exportUpdateLocalBackupFirst'
                    className='mt-3'
                    checked={updateFirst}
                    onChange={(e) => setUpdateFirst(e.target.checked)}
                    label={<>
                        Update the local backup first (recommended)
                        <br /><small className='text-muted'>
                            {updateFirst
                                ? 'Downloads your latest changes before exporting. Needs a network connection.'
                                : 'Exports only what is already in the local backup. Faster and works offline, but recent changes may be missing.'}
                        </small>
                    </>}
                />
                <Form.Check
                    type='checkbox'
                    id='exportFullReexport'
                    className='mt-2'
                    checked={fullReexport}
                    onChange={(e) => setFullReexport(e.target.checked)}
                    label={<>
                        Re-export everything (slower)
                        <br /><small className='text-muted'>Rebuilds every page, even ones that haven&apos;t changed.</small>
                    </>}
                />
            </Modal.Body>
            <Modal.Footer>
                <Button variant='secondary' onClick={onClose}>Cancel</Button>
                <Button variant={lastFolderName ? 'outline-primary' : 'primary'} onClick={() => startExport(false)}>
                    {lastFolderName ? 'Change folder…' : 'Choose folder…'}
                </Button>
                {lastFolderName && <Button variant='primary' onClick={() => startExport(true)}>Export</Button>}
            </Modal.Footer>
        </Modal>
    );
}
