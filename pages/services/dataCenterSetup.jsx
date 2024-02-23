import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter } from 'next/router';

import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import Container from 'react-bootstrap/Container';

import ContentPageLayout from "../../components/layouts/contentPageLayout";

import { changeDataCenterThunk, getDataCentersThunk } from '../../reduxStore/accountSlice';

export default function DataCenterSetup() {
    const dispatch = useDispatch();

    const dataCenterModal = useSelector(state=>state.account.dataCenterModal);
    const dataCenters = useSelector(state => state.account.dataCenters);
    const nearestDataCenter = useSelector(state => state.account.nearestDataCenter);
    const isLoggedIn = useSelector(state => state.auth.isLoggedIn);

    const getDataCenters = () => {
        dispatch(getDataCentersThunk());
    }

    useEffect(() => {
        if (isLoggedIn)
            dispatch(getDataCentersThunk());
    }, [isLoggedIn]);

    return (
        <ContentPageLayout showNaveBar={!dataCenterModal} showPathRow={!dataCenterModal}>
            <Container>
                <div className='mt-2'>
                    <Row>
                        <Col>
                            <h2><i className="fa fa-globe" aria-hidden="true"></i> Select your preferred Data Center</h2>
                            <hr/>
                            <p>If you have a data center nearby, you can access your data much faster.</p>
                        </Col>
                    </Row>
                    <Button hidden onClick={getDataCenters}>Get Data Centers</Button>
                    <Row>
                        <Col>
                            {dataCenters && dataCenters.map((continents, index) => (
                                <div key={index} className='mb-2 mt-4'>
                                    <div><h5>{continents.continent}</h5></div>
                                    <hr className='mt-0' />
                                    <div className='d-flex flex-wrap'>
                                        {continents.dataCenters.map((region, index) => (
                                            <div key={index} className='mx-2' style={{ maxWidth: '9rem' }}>
                                                <Button
                                                    size='md'
                                                    variant={region.selected ? 'success' : 'secondary'}
                                                    disabled={region.selected}
                                                    className='text-capitalize my-2'
                                                /*onClick={_askSelection.bind(null, region)}*/
                                                >
                                                    {region.location}
                                                    <div style={{ fontSize: 'x-small', position: 'absolute', right: '5px', bottom: '0px' }}>{region.name}</div>
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </Col>
                    </Row>
                </div>
            </Container>
        </ContentPageLayout>
    )
}