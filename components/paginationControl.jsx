import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col';
import Pagination from 'react-bootstrap/Pagination'

export default function PaginationControl({page, total, limit, changePage}) {
    const rows = [];
    const numberOfPages = Math.ceil(total/limit);
    const pagesPerRow = 5;
    const numberOfRows = Math.ceil(numberOfPages/pagesPerRow);

    for(let i=1; i<=numberOfRows; i++) {
      let isLastRow = false;
      if(i*pagesPerRow >= numberOfPages) isLastRow = true;
      let items = [];
      for(let number=((i-1)*pagesPerRow+1); number<=(isLastRow?numberOfPages:i*pagesPerRow); number++)
      {
        items.push(
          <Pagination.Item key={number} active={number === page} onClick={()=>changePage(number)}>
            {number}
          </Pagination.Item>,
        );
      }  
      rows.push(
        <Col key={i}> 
          <Pagination>{items}</Pagination>
        </Col>
      )
    }

    return (
        <Row>
          {rows}
        </Row>
    )
} 