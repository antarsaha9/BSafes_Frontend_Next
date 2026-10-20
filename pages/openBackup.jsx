import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter } from 'next/router';

import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Button from 'react-bootstrap/Button';
import Alert from 'react-bootstrap/Alert';
import Spinner from 'react-bootstrap/Spinner';

import ContentPageLayout from '../components/layouts/contentPageLayout';
import LoggedOutBackupViewingToggle from '../components/loggedOutBackupViewingToggle';

import { localExportActivity } from '../lib/activities';
import { showFolder, canShowFolder } from '../lib/exportFsAccess';
import {
    openBackupInBrowserThunk, answerOpenProblemsThunk, cancelOpenBackupThunk,
    loadAllowLoggedOutViewingThunk, loadLastFolderThunk, clearOpenBackup
} from '../reduxStore/localExportSlice';

const REASON_TEXT = { changed: 'changed', missing: 'missing', unreadable: "can't be read" };

/**
 * Opens an exported backup in the user's web browser (the app doesn't show backups itself).
 * Before opening, the backup is checked for files changed or deleted outside the app.
 */
export default function OpenBackup() {
    const dispatch = useDispatch();
    const router = useRouter();

    const isLoggedIn = useSelector(state => state.auth.isLoggedIn);
    const activity = useSelector(state => state.localExport.activity);
    const lastFolderName = useSelector(state => state.localExport.lastFolderName);
    const lastFolderPath = useSelector(state => state.localExport.lastFolderPath);
    const allowLoggedOutViewing = useSelector(state => state.localExport.allowLoggedOutViewing);
    const openBackupError = useSelector(state => state.localExport.openBackupError);
    const openBackupMessage = useSelector(state => state.localExport.openBackupMessage);
    const openCheck = useSelector(state => state.localExport.openCheck);

    const busy = (activity & localExportActivity.OpenBackup) !== 0;
    const blockedWhileLoggedOut = !isLoggedIn && allowLoggedOutViewing === false;

    useEffect(() => {
        if (!isLoggedIn) dispatch(loadAllowLoggedOutViewingThunk());
        dispatch(loadLastFolderThunk());
    }, [isLoggedIn, dispatch]);

    useEffect(() => {
        dispatch(clearOpenBackup()); // don't show messages left from an earlier visit
        return () => {
            dispatch(cancelOpenBackupThunk()); // stop a check that is still running
        };
    }, [dispatch]);

    const exit = () => router.push(isLoggedIn ? '/safe' : '/logIn');

    if (process.env.NEXT_PUBLIC_app !== 'localBackup') {
        return (
            <ContentPageLayout>
                <Container className='mt-4'><p>Opening a local backup is only available in the desktop app.</p></Container>
            </ContentPageLayout>
        );
    }

    if (blockedWhileLoggedOut) {
        return (
            <ContentPageLayout showPathRow={false}>
                <Container className='mt-4'>
                    <h4><i className="fa fa-archive" aria-hidden="true"></i> Local Backup</h4>
                    <p>Please log in to view your backups.</p>
                    <p className='text-muted'>To view backups on this computer without logging in, log in and turn on &quot;Allow viewing backups on this computer without logging in&quot; on this page or in the Export Backup dialog.</p>
                    <Button onClick={() => router.push('/logIn')}>Go to login</Button>
                </Container>
            </ContentPageLayout>
        );
    }

    const renderCheck = () => {
        if (!openCheck) return null;
        if (openCheck.status === 'checking') {
            return (
                <Alert variant='light' className='d-flex align-items-center'>
                    <Spinner animation='border' size='sm' className='me-2' />
                    <span className='flex-grow-1'>Checking the backup for changed files... {openCheck.pagesChecked} pages checked</span>
                    <Button size='sm' variant='outline-secondary' onClick={() => dispatch(cancelOpenBackupThunk())}>Cancel</Button>
                </Alert>
            );
        }
        return (
            <Alert variant='warning'>
                <Alert.Heading>Some files in this backup were changed outside the app</Alert.Heading>
                <p>
                    {openCheck.problems.length} of {openCheck.pagesChecked} pages in &quot;{openCheck.folderName}&quot; don&apos;t match what was exported,
                    so they may not show your real content. Export to this folder again to repair them.
                </p>
                <ul style={{ maxHeight: '40vh', overflowY: 'auto' }}>
                    {openCheck.problems.map((page) => (
                        <li key={page.relPath}>
                            <strong>{page.title || 'Untitled'}</strong>
                            <ul className='mb-1'>
                                {page.files.map((f) => <li key={f.path}><small>{f.path}: {REASON_TEXT[f.reason] || f.reason}</small></li>)}
                            </ul>
                        </li>
                    ))}
                </ul>
                <div className='d-flex justify-content-end'>
                    <Button variant='outline-secondary' className='me-2' onClick={() => dispatch(answerOpenProblemsThunk(false))}>Cancel</Button>
                    <Button variant='warning' onClick={() => dispatch(answerOpenProblemsThunk(true))}>Open anyway</Button>
                </div>
            </Alert>
        );
    };

    return (
        <ContentPageLayout showPathRow={false}>
            <Container className='mt-3 mb-5'>
                <Row className='align-items-center mb-3'>
                    <Col>
                        <h4 className='mb-0'><i className="fa fa-archive" aria-hidden="true"></i> Local Backup</h4>
                    </Col>
                    <Col xs='auto'>
                        <Button variant='outline-secondary' size='sm' onClick={exit}>
                            <i className="fa fa-sign-out" aria-hidden="true"></i> Exit
                        </Button>
                    </Col>
                </Row>

                <LoggedOutBackupViewingToggle className='mb-3' />

                <p className='text-muted'>Your backup opens in your web browser. No login or network is needed to read it there.</p>

                {lastFolderName ? (
                    <p>
                        Backup folder: <strong><i className="fa fa-folder" aria-hidden="true"></i> {lastFolderName}</strong>
                        {canShowFolder() && <Button variant='link' size='sm' className='py-0' onClick={() => showFolder({ path: lastFolderPath })}>Show in folder</Button>}
                        <br /><small className='text-muted' style={{ wordBreak: 'break-all' }}>{lastFolderPath}</small>
                    </p>
                ) : (
                    <p className='text-muted'>No backup folder chosen yet.</p>
                )}

                <div className='mb-3'>
                    {lastFolderName && (
                        <Button className='me-2' onClick={() => dispatch(openBackupInBrowserThunk({ useLastFolder: true }))} disabled={busy}>
                            <i className="fa fa-external-link" aria-hidden="true"></i> Open in browser
                        </Button>
                    )}
                    <Button variant={lastFolderName ? 'outline-primary' : 'primary'} onClick={() => dispatch(openBackupInBrowserThunk())} disabled={busy}>
                        {lastFolderName ? 'Choose another folder…' : 'Choose backup folder…'}
                    </Button>
                </div>

                {renderCheck()}
                {openBackupError && <Alert variant='danger'>{openBackupError}</Alert>}
                {openBackupMessage && <Alert variant='success'>{openBackupMessage}</Alert>}
            </Container>
        </ContentPageLayout>
    );
}
