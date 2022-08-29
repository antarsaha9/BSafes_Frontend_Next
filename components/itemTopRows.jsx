import Container from 'react-bootstrap/Container'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Button from 'react-bootstrap/Button'

import React, { useState } from "react";
import { TagsInput } from "react-tag-input-component";

export default function ItemTopRows() {
    const [selected, setSelected] = useState(["papaya"]);

    return (
        <Container>
            <Row>
                <Col>
                    <div className="pull-right">
                        <span>v.1</span><Button variant="link"><i className="fa fa-history" aria-hidden="true"></i></Button>
                        <Button variant="link" >
		        		    <i className="fa fa-share-square-o" aria-hidden="true"></i>
		        	    </Button>
                    </div>
                </Col>     
            </Row>
            <Row>
                <TagsInput
                    value={selected}
                    onChange={setSelected}
                    name="fruits"
                    placeHolder="Add Tags"
                />
            </Row>
        </Container>
    )
}