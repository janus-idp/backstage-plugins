import React from 'react';
// eslint-disable-next-line  no-restricted-imports
import {
  Table,
  TableContainer,
  TableBody,
  TableRow,
  TableCell,
  TableHead,
  TablePagination,
  TableFooter,
} from '@material-ui/core';
/* ignore lint error for internal dependencies */
/* eslint-disable */
import { PipelineRun } from '@jquad-group/plugin-tekton-pipelines-common';
/* eslint-enable */
import TablePaginationActions from '@material-ui/core/TablePagination/TablePaginationActions';
import { CollapsibleTableRow } from '../CollapsibleTableRow';

export const TEKTON_PIPELINES_BUILD_NAMESPACE = 'tektonci/build-namespace';
export const TEKTON_PIPELINES_LABEL_SELECTOR =
  'tektonci/pipeline-label-selector';

type PipelineRunProps = {
  clusterName?: string;
  pipelineruns?: PipelineRun[];
};

export const CollapsibleTable = ({
  clusterName,
  pipelineruns,
}: PipelineRunProps) => {
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(5);
  let emptyRows: number;
  // Avoid a layout jump when reaching the last page with empty rows.
  if (pipelineruns !== undefined) {
    emptyRows =
      page > 0
        ? Math.max(0, (1 + page) * rowsPerPage - pipelineruns.length)
        : 0;
  } else {
    emptyRows = page > 0 ? Math.max(0, (1 + page) * rowsPerPage) : 0;
  }

  const handleChangePage = (
    _event: React.MouseEvent<HTMLButtonElement> | null,
    newPage: number,
  ) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  return (
    <TableContainer data-testid="collapsible-table-container">
      <Table aria-label="collapsible table">
        <TableHead>
          <TableRow>
            <TableCell />
            <TableCell>Name</TableCell>
            <TableCell align="right">Namespace</TableCell>
            <TableCell align="right">Status</TableCell>
            <TableCell align="right">Start Time</TableCell>
            <TableCell align="right">Duration</TableCell>
            <TableCell align="right">Dashboard</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {pipelineruns !== undefined &&
            clusterName !== undefined &&
            (rowsPerPage > 0
              ? pipelineruns.slice(
                  page * rowsPerPage,
                  page * rowsPerPage + rowsPerPage,
                )
              : pipelineruns
            ).map(pipelineRun => (
              <CollapsibleTableRow
                key={pipelineRun.metadata.name}
                clusterName={clusterName}
                pipelineRun={pipelineRun}
              />
            ))}
          {emptyRows > 0 && (
            <TableRow style={{ height: 53 * emptyRows }}>
              <TableCell colSpan={7} />
            </TableRow>
          )}
        </TableBody>
        <TableFooter>
          {pipelineruns !== undefined && (
            <TableRow>
              <TablePagination
                rowsPerPageOptions={[5, 10, 25, { label: 'All', value: -1 }]}
                colSpan={7}
                count={pipelineruns.length}
                rowsPerPage={rowsPerPage}
                page={page}
                SelectProps={{
                  inputProps: {
                    'aria-label': 'rows per page',
                  },
                  native: true,
                }}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
                ActionsComponent={TablePaginationActions}
              />
            </TableRow>
          )}
        </TableFooter>
      </Table>
    </TableContainer>
  );
};
