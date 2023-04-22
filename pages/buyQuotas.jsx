import { useEffect, useState, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux'
import Link from 'next/link';

import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import InputGroup from 'react-bootstrap/InputGroup';
import Modal from 'react-bootstrap/Modal';
import Spinner from 'react-bootstrap/Spinner';

import ContentPageLayout from '../components/layouts/contentPageLayout';

import BSafesStyle from '../styles/BSafes.module.css'

import { buyingQuotas, getPaymentMethodInfoThunk } from '../reduxStore/accountSlice';

export default function Safe() {
    const dispatch = useDispatch();
    const memberId = useSelector(state => state.auth.memberId);
    const paymentMethodInfo = useSelector(state => state.account.paymentMethodInfo);
    const activity = useSelector(state => state.account.activity);
    const [packs, setPacks] = useState(1);
    const [subscribed, setSubscribed] = useState(false);
    const [showPayAgain, setShowPayAgain] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [confirmation, setConfirmation] = useState('');
    const [showSpinner, setShowSpinner] = useState(false);
    const confirmInputRef = useRef(null);

    useEffect(() => {
        if (memberId) {
            dispatch(getPaymentMethodInfoThunk())
        }
    }, [memberId])

    const handleBuyClick = () => {
        setShowModal(true);
    }
    const handleClick = () => {
        handleCloseTrigger();
        setShowSpinner(true);
        buyingQuotas({
            packs,
        }).then(res => {
            setSubscribed(true);
        }).catch(err => {
            setShowPayAgain(true);
        }).finally(() => {
            setShowSpinner(false);
        });
    }
    const handleModalOnEntered = () => {
        confirmInputRef.current.focus();
    }
    const handleCloseTrigger = () => {
        setConfirmation('');
        setShowModal(false);
    }
    const loading = (activity === 'Loading' || showSpinner);
    return (
        <div className={BSafesStyle.spaceBackground}>
            <ContentPageLayout>
                <Container>
                    {loading && <Spinner className={BSafesStyle.screenCenter} animation='border' />}

                    {subscribed ?
                        <div id="thankYouForPurchase">
                            <h1>Many thanks for your Purchase!</h1>
                            <Link href="/teams">Continue</Link>
                        </div> :
                        <div id="Buy">
                            <h1>Buy Quotas</h1>
                            <h3>1 Pack(10 Quotas), $9.99 usd </h3>
                            {showPayAgain && <h3 id="payAgain">{"Sorry, it didn't succeed, please try again."}</h3>}
                            <Row >
                                <Col xs={4} >
                                    <InputGroup className="mb-3">
                                        <Form.Control size="sm" type="number"
                                            value={packs}
                                            onChange={e => setPacks(e.target.value)}
                                            className='text-center'
                                        />
                                        <span>pack(s), ${9.99 * parseInt(packs || 0)} usd </span>
                                    </InputGroup>
                                </Col>
                            </Row>
                            {paymentMethodInfo && <>
                                <p>You would pay by </p>
                                <h5>{paymentMethodInfo}</h5>
                            </>}
                            <button onClick={handleBuyClick}>Buy</button>
                        </div>
                    }
                </Container>
            </ContentPageLayout>
            <Modal show={showModal} onEntered={handleModalOnEntered} onHide={handleCloseTrigger}>
                <Modal.Body>
                    <h3>Confirmed?</h3>
                    <Form >
                        <InputGroup className="mb-3">
                            <Form.Control ref={confirmInputRef} size="lg" type="text"
                                value={confirmation}
                                onChange={e => setConfirmation(e.target.value)}
                                placeholder="Yes"
                            />
                        </InputGroup>
                    </Form>
                    <Button variant="primary" className="pull-right mx-1 py-2" size="md" onClick={handleClick} disabled={confirmation !== 'Yes'}>
                        Go
                    </Button>
                    <Button variant="light" className="pull-right mx-1 py-2" size="md" onClick={handleCloseTrigger}>
                        Cancel
                    </Button>
                </Modal.Body>
            </Modal>
        </div >
    )
}