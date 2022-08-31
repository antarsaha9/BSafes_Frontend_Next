import React, { useEffect, useState } from "react";
import Container from 'react-bootstrap/Container'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Button from 'react-bootstrap/Button'

import TagsInput from 'react-tagsinput-special'

import BSafesStyle from '../styles/BSafes.module.css'

export default function ItemTopRows() {
    const [tags, setTags] = useState([]);

    const handleChange = (tags) => {
        setTags(tags);
    }

    useEffect(()=>{
        setTags(["Banana"]);
    }, [])

    return (
        <Container>
            <Row>
                <Col>
                    <div className="pull-right">
                        <span>v.1</span><Button variant="link" className="text-dark" ><i className="fa fa-history" aria-hidden="true"></i></Button>
                        <Button variant="link" className="text-dark" >
		        		    <i className="fa fa-share-square-o" aria-hidden="true"></i>
		        	    </Button>
                    </div>
                </Col>     
            </Row>

            <Row>
                <Col xs="1">
                    <label className="pull-right"><span><i className="fa fa-tags fa-lg" aria-hidden="true"></i></span></label>
                </Col>
                <Col xs="10">
                    <TagsInput value={tags} onChange={handleChange} />
                </Col>
            </Row>
            <Row>
                <Col md="10">
                    <Button variant="link" className="pull-right"><i className={`fa fa-times fa-lg ${BSafesStyle.orangeText}`} aria-hidden="true"></i></Button>
                    <Button variant="link" className="pull-right"><i className={`fa fa-check fa-lg ${BSafesStyle.greenText}`} aria-hidden="true"></i></Button>
                </Col>
            </Row>
        </Container>
    )
}