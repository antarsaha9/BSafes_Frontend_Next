import { useEffect, useState } from "react";
import { Button, Col, Container, Row } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import ContentPageLayout from "../../components/layouts/contentPageLayout";
import { getDashboardDataThunk, getPaymentsHistory, getQuotasHistory } from "../../reduxStore/accountSlice";
import BSafesStyle from '../../styles/BSafes.module.css'
import format from "date-fns/format";

export default function Dashboard(props) {
    const dashboard = useSelector(state => state.account.dashboard);
    const memberId = useSelector(state => state.auth.memberId);
    const [showHistoryTable, setShowHistoryTable] = useState(false);
    const [showQuotaTable, setShowQuotaTable] = useState(false);
    const [paymentLastEvaluatedKey, setPaymentLastEvaluatedKey] = useState(null);
    const [quotaLastEvaluatedKey, setQuotaLastEvaluatedKey] = useState(null);
    const [quotaHistory, setQuotaHistory] = useState([]);
    const [paymentHistory, setPaymentHistory] = useState([]);
    const dispatch = useDispatch();
    useEffect(() => {
        if (memberId)
            dispatch(getDashboardDataThunk());
    }, [memberId, dispatch]);
    const handleShowQuotaTable = () => {
        setShowQuotaTable(true);
        getQuotasHistory(paymentLastEvaluatedKey).then(res => {
            if (res.LastEvaluatedKey)
                setQuotaLastEvaluatedKey(res.LastEvaluatedKey);
            setQuotaHistory(quotaHistory.concat(res.items.map(i => ({ ...i, date: format(new Date(i.date), 'dd/LL/yyyy') }))));
        })
    }
    const handleShowHistoryTable = () => {
        setShowHistoryTable(true);
        getPaymentsHistory().then(res => {
            if (res.LastEvaluatedKey)
                setPaymentLastEvaluatedKey(res.LastEvaluatedKey);
            setPaymentHistory(paymentHistory.concat(res.items.map(i => ({ ...i, event: i.recurring ? "Subscription" : "Bought Quotas" }))));
        })
    }
    return (
        <div className={BSafesStyle.spaceBackground}>
            <ContentPageLayout>
                <Container>
                    <Row>
                        <Col xs={12} className="text-center">
                            <h1>Dashboard</h1>
                        </Col>
                    </Row>
                    <br />
                    <Row>
                        <Col xs={12}>
                            <div className="bg-white" style={{ overflowX: "auto" }}>
                                <table className="table table-striped table-hover ">
                                    <thead>
                                        <tr className="table-info">
                                            <th colSpan={2}>Account</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td>Id</td>
                                            <td className="fw-bold">
                                                {dashboard.id}
                                            </td>
                                        </tr>
                                        <tr>
                                            <td>Status</td>
                                            <td className="fw-bold">
                                                {dashboard.status}
                                            </td>
                                        </tr>
                                        <tr>
                                            <td>Signed-Up Date</td>
                                            <td className="fw-bold">
                                                {dashboard.signedUpDate}
                                            </td>
                                        </tr>
                                        <tr>
                                            <td>Subscription Date</td>
                                            <td className="fw-bold">
                                                {dashboard.subscriptionDate}
                                            </td>
                                        </tr>
                                        <tr>
                                            <td>Billing Day</td>
                                            <td className="fw-bold">
                                                {dashboard.billingDayOfMonth}
                                            </td>
                                        </tr>
                                        <tr>
                                            <td>Extra Quotas</td>
                                            <td className="fw-bold">
                                                {dashboard.extraQuotas}
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </Col>
                    </Row>
                    <Row>
                        <Col xs={12}>
                            <div className="bg-white">
                                <table className="table table-striped table-hover ">
                                    <thead>
                                        <tr className="table-success">
                                            <th colSpan={3}>Usages</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td># of item versions</td>
                                            <td className="fw-bold">
                                                {dashboard.totalItemVersions}
                                            </td>
                                            <td className="fw-bold">
                                                {dashboard.unusedItemVersions} available
                                            </td>
                                        </tr>
                                        <tr>
                                            <td>Total Storage</td>
                                            <td className="fw-bold">
                                                {dashboard.totalStorage} GB
                                            </td>
                                            <td className="fw-bold">
                                                {dashboard.unusedStorage} GB available
                                            </td>
                                        </tr>
                                        <tr>
                                            <td>Bandwidth</td>
                                            <td className="fw-bold">
                                                {dashboard.bandwidth} GB
                                            </td>
                                            <td className="fw-bold">
                                                {dashboard.unusedBandwidth} GB available
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </Col>
                    </Row>
                    <br />
                    <Row>
                        <Col xs={12}>
                            <h3>Quotas History</h3>
                            {showQuotaTable || <Button variant="link" onClick={handleShowQuotaTable}>View</Button>}
                        </Col>
                    </Row>
                    <br />
                    {showQuotaTable && <Row id="quotasHistory" className="hidden">
                        <Col cs={12}>
                            <div className="bg-white" style={{ overflowX: "auto" }}>
                                <table className="table table-striped table-hover ">
                                    <thead id="quotasHistoryTableHead">
                                        <tr className="table-warning">
                                            <th>Date</th>
                                            <th>Extra Quotas</th>
                                            <th>Quotas In Use</th>
                                            <th>Event</th>
                                            <th>Item Quotas In Use</th>
                                            <th>Storage Quotas In Use</th>
                                            <th>Bandwidth Quotas In Use</th>
                                            <th># of item versions</th>
                                            <th>Total storage</th>
                                            <th>Bandwidth</th>
                                        </tr>
                                    </thead>
                                    <tbody id="quotasHistoryTableBody">
                                        {quotaHistory.map((q, i) =>
                                        (<tr key={i}>
                                            <td id="date">{q.date}</td>
                                            <td id="extraQuotas">{q.extraQuotas}</td>
                                            <td id="quotasInUse">{q.quotasInUse}</td>
                                            <td id="event">{q.event}</td>
                                            <td id="itemQuotasInUse">{q.itemQuotasInUse}</td>
                                            <td id="storageQuotasInUse">{q.storageQuotasInUse}</td>
                                            <td id="bandwidthQuotasInUse">{q.bandwidthQuotasInUse}</td>
                                            <td id="totalItemVersions">{q.totalItemVersions}</td>
                                            <td id="totalStorage">{q.totalStorage}</td>
                                            <td id="bandwidth">{q.bandwidth}</td>
                                        </tr>))}
                                    </tbody>
                                </table>
                                {quotaLastEvaluatedKey ?
                                    <Button variant="link" onClick={handleShowQuotaTable}>More</Button>
                                    :
                                    <span id="endOfQuotas">End</span>
                                }
                            </div>
                        </Col>
                    </Row>}
                    <Row>
                        <Col xs={12}>
                            <h3>Payments History</h3>
                            {showHistoryTable || <Button variant="link" onClick={handleShowHistoryTable}>View</Button>}
                        </Col>
                    </Row>
                    <br />
                    {showHistoryTable && <Row>
                        <Col xs={12}>
                            <div className="bg-white" style={{ overflowX: "auto" }}>
                                <table className="table table-striped table-hover ">
                                    <thead>
                                        <tr className="table-success">
                                            <th>Date</th>
                                            <th>Amount</th>
                                            <th>Event</th>
                                        </tr>
                                    </thead>
                                    <tbody id="paymentsHistoryTableBody">
                                        {paymentHistory.map((ph, i) => (
                                            <tr key={i}>
                                                <td id="date">{ph.time}</td>
                                                <td id="amount">{ph.amount}</td>
                                                <td id="event">{ph.event}</td>
                                            </tr>))}
                                    </tbody>
                                </table>
                                {paymentLastEvaluatedKey ?
                                    <Button variant="link" onClick={handleShowHistoryTable}>More</Button>
                                    : <span id="endOfPayments">End</span>}
                            </div>
                        </Col>
                    </Row>}
                    <br />
                </Container >
            </ContentPageLayout >
        </div >
    )

}