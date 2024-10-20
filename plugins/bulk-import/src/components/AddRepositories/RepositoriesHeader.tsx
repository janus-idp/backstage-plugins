import * as React from 'react';

import {
  Checkbox,
  TableCell,
  TableHead,
  TableRow,
  TableSortLabel,
} from '@material-ui/core';

import { Order } from '../../types';
import { RepositoriesListColumns } from '../Repositories/RepositoriesListColumns';
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
  showImportJobs,
  isRepoSelectDrawer = false,
}: {
  numSelected?: number;
  onRequestSort: (event: React.MouseEvent<unknown>, property: any) => void;
  order: Order;
  orderBy: string | undefined;
  rowCount?: number;
  isDataLoading?: boolean;
  showOrganizations?: boolean;
  showImportJobs?: boolean;
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
    if (showImportJobs) {
      return RepositoriesListColumns;
    }
    if (isRepoSelectDrawer) {
      return ReposSelectDrawerColumnHeader;
    }
    return RepositoriesColumnHeader;
  };

  const tableCellStyle = () => {
    if (showImportJobs) {
      return undefined;
    }
    if (showOrganizations) {
      return '15px 16px 15px 24px';
    }
    return '15px 16px 15px 6px';
  };

  return (
    <TableHead>
      <TableRow>
        {getColumnHeader()?.map((headCell, index) => (
          <TableCell
            key={headCell.id as string}
            align="left"
            padding="normal"
            style={{
              lineHeight: '1.5rem',
              fontSize: '0.875rem',
              padding: tableCellStyle(),
              fontWeight: '700',
            }}
            sortDirection={orderBy === headCell.field ? order : 'asc'}
          >
            {index === 0 && !showOrganizations && !showImportJobs && (
              <Checkbox
                disableRipple
                color="primary"
                style={{ padding: '0 12px' }}
                indeterminate={
                  (numSelected &&
                    rowCount &&
                    numSelected > 0 &&
                    numSelected < rowCount) ||
                  false
                }
                checked={
                  ((rowCount ?? 0) > 0 && numSelected === rowCount) || false
                }
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
              disabled={headCell.sorting === false}
            >
              {headCell.title}
            </TableSortLabel>
          </TableCell>
        ))}
      </TableRow>
    </TableHead>
  );
};
