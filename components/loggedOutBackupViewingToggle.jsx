import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import Form from 'react-bootstrap/Form';

import { loadAllowLoggedOutViewingThunk, changeAllowLoggedOutViewingThunk } from '../reduxStore/localExportSlice';

export default function LoggedOutBackupViewingToggle({ className }) {
    const dispatch = useDispatch();
    const isLoggedIn = useSelector(state => state.auth.isLoggedIn);
    const allowLoggedOutViewing = useSelector(state => state.localExport.allowLoggedOutViewing);

    useEffect(() => {
        if (allowLoggedOutViewing === null) dispatch(loadAllowLoggedOutViewingThunk());
    }, [allowLoggedOutViewing, dispatch]);

    if (!isLoggedIn) return null;

    return (
        <Form.Check
            type='switch'
            id='allowLoggedOutBackupViewing'
            className={className}
            checked={!!allowLoggedOutViewing}
            disabled={allowLoggedOutViewing === null}
            onChange={(e) => dispatch(changeAllowLoggedOutViewingThunk(e.target.checked))}
            label={<>
                Allow viewing backups on this computer without logging in
                <br /><small className='text-muted'>Anyone using this computer could then browse your backups in the app.</small>
            </>}
        />
    );
}
