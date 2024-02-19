import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Row from 'react-bootstrap/Row';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import Container from 'react-bootstrap/Container';
import { useDispatch, useSelector } from 'react-redux';
import ContentPageLayout from "../../components/layouts/contentPageLayout";
import { changeDataCenterThunk, getDataCentersThunk } from '../../reduxStore/accountSlice';

export default function DataCenterSetup(props) {
    const router = useRouter();
    const [askSelection, setAskSelection] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const dataCenters = useSelector(state => state.account.dataCenters);
    const nearestDC = useSelector(state => state.account.nearestDC);
    const isLoggedIn = useSelector(state => state.auth.isLoggedIn);

    const dispatch = useDispatch();
    useEffect(() => {
        if (isLoggedIn)
            dispatch(getDataCentersThunk());
    }, [isLoggedIn]);

    const handleSave = () => {
        dispatch(changeDataCenterThunk(askSelection, router.push.bind(null, '/safe')));
        setAskSelection(null);
        setShowModal(false);
    };

    const _askSelection = (region) => {
        setAskSelection(region);
        setShowModal(true);
    }


    const handleCancel = () => {
        setAskSelection(null);
        setShowModal(false);
    };


    return (
        <ContentPageLayout>
            <Container>
                <div className='mt-5'>
                    <h1>Select your preferred Data Center</h1>
                    <div className='mt-3'>
                        {nearestDC && <div className='mb-2 mt-4'>
                            <div>Recomended region</div>
                            <hr className='mt-0' />
                            <Row>
                                <div className='d-flex'>
                                    <div className='mx-2' style={{ maxWidth: '9rem' }}>
                                        <Button
                                            size='md'
                                            variant={nearestDC.selected ? 'success' : 'secondary'}
                                            disabled={nearestDC.selected}
                                            className='text-capitalize my-2'
                                            onClick={_askSelection.bind(null, nearestDC)}
                                        >
                                            {nearestDC.location}
                                            <div style={{ fontSize: 'x-small', position: 'absolute', right: '5px', bottom: '0px' }}>{nearestDC.name}</div>
                                        </Button>
                                    </div>
                                </div>
                            </Row>
                        </div>}
                        {dataCenters && dataCenters.map((continents, index) => (
                            <div key={index} className='mb-2 mt-4'>
                                <div>{continents.continent}</div>
                                <hr className='mt-0' />
                                <Row>
                                    <div className='d-flex'>
                                        {continents.regions.map((region, index) => (
                                            <div key={index} className='mx-2' style={{ maxWidth: '9rem' }}>
                                                <Button
                                                    size='md'
                                                    variant={region.selected ? 'success' : 'secondary'}
                                                    disabled={region.selected}
                                                    className='text-capitalize my-2'
                                                    onClick={_askSelection.bind(null, region)}
                                                >
                                                    {region.location}
                                                    <div style={{ fontSize: 'x-small', position: 'absolute', right: '5px', bottom: '0px' }}>{region.name}</div>
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                </Row>
                            </div>
                        ))}
                    </div>
                </div>

                <Modal show={showModal} onHide={handleCancel}>
                    <Modal.Header closeButton>
                        <Modal.Title>Confirm Selection</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <p>Are you sure to select <b>{askSelection?.location}</b> as your Data Center?</p>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={handleCancel}>
                            Cancel
                        </Button>
                        <Button variant="primary" onClick={handleSave}>
                            Yes
                        </Button>
                    </Modal.Footer>
                </Modal>
            </Container>
        </ContentPageLayout>
    );
}