import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Button from "react-bootstrap/Button";
import Col from "react-bootstrap/Col";
import Container from "react-bootstrap/Container";
import Form from "react-bootstrap/Form";
import Row from "react-bootstrap/Row";
import { useDispatch, useSelector } from "react-redux";
import ContentPageLayout from "../components/layouts/contentPageLayout";
import { getMFADataThunk, verifyMFAToken } from "../reduxStore/accountSlice";
import BSafesStyle from '../styles/BSafes.module.css'

export default function MFAVerify(props) {
    const mfa = useSelector(state => state.account.mfa);
    const memberId = useSelector(state => state.auth.memberId);
    const [token, setToken] = useState('');
    const [extraMFAEnabled, setExtraMFAEnabled] = useState(false);
    const dispatch = useDispatch();
    const router = useRouter()

    useEffect(() => {
        if (memberId)
            dispatch(getMFADataThunk());
    }, [memberId, dispatch]);

    useEffect(() => {
        if (mfa?.mfaEnabled)
            setExtraMFAEnabled(true);
    }, [mfa])
    const handleVerify = async () => {
        try {
            await verifyMFAToken(token);
            setToken('');
            router.push('/teams')
        } catch (error) {
            alert(error);
        }
    }
    return (
        <div className={BSafesStyle.spaceBackground}>
            <ContentPageLayout>
                <Container>
                    <Row>
                        <Col xs={12} className="text-center">
                            <h1>Multi-Factor Authentication</h1>
                        </Col>
                    </Row>
                    <Row>
                        {extraMFAEnabled ? <>
                            <Col xs={12}>
                                <Form.Group className="mb-2">
                                    <Form.Label htmlFor="basic-url">Please enter the token</Form.Label>
                                    <Form.Control id="basic-url" aria-describedby="basic-addon3" value={token} onChange={e => setToken(e.target.value)} />
                                </Form.Group>

                                <Button variant="primary" className="py-2" onClick={handleVerify}>Verify</Button>
                            </Col></> :
                            ''}
                    </Row>
                </Container >
            </ContentPageLayout >
        </div >
    )

}