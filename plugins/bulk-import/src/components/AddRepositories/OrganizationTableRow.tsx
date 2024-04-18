import * as React from 'react';

import { Link } from '@backstage/core-components';

import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import TableCell from '@mui/material/TableCell';
import TableRow from '@mui/material/TableRow';

import { AddRepositoriesData } from '../../types';
import {
  getRepositoryStatusForOrg,
  getSelectedRepositories,
  urlHelper,
} from '../../utils/repository-utils';

const tableCellStyle = {
  lineHeight: '1.5rem',
  fontSize: '0.875rem',
  padding: '15px 16px 15px 24px',
};

export const OrganizationTableRow = ({
  onOrgRowSelected,
  data,
  alreadyAdded,
}: {
  onOrgRowSelected: (org: AddRepositoriesData) => void;
  data: AddRepositoriesData;
  alreadyAdded: number;
}) => {
  return (
    <TableRow hover>
      <TableCell component="th" scope="row" padding="none" sx={tableCellStyle}>
        {data.name}
      </TableCell>
      <TableCell align="left" sx={tableCellStyle}>
        <Link to={data.url}>
          <>
            {urlHelper(data.url)}
            <OpenInNewIcon
              style={{ verticalAlign: 'sub', paddingTop: '7px' }}
            />
          </>
        </Link>
      </TableCell>
      <TableCell align="left" sx={tableCellStyle}>
        {getSelectedRepositories(onOrgRowSelected, data, alreadyAdded)}
      </TableCell>
      <TableCell align="left" sx={tableCellStyle}>
        {getRepositoryStatusForOrg(data, alreadyAdded)}
      </TableCell>
    </TableRow>
  );
};
