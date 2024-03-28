import * as React from 'react';

import Checkbox from '@mui/material/Checkbox';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TableSortLabel from '@mui/material/TableSortLabel';

import { Order } from '../../types';
import { OrganizationColumnHeader } from './OrganizationColumnHeader';
import { RepositoriesColumnHeader } from './RepositoriesColumnHeader';

export const RepositoriesHeader = ({
  onSelectAllClick,
  order,
  orderBy,
  numSelected,
  rowCount,
  onRequestSort,
  showOrganizations,
}: {
  numSelected: number;
  onRequestSort: (event: React.MouseEvent<unknown>, property: any) => void;
  onSelectAllClick: (event: React.ChangeEvent<HTMLInputElement>) => void;
  order: Order;
  orderBy: string;
  rowCount: number;
  showOrganizations: boolean;
}) => {
  const createSortHandler =
    (property: any) => (event: React.MouseEvent<unknown>) => {
      onRequestSort(event, property);
    };

  return (
    <TableHead>
      <TableRow>
        {!showOrganizations && (
          <TableCell padding="checkbox">
            <Checkbox
              color="primary"
              indeterminate={numSelected > 0 && numSelected < rowCount}
              checked={rowCount > 0 && numSelected === rowCount}
              onChange={onSelectAllClick}
              inputProps={{
                'aria-label': 'select all repositories',
              }}
            />
          </TableCell>
        )}
        {(showOrganizations
          ? OrganizationColumnHeader
          : RepositoriesColumnHeader
        ).map(headCell => (
          <TableCell
            key={headCell.id as string}
            align="left"
            padding="normal"
            style={{
              fontWeight: '800',
            }}
            sortDirection={orderBy === headCell.field ? order : 'asc'}
          >
            <TableSortLabel
              active={orderBy === headCell.field}
              direction={orderBy === headCell.field ? order : 'asc'}
              onClick={createSortHandler(headCell.field)}
            >
              {headCell.title}
            </TableSortLabel>
          </TableCell>
        ))}
      </TableRow>
    </TableHead>
  );
};
