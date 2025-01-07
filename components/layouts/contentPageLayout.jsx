import { useEffect, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useRouter } from "next/router";
import Script from 'next/script';

import { SafeArea } from 'capacitor-plugin-safe-area';

import Navbar from 'react-bootstrap/Navbar'
import Nav from 'react-bootstrap/Nav';
import NavDropdown from 'react-bootstrap/NavDropdown';
import Offcanvas from 'react-bootstrap/Offcanvas';
import Container from 'react-bootstrap/Container'
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Dropdown from 'react-bootstrap/Dropdown'
import Button from 'react-bootstrap/Button';

import { Blocks } from 'react-loader-spinner';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import ItemPath from '../itemPath'
import ItemsToolbar from '../itemsToolbar'
import ItemsMovingProgress from '../itemsMovingProgress';
import PaymentBanner from '../paymentBanner';
import VisitPaymentBanner from '../visitPaymentBanner';
import SuspendedModal from '../suspendedModal';

import BSafesStyle from '../../styles/BSafes.module.css'

import { debugLog } from '../../lib/helper';
import { getErrorMessages } from '../../lib/activities';

import { resetAccountActivity, setAccountHashVerified } from '../../reduxStore/accountSlice';
import { resetAuthActivity, preflightAsyncThunk, setPreflightReady, setLocalSessionState, createCheckSessionIntervalThunk, loggedOut, cleanMemoryThunk, setV2NextAuthStep, logOutAsyncThunk } from '../../reduxStore/auth';
import { resetContainerActivity } from '../../reduxStore/containerSlice';
import { resetPageActivity } from '../../reduxStore/pageSlice';
import { resetTeamActivity } from '../../reduxStore/teamSlice';
import { resetV1AccountActivity } from '../../reduxStore/v1AccountSlice';

import { setNextAuthStep, lockAsyncThunk, signOutAsyncThunk, signedOut } from '../../reduxStore/v1AccountSlice';

const hideFunction = (process.env.NEXT_PUBLIC_functions.indexOf('hide') !== -1)

const ContentPageLayout = ({ children, publicPage = false, publicHooks = null, showNaveBar = true, showNavbarMenu = true, showPathRow = true }) => {
    const debugOn = false;
    debugLog(false, "Rendering ContentPageLayout");

    SafeArea.getSafeAreaInsets().then(({ insets }) => {
        debugLog(debugOn, insets);
    });

    SafeArea.getStatusBarHeight().then(({ statusBarHeight }) => {
        debugLog(debugOn, 'statusbarHeight: ', statusBarHeight);
    });

    const router = useRouter();
    const dispatch = useDispatch();

    const [nextRoute, setNextRoute] = useState(null);

    const accountState = useSelector(state => state.account.accountState);
    debugLog(debugOn, "accountState: ", accountState);
    const accountActivity = useSelector(state => state.account.activity);
    const authActivity = useSelector(state => state.auth.activity);
    const authActivityErrors = useSelector(state => state.auth.activityErrors);
    const authActivityErrorCodes = useSelector(state => state.auth.activityErrorCodes);
    const v1AccountActivity = useSelector(state => state.v1Account.activity);
    const teamsActivity = useSelector(state => state.team.activity);
    const containerActivity = useSelector(state => state.container.activity);
    const pageActivity = useSelector(state => state.page.activity);
    const iOSActivity = useSelector(state => state.page.iOSActivity);

    const preflightReady = useSelector(state => state.auth.preflightReady);
    const localSessionState = useSelector(state => state.auth.localSessionState);
    const v2NextAuthStep = useSelector(state => state.auth.v2NextAuthStep);

    const accountVersion = useSelector(state => state.auth.accountVersion);
    const memberId = useSelector(state => state.auth.memberId);
    const isLoggedIn = useSelector(state => state.auth.isLoggedIn);
    const displayName = useSelector(state => state.auth.displayName);
    const nextAuthStep = useSelector(state => state.v1Account.nextAuthStep);

    const workspaceName = useSelector(state => state.container.workspaceName);

    const displayPaymentBanner = !(router.asPath.startsWith('/logIn')) && !(router.asPath.startsWith('/services/')) && !(router.asPath.startsWith('/apps/'));

    const resetAllActivities = () => {
        dispatch(resetAccountActivity());
        dispatch(resetAuthActivity());
        dispatch(resetContainerActivity());
        dispatch(resetPageActivity());
        dispatch(resetTeamActivity());
        dispatch(resetV1AccountActivity());
    }

    const refresh = (e) => {
        router.reload();
    }

    const mfaSetup = (e) => {
        router.push('/services/mfaSetup');
    }

    const payment = (e) => {
        router.push('/services/payment');
    }

    const dataCenter = (e) => {
        router.push('/services/dataCenterSetup')
    }

    const deleteAccount = (e) => {
        router.push('/services/deleteAccount')
    }

    const logOut = (e) => {
        debugLog(debugOn, "Log out");
        //changePage('/logOut');
        dispatch(logOutAsyncThunk());
    }

    const lock = (e) => {
        dispatch(lockAsyncThunk())
    }

    const signOut = (e) => {
        dispatch(signOutAsyncThunk())
    }

    const changeRoute = (route) => {
        dispatch(setNextAuthStep(null));
        const path = router.asPath;
        if (path === route) return;
        debugLog(debugOn, `router.push: , ${route}, state:${JSON.stringify(localSessionState)}`);
        router.push(route);
    }

    const changePage = (page) => {
        setNextRoute(page);
    }

    const checkIfPublicOrAuthPages = (path) => {
        return (path === '/' ||
            path.startsWith('/logIn') ||
            path.startsWith('/keySetup') ||
            path.startsWith('/n/') ||
            path.startsWith('/v1/' ||
                path.startsWith('/v3')));
    }

    const ifRedirectToHome = (path) => {
        if ((path !== '/') && (!path.startsWith('/public/') && !path.startsWith('/apps/') && !path.startsWith('/logIn') && (path !== '/keySetup') && (!path.startsWith('/n/')))) {
            return true;
        } else return false;
    }

    const goHome = () => {
        switch (process.env.NEXT_PUBLIC_app) {
            case 'bsafes':
                changePage('/apps/bsafes');
                break;
            case 'colors':
                changePage('/apps/colors');
                break;
            default:
                changePage('/');
        }
    }

    const goLogin = () => {
        switch (process.env.NEXT_PUBLIC_app) {
            case 'bsafes':
                changePage('/apps/bsafes');
                break;
            case 'colors':
                changePage('/apps/colors');
                break;
            default:
                changePage('/logIn');
        }
    }

    const errorNotice = (errorMessage) => {
        toast.error(errorMessage, {
            position: "bottom-center",
            autoClose: 5000,
            hideProgressBar: true,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: "colored",
            toastId: 'customId'
        });
    };


    const localSessionStateChanged = () => {
        debugLog(debugOn, `localSessionStateChanged(): preflightReady:${preflightReady}, state: ${JSON.stringify(localSessionState)}, isLoggedIn:${isLoggedIn}`);

        if (preflightReady && localSessionState.sessionExists) {
            if (localSessionState.unlocked) {
                if (isLoggedIn) {
                    const path = router.asPath;
                    if (checkIfPublicOrAuthPages(path)) {
                        if (accountVersion === 'v1') {
                            changePage('/teams');
                        } else {
                            changePage('/safe');
                        }
                    }
                    return;
                } else {
                    if (accountVersion === 'v1') {
                        changePage('/teams');
                    } else {
                        changePage('/safe');
                    }
                    return;
                }
            } else {
                if (isLoggedIn) {
                    dispatch(loggedOut());
                    dispatch(cleanMemoryThunk());
                    if (accountVersion === 'v1') {
                        changePage('/v1/keyEnter')
                    }
                    return;
                } else {
                    switch (localSessionState.authState) {
                        case 'MFARequired':
                            if (accountVersion === 'v1') {
                                changePage('/v1/extraMFA');
                            } else {
                                changePage('/services/mfa');
                            }
                            break;
                        case 'KeyRequired':
                            changePage('/v1/keyEnter');
                            break;
                        default:
                            dispatch(setPreflightReady(false));
                            dispatch(preflightAsyncThunk({ action: 'KeyRequired' }));
                    }
                    return;
                }
            }
        } else if (!localSessionState.sessionExists) {
            if (localSessionState.unlocked) {
                debugLog(debugOn, "Error: It should never happen");
                if (isLoggedIn) {
                    return;
                } else {
                    return;
                }
            } else if (preflightReady) {
                if (isLoggedIn) {
                    dispatch(loggedOut());
                    dispatch(cleanMemoryThunk());
                    if (accountVersion === 'v1') {
                        dispatch(signedOut());
                        changePage(`/`);
                    } else {
                        goLogin();
                    }
                } else {
                    const path = router.asPath;
                    if (ifRedirectToHome(path)) {
                        goHome();
                    }
                }
            } else {
                const path = router.asPath;
                if (ifRedirectToHome(path)) {
                    goHome();
                }
            }
        }
    }

    useEffect(() => {
        debugLog(debugOn, `${router.asPath} is loaded`)
    }, [router.asPath]);

    useEffect(() => {
        dispatch(setPreflightReady(false));
        dispatch(setAccountHashVerified(null));
        debugLog(debugOn, "Calling preflight, isLoggedIn", isLoggedIn);
        dispatch(preflightAsyncThunk());

        const handleRouteChange = (url, { shallow }) => {
            debugLog(debugOn, "Route is going to change ...")
            resetAllActivities()
            dispatch(setPreflightReady(false));
            dispatch(setLocalSessionState(null));
        }

        router.events.on('routeChangeStart', handleRouteChange)

        // If the component is unmounted, unsubscribe
        // from the event with the `off` method:

        return () => {
            router.events.off('routeChangeStart', handleRouteChange);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        if (preflightReady) {
            dispatch(createCheckSessionIntervalThunk());
        }
    }, [preflightReady]);

    useEffect(() => {
        if (!nextRoute) return;
        const path = router.asPath;
        if (path === nextRoute) return;
        changeRoute(nextRoute);
    }, [nextRoute]);

    useEffect(() => {
        if (!localSessionState) return;
        localSessionStateChanged();
    }, [localSessionState]);

    useEffect(() => {
        if (!v2NextAuthStep) return;

        debugLog(debugOn, "route v2NextAuthStep: ", v2NextAuthStep.step);
        let nextPage = null;
        switch (v2NextAuthStep.step) {
            case 'Home':
                let homePath;
                switch (process.env.NEXT_PUBLIC_app) {
                    case 'colors':
                        homePath = '/apps/colors'
                        break;
                    default:
                        homePath = '/'
                }
                const path = router.asPath;
                if (path === homePath) break;
                nextPage = homePath;
                break;
            case 'MFARequired':
                nextPage = '/services/mfa';
                break;
            default:
        }
        dispatch(setV2NextAuthStep(null));
        if (nextPage) {
            const path = router.asPath;
            if (path !== nextPage) changePage(nextPage);
        }
    }, [v2NextAuthStep]);

    useEffect(() => {
        if (!nextAuthStep) return;

        debugLog(debugOn, "route nextAuthStep: ", nextAuthStep.step);
        let nextPage = null;
        switch (nextAuthStep.step) {
            case 'Home':
                let homePath;
                switch (process.env.NEXT_PUBLIC_app) {
                    case 'bsafes':
                        homePath = '/apps/bsafes'
                        break;
                    case 'colors':
                        homePath = '/apps/colors'
                        break;
                    default:
                        homePath = '/'
                }
                const path = router.asPath;
                if (path === '/logIn' || path.startsWith('/n/')) break;
                nextPage = homePath;
                break;
            case 'SignIn':
                nextPage = `/n/${nextAuthStep.nickname}`;
                break;
            case 'MFARequired':
                nextPage = '/v1/extraMFA';
                break;
            case 'KeyRequired':
                nextPage = '/v1/keyEnter';
                break;
            default:

        }
        dispatch(setNextAuthStep(null));
        if (nextPage) {
            const path = router.asPath;
            if (path !== nextPage) changePage(nextPage);
        }
    }, [nextAuthStep])


    useEffect(() => {
        if (preflightReady && accountState) {

        }
    }, [preflightReady, accountState])

    useEffect(() => {
        if (authActivityErrors) {
            const errorMessages = getErrorMessages('Auth', authActivityErrors, authActivityErrorCodes);
            //notify();
            if (errorMessages.length) setTimeout(errorNotice(errorMessages[0]), 500);
        }
    }, [authActivityErrors]);

    return (
        <div>
            {((accountActivity !== 0) || (authActivity !== 0) || (v1AccountActivity !== 0) || (teamsActivity !== 0) || (containerActivity !== 0) || (pageActivity !== 0) || (iOSActivity !== 0)) &&
                <div className={BSafesStyle.screenCenter}>
                    <Blocks
                        visible={true}
                        height="80"
                        width="80"
                        ariaLabel="blocks-loading"
                        wrapperStyle={{}}
                        wrapperClass="blocks-wrapper"
                    />
                </div>
            }

            {true && showNaveBar && ((accountVersion === '' || accountVersion === 'v1')) &&
                <Navbar bg="light" className={BSafesStyle.bsafesNavbar}>
                    <Container fluid>
                        {workspaceName ?
                            <Navbar.Brand className={BSafesStyle.navbarBrand}>
                                <span className={BSafesStyle.navbarTeamName}>
                                    {workspaceName}
                                </span>
                            </Navbar.Brand> :
                            <Navbar.Brand href="/" className={BSafesStyle.navbarBrand}>
                                <span className={BSafesStyle.navbarTeamName}>
                                    BSafes
                                </span>
                            </Navbar.Brand>
                        }
                        {showNavbarMenu && <Dropdown align="end" className="justify-content-end">
                            <Dropdown.Toggle variant="link" id="dropdown-basic" className={BSafesStyle.navbarMenu}>
                                <span className={BSafesStyle.memberBadge}>{displayName && displayName.charAt(0)}</span>
                            </Dropdown.Toggle>

                            <Dropdown.Menu>

                                {isLoggedIn &&
                                    <Dropdown.Item onClick={lock}>Lock</Dropdown.Item>
                                }
                                {(isLoggedIn || (router.asPath === '/v1/keyEnter')) &&
                                    <Dropdown.Item onClick={signOut}>Sign out</Dropdown.Item>
                                }
                            </Dropdown.Menu>

                            {accountVersion === '' &&
                                <Dropdown.Menu>
                                    {(router.asPath === '/v1/keyEnter') &&
                                        <Dropdown.Item onClick={signOut}>Sign out</Dropdown.Item>
                                    }
                                </Dropdown.Menu>
                            }
                        </Dropdown>}
                        {publicPage && <>
                            <Nav className="me-auto">
                                <NavDropdown title="Company" id="collapsible-nav-dropdown" className={BSafesStyle.navLink}>
                                    <NavDropdown.Item href="https://blog.bsafes.com">
                                        Blogs
                                    </NavDropdown.Item>
                                    <NavDropdown.Item href="/public/aboutUs">
                                        About Us
                                    </NavDropdown.Item>
                                    <NavDropdown.Item href="/public/mission">
                                        Mission
                                    </NavDropdown.Item>
                                    <NavDropdown.Item href="/public/privacyPolicy">
                                        Privacy Policy
                                    </NavDropdown.Item>
                                    <NavDropdown.Item href="/public/termsOfService">
                                        Terms of Service
                                    </NavDropdown.Item>
                                </NavDropdown>
                                <Nav.Link href="https://support.bsafes.com" className={BSafesStyle.navLink}>Support</Nav.Link>
                                <Nav.Link href="/public/pricing" className={BSafesStyle.navLink}>Pricing</Nav.Link>
                            </Nav>
                            <Button size='sm' variant='light' align="end" className="justify-content-end" onClick={() => publicHooks.onOpen()}>
                                Open
                            </Button>
                        </>}
                    </Container>
                </Navbar>
            }
            {showNaveBar && (accountVersion === 'v2') &&
                <Navbar key={false} expand="false" bg="light" className={`${BSafesStyle.bsafesNavbar} py-2`}>
                    <Container>
                        {true && <>
                            {(localSessionState && localSessionState.authState !== 'MFARequired' && !isLoggedIn) &&
                                <Navbar.Brand href='/'><h1>BSafes</h1></Navbar.Brand>
                            }
                            {(localSessionState && localSessionState.authState === 'MFARequired' && !isLoggedIn) &&
                                <Navbar.Brand><h2>Security</h2></Navbar.Brand>
                            }
                            {isLoggedIn &&
                                <Navbar.Toggle aria-controls={`offcanvasNavbar-expand-false`} />
                            }
                            {isLoggedIn &&
                                <Navbar.Offcanvas
                                    id={`offcanvasNavbar-expand-false`}
                                    aria-labelledby={`offcanvasNavbarLabel-expand-false`}
                                    placement="start"
                                    style={{ border: 'solid' }}
                                >
                                    {true && <Offcanvas.Header closeButton style={{ backgroundColor: '#abdbe3' }}>
                                        <Offcanvas.Title id={`offcanvasNavbarLabel-expand-false`}>
                                            <h4><i className="fa fa-info-circle" aria-hidden="true" style={{ width: '32px' }}></i> Services</h4>
                                        </Offcanvas.Title>
                                    </Offcanvas.Header>}
                                    <Offcanvas.Body>
                                        <Nav className="justify-content-end flex-grow-1 pe-3">
                                            <p>Your ID</p>
                                            <p style={{ borderBottom: 'solid', backgroundColor: '#EBF5FB', color: '#063970' }}>{memberId}</p>
                                            <Nav.Link onClick={payment} style={{ borderBottom: 'solid' }}><h5><i className="fa fa-credit-card" aria-hidden="true" style={{ width: '32px' }}></i> Payment</h5></Nav.Link>
                                            <Nav.Link onClick={mfaSetup} style={{ borderBottom: 'solid' }}><h5><i className="fa fa-shield" aria-hidden="true" style={{ width: '32px' }}></i> 2FA</h5></Nav.Link>
                                            <Nav.Link onClick={dataCenter} style={{ borderBottom: 'solid' }}><h5><i className="fa fa-globe" aria-hidden="true" style={{ width: '32px' }}></i> Data Center</h5></Nav.Link>
                                            <Nav.Link href="https://support.bsafes.com" target='_blank' rel="noopener noreferrer" style={{ borderBottom: 'solid' }}><h5><i className="fa fa-question" aria-hidden="true" style={{ width: '32px' }}></i> Support</h5></Nav.Link>
                                        </Nav>
                                    </Offcanvas.Body>
                                </Navbar.Offcanvas>
                            }
                            {((localSessionState && localSessionState.authState === 'MFARequired') || isLoggedIn) &&
                                <>
                                    <a href="https://support.bsafes.com" target='_blank' className='' style={{ color: "#000000" }}><i className="fa fa-lg fa-question" aria-hidden="true"></i></a>
                                    <Button variant='link' size='md' className='' onClick={refresh} style={{ color: 'black' }}><i className="fa fa-refresh" aria-hidden="true"></i></Button>
                                    <Button variant='dark' size='sm' onClick={logOut}>Lock</Button>
                                </>
                            }
                        </>}
                    </Container>
                </Navbar>

            }
            <div>
                <ToastContainer
                    position="top-right"
                    autoClose={false}
                    newestOnTop={false}
                    closeOnClick
                    rtl={false}
                    pauseOnFocusLoss
                    draggable
                    theme="light"
                />
            </div>
            {!hideFunction && isLoggedIn && showPathRow && <ItemPath />}
            {children}
            <ItemsMovingProgress />
            <ItemsToolbar />
            {displayPaymentBanner && accountState === 'paymentRequired' && <PaymentBanner />}
            {((process.env.NEXT_PUBLIC_platform === 'iOS') || (process.env.NEXT_PUBLIC_platform === 'android')) &&
                <>
                    {((displayPaymentBanner && accountState === 'upgradeRequired')) && <VisitPaymentBanner upgradeRequired={true} />}
                    {((displayPaymentBanner && accountState === 'suspended')) && <VisitPaymentBanner suspended={true} />}
                    {((displayPaymentBanner && accountState === 'overflow')) && <VisitPaymentBanner overflow={true} />}
                </>
            }
            {(process.env.NEXT_PUBLIC_platform === 'Web') &&
                <>
                    {displayPaymentBanner && accountState === 'upgradeRequired' && <PaymentBanner upgradeRequired={true} />}
                    {(displayPaymentBanner && accountState === 'suspended') && <SuspendedModal />}
                    {(displayPaymentBanner && accountState === 'overflow') && <SuspendedModal overflow={true} />}
                </>
            }
        </div>
    )
};

export default ContentPageLayout;