import * as React from "react";
import { Pagination } from '@patternfly/react-core';
import "@patternfly/react-core/dist/styles/base.css";
import { Table, TableHeader, TableBody } from "@patternfly/react-table";
// import { columns, defaultRows } from './data'; 

class DataTable extends React.Component {

    handlePerPageSelect = (_evt, newPerPage, newPage = 1, startIdx, endIdx) => {
        setNumPerPage(newPerPage);
        setRows(defaultRows.slice(startIdx, endIdx));
    };

    handleSetPage = (_evt, newPage, perPage, startIdx, endIdx) => {
        setCurrentPage(newPage);
        setRows(defaultRows.slice(startIdx, endIdx));
    }

    render() {
        const defaultPerPage = 2;
        const [numPerPage, setNumPerPage] = React.useState(defaultPerPage);
        const [currentPage, setCurrentPage] = React.useState(1);
        const [rows, setRows] = React.useState(defaultRows.slice(0, defaultPerPage));

        return (
            <React.Fragment>
                <Pagination
                    onSetPage={handleSetPage}
                    onPerPageSelect={handlePerPageSelect}
                    perPageOptions={[{ title: "2", value: 2 }, { title: "3", value: 3 }]}
                    page={currentPage}
                    perPage={numPerPage}
                    itemCount={defaultRows.length} />

                <Table 
                    caption="PatternFly React Table" 
                    cells={[]} 
                    rows={[]} 
                    variant="compact"
                    >
                    <TableHeader />
                    <TableBody />    
                </Table>
            </React.Fragment>
        );
    };
}
export default DataTable;