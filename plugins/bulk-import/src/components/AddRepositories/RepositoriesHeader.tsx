import * as React from 'react';

import Checkbox from '@mui/material/Checkbox';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TableSortLabel from '@mui/material/TableSortLabel';

import { Order } from '../../types';
import { OrganizationColumnHeader } from './OrganizationColumnHeader';
import { RepositoriesColumnHeader } from './RepositoriesColumnHeader';
import { ReposSelectDrawerColumnHeader } from './ReposSelectDrawerColumnHeader';

export const RepositoriesHeader = ({
  onSelectAllClick,
  order,
  orderBy,
  numSelected,
  rowCount,
  onRequestSort,
  showOrganizations,
  isRepoSelectDrawer = false,
}: {
  numSelected: number;
  onRequestSort: (event: React.MouseEvent<unknown>, property: any) => void;
  onSelectAllClick: (event: React.ChangeEvent<HTMLInputElement>) => void;
  order: Order;
  orderBy: string;
  rowCount: number;
  showOrganizations: boolean;
  isRepoSelectDrawer?: boolean;
}) => {
  const createSortHandler =
    (property: any) => (event: React.MouseEvent<unknown>) => {
      onRequestSort(event, property);
    };

  const getColumnHeader = () => {
    if (showOrganizations) {
      return OrganizationColumnHeader;
    }
    if (isRepoSelectDrawer) {
      return ReposSelectDrawerColumnHeader;
    }
    return RepositoriesColumnHeader;
  };

  const tableCellStyle = {
    lineHeight: '1.5rem',
    fontSize: '0.875rem',
    padding: showOrganizations ? '15px 16px 15px 24px' : '15px 16px 15px 6px',
    fontWeight: '700',
  };

  return (
    <TableHead>
      <TableRow>
        {getColumnHeader().map((headCell, index) => (
          <TableCell
            key={headCell.id as string}
            align="left"
            padding="normal"
            sx={tableCellStyle}
            sortDirection={orderBy === headCell.field ? order : 'asc'}
          >
            {index === 0 && !showOrganizations && (
              <Checkbox
                disableRipple
                color="primary"
                style={{ padding: '0 12px' }}
                indeterminate={numSelected > 0 && numSelected < rowCount}
                checked={rowCount > 0 && numSelected === rowCount}
                onChange={onSelectAllClick}
                inputProps={{
                  'aria-label': 'select all repositories',
                }}
              />
            )}
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
