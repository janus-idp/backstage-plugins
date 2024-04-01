import * as React from 'react';

import { Link } from '@backstage/core-components';

import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import Checkbox from '@mui/material/Checkbox';
import TableCell from '@mui/material/TableCell';
import TableRow from '@mui/material/TableRow';

import { AddRepositoriesData, RepositoryStatus } from '../../types';
import { urlHelper } from '../../utils/repository-utils';
import { CatalogInfoStatus } from './CatalogInfoStatus';

export const RepositoryTableRow = ({
  handleClick,
  isItemSelected,
  data,
  selectedRepositoryStatus,
  isDrawer = false,
}: {
  handleClick: (_event: React.MouseEvent, id: number) => void;
  isItemSelected: boolean;
  data: AddRepositoriesData;
  selectedRepositoryStatus: string;
  isDrawer?: boolean;
}) => {
  const tableCellStyle = {
    lineHeight: '1.5rem',
    fontSize: '0.875rem',
    padding: '15px 16px 15px 6px',
  };
  return (
    <TableRow
      hover
      aria-checked={isItemSelected}
      tabIndex={-1}
      key={data.id}
      selected={isItemSelected}
    >
      <TableCell component="th" scope="row" padding="none" sx={tableCellStyle}>
        <Checkbox
          disableRipple
          color="primary"
          checked={
            selectedRepositoryStatus === RepositoryStatus.Exists
              ? true
              : isItemSelected
          }
          disabled={selectedRepositoryStatus === RepositoryStatus.Exists}
          onClick={event => handleClick(event, data.id)}
          style={{ padding: '0 12px' }}
        />
        {data.repoName}
      </TableCell>
      <TableCell align="left" sx={tableCellStyle}>
        <Link to={data.repoUrl || ''}>
          <>
            {urlHelper(data?.repoUrl || '')}
            <OpenInNewIcon
              style={{ verticalAlign: 'sub', paddingTop: '7px' }}
            />
          </>
        </Link>
      </TableCell>
      {!isDrawer && (
        <TableCell align="left" sx={tableCellStyle}>
          <Link to={data?.organizationUrl || ''}>
            <>
              {urlHelper(data?.organizationUrl || '')}
              <OpenInNewIcon
                style={{ verticalAlign: 'sub', paddingTop: '7px' }}
              />
            </>
          </Link>
        </TableCell>
      )}

      <TableCell align="left" sx={tableCellStyle}>
        <CatalogInfoStatus
          data={data}
          isItemSelected={isItemSelected}
          isDrawer={isDrawer}
        />
      </TableCell>
    </TableRow>
  );
};
