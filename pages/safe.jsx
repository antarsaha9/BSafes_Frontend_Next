import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux'
import { useRouter } from "next/router";
import Link from 'next/link'

import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'

import ContentPageLayout from '../components/layouts/contentPageLayout';
import Workspace from '../components/workspace'
import SaveAccountRecoveryModal from '../components/saveAccountRecoverModal';

import BSafesStyle from '../styles/BSafes.module.css'

import { setDataCenterModal } from '../reduxStore/accountSlice';
import { setWorkspaceKeyReady, initContainer } from '../reduxStore/containerSlice';
import { abort } from "../reduxStore/pageSlice";

export default function Safe() {
  const router = useRouter();
  const dispatch = useDispatch();

  const [readyToList, setReadyToList] = useState(false);

  const newAccountCreated = useSelector(state => state.account.newAccountCreated);

  const memberId = useSelector(state => state.auth.memberId);
  const accountVersion = useSelector(state => state.auth.accountVersion);
  const workspaceKey = useSelector(state => state.auth.expandedKey);
  const searchKey = useSelector(state => state.auth.searchKey);
  const searchIV = useSelector(state => state.auth.searchIV);
  const workspaceId = useSelector(state => state.container.workspace);

  const handeHideSaveAccountRecovery = () => {
    dispatch(setDataCenterModal(true));
    router.push('/services/dataCenterSetup');
  }

  useEffect(() => {
    const handleRouteChange = (url, { shallow }) => {
      console.log(
        `App is changing to ${url} ${shallow ? 'with' : 'without'
        } shallow routing`
      )
      dispatch(abort());
    }

    router.events.on('routeChangeStart', handleRouteChange)

    // If the component is unmounted, unsubscribe
    // from the event with the `off` method:
    return () => {
      router.events.off('routeChangeStart', handleRouteChange)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (memberId && workspaceKey) {
      let currentKeyVersion;
      if (accountVersion === 'v1') {
        currentKeyVersion = 1;
      } else if (accountVersion === 'v2') {
        currentKeyVersion = 3;
      }

      const workspaceId = 'u:' + memberId + ':' + currentKeyVersion + ':' + '0';;
      dispatch(initContainer({ container: 'root', workspaceId, workspaceKey, searchKey, searchIV }));
      dispatch(setWorkspaceKeyReady(true));
      setReadyToList(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [memberId, workspaceKey])

  return (
    <div className={BSafesStyle.spaceBackground}>
      <ContentPageLayout>
        <Container fluid>
          <br />
          <br />
          <Row>
            <Col className="text-center">
              <Link href={`/activities/${workspaceId}`}>Activities</Link>
            </Col>
          </Row>
          <Row className="justify-content-center">
            <Col lg={8}>
              <Workspace readyToList={readyToList} />
            </Col>
          </Row>
        </Container>

        <SaveAccountRecoveryModal show={newAccountCreated} onHide={handeHideSaveAccountRecovery}/>

      </ContentPageLayout>
    </div>
  )
}