import * as React from 'react';

import { Link } from '@backstage/core-components';

import TableCell from '@mui/material/TableCell';
import TableRow from '@mui/material/TableRow';

import { AddRepositoriesData } from '../../types';
import {
  getRepositoryStatusForOrg,
  getSelectedRepositories,
} from '../../utils/repository-utils';

export const OrganizationTableRow = ({
  data,
}: {
  data: AddRepositoriesData;
}) => {
  return (
    <TableRow hover>
      <TableCell component="th" scope="row" padding="none">
        {data.name}
      </TableCell>
      <TableCell align="left">
        <Link to={data.url}>{data.url}</Link>
      </TableCell>
      <TableCell align="left">
        <>{getSelectedRepositories(data.selectedRepositories)}</>
      </TableCell>
      <TableCell align="left">{getRepositoryStatusForOrg(data)}</TableCell>
    </TableRow>
  );
};
