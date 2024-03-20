import * as React from 'react';

import { Link } from '@backstage/core-components';

import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import Checkbox from '@mui/material/Checkbox';
import TableCell from '@mui/material/TableCell';
import TableRow from '@mui/material/TableRow';

import { AddRepositoriesData } from '../../types';
import { getRepositoryStatus } from '../../utils/repository-utils';

export const RepositoryTableRow = ({
  handleClick,
  isItemSelected,
  data,
  selectedRepositoryStatus,
}: {
  handleClick: (_event: React.MouseEvent, id: number) => void;
  isItemSelected: boolean;
  data: AddRepositoriesData;
  selectedRepositoryStatus: string;
}) => {
  return (
    <TableRow
      hover
      aria-checked={isItemSelected}
      tabIndex={-1}
      key={data.id}
      selected={isItemSelected}
    >
      <TableCell padding="checkbox">
        <Checkbox
          color="primary"
          checked={
            selectedRepositoryStatus === 'Exists' ? true : isItemSelected
          }
          disabled={selectedRepositoryStatus === 'Exists'}
          onClick={event => handleClick(event, data.id)}
        />
      </TableCell>
      <TableCell component="th" scope="row" padding="none">
        {data.name}
      </TableCell>
      <TableCell align="left">
        <Link to={data.url}>
          <>
            {data.url}
            <OpenInNewIcon
              style={{ verticalAlign: 'bottom', paddingTop: '7px' }}
            />
          </>
        </Link>
      </TableCell>
      <TableCell align="left">
        <Link to={data.organization || ''}>
          <>
            {data.organization}
            <OpenInNewIcon
              style={{ verticalAlign: 'bottom', paddingTop: '7px' }}
            />
          </>
        </Link>
      </TableCell>
      <TableCell align="left">
        {getRepositoryStatus(data.catalogInfoYaml.status, isItemSelected)}
      </TableCell>
    </TableRow>
  );
};
