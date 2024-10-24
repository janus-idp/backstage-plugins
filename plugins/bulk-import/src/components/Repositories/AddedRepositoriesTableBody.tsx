import * as React from 'react';

import { makeStyles, TableBody, TableCell, TableRow } from '@material-ui/core';
import { Alert } from '@material-ui/lab';
import CircularProgress from '@mui/material/CircularProgress';

import { AddRepositoryData } from '../../types';
import { AddedRepositoryTableRow } from './AddedRepositoryTableRow';
import { RepositoriesListColumns } from './RepositoriesListColumns';

const useStyles = makeStyles(theme => ({
  empty: {
    padding: theme.spacing(2),
    display: 'flex',
    justifyContent: 'center',
  },
}));

export const AddedRepositoriesTableBody = ({
  loading,
  rows,
  emptyRows,
  error,
}: {
  error: { [key: string]: string };
  loading: boolean;
  emptyRows: number;
  rows: AddRepositoryData[];
}) => {
  const classes = useStyles();

  if (loading) {
    return (
      <tbody>
        <tr>
          <td colSpan={RepositoriesListColumns?.length}>
            <div data-testid="import-jobs-loading" className={classes.empty}>
              <CircularProgress />
            </div>
          </td>
        </tr>
      </tbody>
    );
  }
  if (Object.keys(error || {}).length > 0) {
    return (
      <tbody>
        <tr>
          <td colSpan={RepositoriesListColumns?.length}>
            <div data-testid="import-jobs-error">
              <Alert severity="error">{`${error.name}. ${error.message}`}</Alert>
            </div>
          </td>
        </tr>
      </tbody>
    );
  }

  if (rows?.length > 0) {
    return (
      <TableBody data-testid="import-jobs">
        {rows.map(row => {
          return <AddedRepositoryTableRow key={row.id} data={row} />;
        })}
        {emptyRows > 0 && (
          <TableRow
            style={{
              height: 55 * emptyRows,
            }}
          >
            <TableCell />
          </TableRow>
        )}
      </TableBody>
    );
  }
  return (
    <tbody>
      <tr>
        <td colSpan={RepositoriesListColumns?.length}>
          <div data-testid="no-import-jobs-found" className={classes.empty}>
            No records found
          </div>
        </td>
      </tr>
    </tbody>
  );
};
