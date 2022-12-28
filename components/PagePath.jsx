import { connect } from 'react-redux'

import ButtonGroup from 'react-bootstrap/ButtonGroup'
import Dropdown from 'react-bootstrap/Dropdown'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Breadcrumb from 'react-bootstrap/Breadcrumb';

import BSafesStyle from '../styles/BSafes.module.css'

import { debugLog } from '../lib/helper';

import { withRouter } from 'next/router';
import { getItemPathThunk, resetPath } from '../reduxStore/containerSlice';
import DOMPurify from 'dompurify';
import Link from 'next/link';
import { clearPage } from '../reduxStore/pageSlice'
import { Component } from 'react'
import { compose } from '@reduxjs/toolkit'

class PagePath extends Component {
    constructor(props) {
        super(props);
        this.state = {
            itemPathCalled: false
        }
    }
    componentDidMount() {
        this.debugOn = false;
        this.props.router.events.on('routeChangeStart', (url) => {
            if (this.props.itemId) {
                this.props.clearPage();
                this.props.resetPath();
            }
        });
        this.setState({ itemPathCalled: false });
    }


    componentDidUpdate(previousProps, previousState) {
        // if workspaceKey is changed or itemId is changed
        if ((this.props.workspaceKey !== previousProps.workspaceKey) || (this.props.itemId !== previousProps.itemId)) {
            // if itemId is present and workspaceKey is present and loaded path is not for current item id
            if (!this.state.itemPathCalled && this.props.itemId && this.props.workspaceKey && (this.props.itemId !== this.props.itemPath.for)) {
                console.log((this.props.workspaceKey !== previousProps.workspaceKey), (this.props.itemId !== previousProps.itemId), (this.props.itemId !== this.props.itemPath.for));
                this.props.getItemPathThunk({ itemId: this.props.itemId, workspaceKey: this.props.workspaceKey })
                this.setState({ itemPathCalled: true });
            }
        }
        if (this.props.router.query.itemId !== previousProps.router.query.itemId) {
            if (!this.props.router.query.itemId) {
                this.props.clearPage();
            }
        }
        if (this.props.itemPath !== previousProps.itemPath)
            this.setState({ itemPathCalled: false });

    }


    render() {

        return (
            <div>
                <Row>
                    <Col xs={10} sm={11}>
                        <Breadcrumb className='rounded-end' style={{ padding: '8px 15px', backgroundColor: '#f5f5f5' }} bsPrefix="breadcrumb mb-0">
                            <Breadcrumb.Item className={`${BSafesStyle.teamsPathItem} px-1`} linkProps={{ className: BSafesStyle.teamsPathLink }}><i className="fa fa-building" aria-hidden="true" />Teams</Breadcrumb.Item>
                            {this.props.itemPath.data && this.props.itemPath.data.map((path, index) => {
                                var pathItemType = path.id.split(':')[0];
                                var title = path.title;
                                // if (path._id.substring(0, 2) === 'np') pathItemType = 'np';
                                // if (path._id.substring(0, 2) === 'dp') pathItemType = 'dp';

                                var pathItemIcon;
                                var pathItemLink = '';
                                // bSafesCommonUIObj.currentItem.path.push(path[i]._id);
                                switch (pathItemType) {
                                    case 'u':
                                        title = 'Personal';
                                        pathItemLink = '/safe';
                                        break;
                                    case 't':
                                        teamName = DOMPurify.sanitize(teamName);
                                        pathItemIcon = teamName;
                                        pathItemParts = path.id.split(':');
                                        pathItemParts.splice(-2, 2);
                                        var teamId = pathItemParts.join(':');
                                        pathItemLink = '/team/' + teamId;
                                        break;
                                    case 'b':
                                        pathItemIcon = "fa fa-archive";
                                        pathItemLink = '/box/' + path.id;
                                        break;
                                    case 'f':
                                        pathItemIcon = "fa fa-folder-o";
                                        pathItemLink = '/folder/' + path.id;
                                        break;
                                    case 'n':
                                        pathItemIcon = "fa fa-book";
                                        pathItemLink = '/notebook/' + path.id;
                                        break;
                                    case 'd':
                                        pathItemIcon = "fa fa-calendar";
                                        pathItemLink = '/diary/' + path.id;
                                        break;
                                    case 'p':
                                        pathItemIcon = "fa fa-file-text-o";
                                        pathItemLink = '/page/' + path.id;
                                        break;
                                    case 'np':
                                        pathItemIcon = "fa fa-file-text-o";
                                        pathItemLink = '/notebook/p/' + path.id;
                                        break;
                                    case 'dp':
                                        pathItemIcon = "fa fa-file-text-o";
                                        pathItemLink = '/diary/p/' + path.id;
                                        break;
                                    default:
                                        break;
                                }

                                return (
                                    <Breadcrumb.Item key={title} active={(this.props.itemPath.data.length - 1) === index} linkAs={BreadcrumbLink} href={pathItemLink} linkProps={{ className: 'text-decoration-none' }}>
                                        {pathItemIcon && <i className={`${pathItemIcon} px-1`} />}
                                        {title}
                                    </Breadcrumb.Item>
                                )
                            })}
                        </Breadcrumb>

                    </Col>
                    <Col xs={2} sm={1}>
                        <Dropdown as={ButtonGroup}>
                            {/* <Button variant="info"><i class="fa fa-plus" aria-hidden="true"/></Button> */}
                            <Dropdown.Toggle className={BSafesStyle['dropdown-toggle']} style={{ padding: ".5rem 1rem" }} ><i className="fa fa-plus" aria-hidden="true" /></Dropdown.Toggle>
                            <Dropdown.Menu className="super-colors">
                                <Dropdown.Item eventKey="1">Teams</Dropdown.Item>
                                <Dropdown.Item eventKey="2">Personal</Dropdown.Item>
                                <Dropdown.Item eventKey="3" active>
                                    Active Item
                                </Dropdown.Item>
                            </Dropdown.Menu>
                        </Dropdown>

                    </Col>
                </Row>

                {this.props.children}
            </div>
        )
    }
}

function BreadcrumbLink({ children, href, className, ...props }) {
    return (
        <Link href={href}>
            <a className={className} >
                {children}
            </a>
        </Link>
    )
}
export default compose(
    withRouter,
    connect(state => ({
        isLoggedIn: state.auth.isLoggedIn,
        itemId: state.page.id,
        workspaceKey: state.container.workspaceKey,
        itemPath: state.container.itemPath,
    }), { getItemPathThunk, resetPath, clearPage })
)(PagePath);