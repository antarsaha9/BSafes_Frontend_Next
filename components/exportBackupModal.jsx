import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';

import { startExportThunk, loadLastFolderThunk } from '../reduxStore/localExportSlice';
import LoggedOutBackupViewingToggle from './loggedOutBackupViewingToggle';
import { showFolder, canShowFolder } from '../lib/exportFsAccess';

export default function ExportBackupModal({ show, onClose }) {
    const dispatch = useDispatch();
    const lastFolderName = useSelector(state => state.localExport.lastFolderName);
    const lastFolderPath = useSelector(state => state.localExport.lastFolderPath);

    useEffect(() => {
        if (show) dispatch(loadLastFolderThunk());
    }, [show, dispatch]);

    const startExport = (useLastFolder) => {
        onClose();
        dispatch(startExportThunk({ useLastFolder }));
    };

    return (
        <Modal show={show} onHide={onClose} centered>
            <Modal.Header closeButton>
                <Modal.Title><i className="fa fa-suitcase" aria-hidden="true"></i> Export Backup</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <p>All your content will be downloaded and saved <strong>decrypted</strong> as regular files. Anyone with access to that folder can read them.</p>
                {lastFolderName
                    ? <p className='mb-0'>
                        Export to: <strong><i className="fa fa-folder" aria-hidden="true"></i> {lastFolderName}</strong>
                        {canShowFolder() && <Button variant='link' size='sm' className='py-0' onClick={() => showFolder({ path: lastFolderPath })}>Show in folder</Button>}
                        <br /><small className='text-muted' style={{ wordBreak: 'break-all' }}>{lastFolderPath}</small>
                        <br /><small className='text-muted'>Pages already in this backup are updated in place.</small>
                    </p>
                    : <p className='mb-0 text-muted'>No export folder chosen yet.</p>}
                <hr />
                <LoggedOutBackupViewingToggle />
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
