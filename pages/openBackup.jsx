import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter } from 'next/router';

import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Button from 'react-bootstrap/Button';
import Alert from 'react-bootstrap/Alert';
import ListGroup from 'react-bootstrap/ListGroup';
import Breadcrumb from 'react-bootstrap/Breadcrumb';
import Spinner from 'react-bootstrap/Spinner';

import ContentPageLayout from '../components/layouts/contentPageLayout';
import LoggedOutBackupViewingToggle from '../components/loggedOutBackupViewingToggle';

import { localExportActivity } from '../lib/activities';
import {
    openBackupFolderThunk, openBackupChildThunk, openBackupBreadcrumbThunk,
    closeBackupItemThunk, closeBackupThunk, loadAllowLoggedOutViewingThunk
} from '../reduxStore/localExportSlice';

const ICON_BY_TYPE = {
    Workspace: 'fa-home',
    Box: 'fa-archive',
    Folder: 'fa-folder',
    Notebook: 'fa-book',
    Diary: 'fa-calendar',
};

function typeIcon(type) {
    return ICON_BY_TYPE[type] || 'fa-file-text-o';
}

export default function OpenBackup() {
    const dispatch = useDispatch();
    const router = useRouter();

    const isLoggedIn = useSelector(state => state.auth.isLoggedIn);
    const activity = useSelector(state => state.localExport.activity);
    const backupManifest = useSelector(state => state.localExport.backupManifest);
    const openBackupError = useSelector(state => state.localExport.openBackupError);
    const currentContainerManifest = useSelector(state => state.localExport.currentContainerManifest);
    const breadcrumbs = useSelector(state => state.localExport.breadcrumbs);
    const viewingItem = useSelector(state => state.localExport.viewingItem);

    const loading = (activity & localExportActivity.OpenBackup) !== 0;

    const exitBackup = () => {
        dispatch(closeBackupThunk());
        router.push(isLoggedIn ? '/safe' : '/logIn');
    };

    const lastFolderName = useSelector(state => state.localExport.lastFolderName);
    const allowLoggedOutViewing = useSelector(state => state.localExport.allowLoggedOutViewing);
    const blockedWhileLoggedOut = !isLoggedIn && allowLoggedOutViewing === false;

    useEffect(() => {
        if (!isLoggedIn) dispatch(loadAllowLoggedOutViewingThunk());
        if (!backupManifest) dispatch(openBackupFolderThunk({ autoOpen: true }));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isLoggedIn, dispatch]);

    useEffect(() => {
        if (blockedWhileLoggedOut && backupManifest) dispatch(closeBackupThunk());
    }, [blockedWhileLoggedOut, backupManifest, dispatch]);

    useEffect(() => {
        return () => {
            dispatch(closeBackupItemThunk());
        };
    }, [dispatch]);

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

    const renderListing = () => (
        <ListGroup>
            {currentContainerManifest.children.length === 0 && <ListGroup.Item>This is empty.</ListGroup.Item>}
            {currentContainerManifest.children.map((child) => (
                <ListGroup.Item key={child.id} action onClick={() => dispatch(openBackupChildThunk(child))} disabled={loading}>
                    <i className={`fa ${typeIcon(child.type)} me-2`} aria-hidden="true"></i>
                    {child.title || <em>Untitled</em>}
                </ListGroup.Item>
            ))}
        </ListGroup>
    );

    const renderItem = () => (
        <>
            <Button variant='link' className='ps-0' onClick={() => dispatch(closeBackupItemThunk())}>
                <i className="fa fa-arrow-left" aria-hidden="true"></i> Back to {currentContainerManifest.title || 'list'}
            </Button>
            {viewingItem.tampered ? (
                <Alert variant='danger'>
                    <Alert.Heading>This item was modified outside the app</Alert.Heading>
                    <p>
                        &quot;{viewingItem.title || 'Untitled'}&quot; no longer matches what was exported, so it can&apos;t be shown as a trusted backup.
                        The files on disk were not changed by this check.
                    </p>
                    <ul className='mb-0'>
                        {viewingItem.tamperedFiles.map((f) => (
                            <li key={f.path}>{f.path} ({f.reason === 'missing' ? 'missing' : 'contents changed'})</li>
                        ))}
                    </ul>
                </Alert>
            ) : (
                <div style={{ overflowX: 'auto' }} dangerouslySetInnerHTML={{ __html: viewingItem.bodyHtml }} />
            )}
        </>
    );

    return (
        <ContentPageLayout showPathRow={false}>
            <Container className='mt-3 mb-5'>
                <Row className='align-items-center mb-2'>
                    <Col>
                        <h4 className='mb-0'><i className="fa fa-archive" aria-hidden="true"></i> Local Backup</h4>
                        {backupManifest && (
                            <small className='text-muted'>
                                {lastFolderName ? `${lastFolderName} · ` : ''}
                                {backupManifest.displayName ? `${backupManifest.displayName} · ` : ''}
                                exported {new Date(backupManifest.exportedAt).toLocaleString()}
                            </small>
                        )}
                    </Col>
                    <Col xs='auto'>
                        {loading && <Spinner animation='border' size='sm' className='me-2' />}
                        <Button variant='outline-secondary' size='sm' className='me-2' onClick={exitBackup}>
                            <i className="fa fa-sign-out" aria-hidden="true"></i> Exit
                        </Button>
                        {!backupManifest && lastFolderName && (
                            <Button size='sm' className='me-2' onClick={() => dispatch(openBackupFolderThunk({ useLastFolder: true }))} disabled={loading}>
                                <i className="fa fa-folder-open" aria-hidden="true"></i> Open {lastFolderName}
                            </Button>
                        )}
                        <Button size='sm' variant={!backupManifest && !lastFolderName ? 'primary' : 'outline-primary'} onClick={() => dispatch(openBackupFolderThunk())} disabled={loading}>
                            {backupManifest || lastFolderName ? 'Choose another folder…' : 'Open backup folder'}
                        </Button>
                    </Col>
                </Row>

                <LoggedOutBackupViewingToggle className='mb-3' />

                {openBackupError && <Alert variant='warning'>{openBackupError}</Alert>}

                {!backupManifest && !openBackupError && (
                    <p className='text-muted mt-4'>Choose a folder you previously exported with &quot;Export Backup&quot; to browse it here. No login or network is needed.</p>
                )}

                {backupManifest && currentContainerManifest && (
                    <>
                        <Breadcrumb className='mt-2'>
                            {breadcrumbs.map((crumb, index) => (
                                <Breadcrumb.Item key={crumb.relPath} onClick={() => dispatch(openBackupBreadcrumbThunk(index))}>
                                    {crumb.title || 'Untitled'}
                                </Breadcrumb.Item>
                            ))}
                            <Breadcrumb.Item active>{currentContainerManifest.title || 'Untitled'}</Breadcrumb.Item>
                        </Breadcrumb>
                        {viewingItem ? renderItem() : renderListing()}
                    </>
                )}
            </Container>
        </ContentPageLayout>
    );
}
