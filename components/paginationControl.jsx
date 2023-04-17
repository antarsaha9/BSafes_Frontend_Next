import Pagination from 'react-bootstrap/Pagination'

export default function PaginationControl({page, total, limit, changePage}) {
    let items = [];
    for (let number = 1; number <= Math.ceil(total/limit); number++) {
        items.push(
          <Pagination.Item key={number} active={number === page} onClick={()=>changePage(number)}>
            {number}
          </Pagination.Item>,
        );
      }
    return (
        <Pagination>{items}</Pagination>
    )
} 