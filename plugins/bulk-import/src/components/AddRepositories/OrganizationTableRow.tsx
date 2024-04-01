import * as React from 'react';

import { Link } from '@backstage/core-components';

import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import TableCell from '@mui/material/TableCell';
import TableRow from '@mui/material/TableRow';

import { AddRepositoriesData } from '../../types';
import {
  getSelectedRepositoriesCount,
  urlHelper,
} from '../../utils/repository-utils';
import { CatalogInfoStatus } from './CatalogInfoStatus';

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
        {data.orgName}
      </TableCell>
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
      <TableCell align="left" sx={tableCellStyle}>
        {getSelectedRepositoriesCount(onOrgRowSelected, data, alreadyAdded)}
      </TableCell>
      <TableCell align="left" sx={tableCellStyle}>
        <CatalogInfoStatus data={data} alreadyAdded={alreadyAdded} />
      </TableCell>
    </TableRow>
  );
};
