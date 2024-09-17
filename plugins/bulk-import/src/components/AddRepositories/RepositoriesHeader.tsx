import * as React from 'react';

import {
  Checkbox,
  TableCell,
  TableHead,
  TableRow,
  TableSortLabel,
} from '@material-ui/core';

import { Order } from '../../types';
import { OrganizationsColumnHeader } from './OrganizationsColumnHeader';
import { RepositoriesColumnHeader } from './RepositoriesColumnHeader';
import { ReposSelectDrawerColumnHeader } from './ReposSelectDrawerColumnHeader';

export const RepositoriesHeader = ({
  onSelectAllClick,
  order,
  orderBy,
  numSelected,
  rowCount,
  onRequestSort,
  isDataLoading,
  showOrganizations,
  isRepoSelectDrawer = false,
}: {
  numSelected: number;
  onRequestSort: (event: React.MouseEvent<unknown>, property: any) => void;
  order: Order;
  orderBy: string | undefined;
  rowCount: number;
  isDataLoading?: boolean;
  showOrganizations?: boolean;
  isRepoSelectDrawer?: boolean;
  onSelectAllClick?: (event: React.ChangeEvent<HTMLInputElement>) => void;
}) => {
  const createSortHandler =
    (property: any) => (event: React.MouseEvent<unknown>) => {
      onRequestSort(event, property);
    };

  const getColumnHeader = () => {
    if (showOrganizations) {
      return OrganizationsColumnHeader;
    }
    if (isRepoSelectDrawer) {
      return ReposSelectDrawerColumnHeader;
    }
    return RepositoriesColumnHeader;
  };

  return (
    <TableHead>
      <TableRow>
        {getColumnHeader().map((headCell, index) => (
          <TableCell
            key={headCell.id as string}
            align="left"
            padding="normal"
            style={{
              lineHeight: '1.5rem',
              fontSize: '0.875rem',
              padding: showOrganizations
                ? '15px 16px 15px 24px'
                : '15px 16px 15px 6px',
              fontWeight: '700',
            }}
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
                disabled={isDataLoading}
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
