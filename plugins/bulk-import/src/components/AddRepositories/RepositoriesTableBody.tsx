import * as React from 'react';

import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableRow from '@mui/material/TableRow';

import { AddedRepositories, AddRepositoryData } from '../../types';
import { OrganizationTableRow } from './OrganizationTableRow';
import { RepositoriesColumnHeader } from './RepositoriesColumnHeader';
import { RepositoryTableRow } from './RepositoryTableRow';

export const RepositoriesTableBody = ({
  loading,
  ariaLabel,
  showOrganizations,
  rows,
  emptyRows,
  onOrgRowSelected,
  onClick,
  selectedRepos,
  isDrawer,
}: {
  loading: boolean;
  ariaLabel: string;
  emptyRows: number;
  rows: AddRepositoryData[];
  onOrgRowSelected: (org: AddRepositoryData) => void;
  onClick: (_event: React.MouseEvent, repo: AddRepositoryData) => void;
  selectedRepos: AddedRepositories;
  isDrawer?: boolean;
  showOrganizations?: boolean;
}) => {
  const isSelected = (id: string) => {
    return !!selectedRepos[id];
  };

  if (loading) {
    return (
      <tbody>
        <tr>
          <td colSpan={RepositoriesColumnHeader.length}>
            <Box
              data-testid={`${ariaLabel}-loading`}
              sx={{
                padding: 2,
                display: 'flex',
                justifyContent: 'center',
              }}
            >
              <CircularProgress />
            </Box>
          </td>
        </tr>
      </tbody>
    );
  } else if (rows?.length > 0) {
    return (
      <TableBody>
        {rows.map(row => {
          const isItemSelected = isSelected(row.id);
          return showOrganizations ? (
            <OrganizationTableRow
              key={row.id}
              onOrgRowSelected={onOrgRowSelected}
              data={row}
            />
          ) : (
            <RepositoryTableRow
              key={row.id}
              handleClick={onClick}
              isItemSelected={isItemSelected}
              data={row}
              isDrawer={isDrawer}
            />
          );
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
        <td colSpan={RepositoriesColumnHeader.length}>
          <Box
            data-testid="no-repositories-found"
            sx={{
              p: 2,
              display: 'flex',
              justifyContent: 'center',
            }}
          >
            No records found
          </Box>
        </td>
      </tr>
    </tbody>
  );
};
