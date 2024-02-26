import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter } from 'next/router';

import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import Container from 'react-bootstrap/Container';
import Badge from 'react-bootstrap/Badge';

import ContentPageLayout from "../../components/layouts/contentPageLayout";

import { changeDataCenterThunk, getDataCentersThunk } from '../../reduxStore/accountSlice';

export default function DataCenterSetup() {
    const dispatch = useDispatch();
    const router = useRouter();

    const dataCenterModal = useSelector(state => state.account.dataCenterModal);
    const dataCenters = useSelector(state => state.account.dataCenters);
    const currentDataCenter = useSelector(state => state.account.currentDataCenter);
    const isLoggedIn = useSelector(state => state.auth.isLoggedIn);

    const handleUserSelection = (dataCenter)=> {
        const result = confirm(`Are you sure to select ${dataCenter.location} as your data center?`);
        if(result) {
            dispatch(changeDataCenterThunk({dataCenter}));
        }
    }

    const handleAccept = () => {
        router.push('/safe');
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
                            <hr />
                            <p>You can access your data much faster with a data center nearby.</p>
                        </Col>
                    </Row>
                    <Row>
                        <Col>
                            <p>Your current data center is in</p>
                            <h1 className='text-center'><Badge bg="light">{currentDataCenter && currentDataCenter.location}</Badge></h1>
                            <br/>
                            <div hidden={!dataCenterModal} className='text-center'>
                                <Button onClick={handleAccept}>Accept</Button>
                                <br/>
                                <br/>
                            </div>
                            <p>You can change to a different location by clicking on it.</p>
                        </Col>
                    </Row>
                    <Row>
                        <Col>
                            {dataCenters && dataCenters.map((continents, index) => (
                                <div key={index} className='mb-2 mt-4'>
                                    <div><h5>{continents.continent}</h5></div>
                                    <hr className='mt-0' />
                                    <div className='d-flex flex-wrap'>
                                        {continents.dataCenters.map((dataCenter, index) => (
                                            <div key={index} className='mx-2' style={{ maxWidth: '9rem' }}>
                                                <Button
                                                    size='md'
                                                    variant={dataCenter.id === currentDataCenter.id ? 'success' : 'secondary'}
                                                    disabled={dataCenter.id === currentDataCenter.id}
                                                    className='text-capitalize my-2'
                                                    onClick={()=>handleUserSelection(dataCenter)}
                                                >
                                                    {dataCenter.location}
                                                    <div style={{ fontSize: 'x-small', position: 'absolute', right: '5px', bottom: '0px' }}>{dataCenter.name}</div>
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