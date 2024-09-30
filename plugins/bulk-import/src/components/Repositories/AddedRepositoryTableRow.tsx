import * as React from 'react';

import { Link } from '@backstage/core-components';

import { makeStyles, TableCell, TableRow } from '@material-ui/core';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { useFormikContext } from 'formik';

import { AddRepositoriesFormValues, AddRepositoryData } from '../../types';
import {
  calculateLastUpdated,
  getImportStatus,
  urlHelper,
} from '../../utils/repository-utils';
import CatalogInfoAction from './CatalogInfoAction';
import DeleteRepository from './DeleteRepository';
import SyncRepository from './SyncRepository';

const useStyles = makeStyles(() => ({
  tableCellStyle: {
    lineHeight: '1.5rem',
    fontSize: '0.875rem',
  },
}));

const ImportStatus = ({ data }: { data: AddRepositoryData }) => {
  const { values } = useFormikContext<AddRepositoriesFormValues>();
  return getImportStatus(
    values.repositories?.[data.id]?.catalogInfoYaml?.status as string,
    true,
  );
};

const LastUpdated = ({ data }: { data: AddRepositoryData }) => {
  const { values } = useFormikContext<AddRepositoriesFormValues>();
  return calculateLastUpdated(
    values.repositories?.[data.id]?.catalogInfoYaml?.lastUpdated || '',
  );
};

export const AddedRepositoryTableRow = ({
  data,
}: {
  data: AddRepositoryData;
}) => {
  const classes = useStyles();

  return (
    <TableRow hover key={data.id}>
      <TableCell component="th" scope="row" className={classes.tableCellStyle}>
        {data.repoName}
      </TableCell>
      <TableCell align="left" className={classes.tableCellStyle}>
        <Link to={data?.repoUrl || ''}>
          {urlHelper(data?.repoUrl || '')}
          <OpenInNewIcon style={{ verticalAlign: 'sub', paddingTop: '7px' }} />
        </Link>
      </TableCell>
      <TableCell align="left" className={classes.tableCellStyle}>
        <Link to={data?.organizationUrl || ''}>
          {urlHelper(data?.organizationUrl || '')}
          <OpenInNewIcon style={{ verticalAlign: 'sub', paddingTop: '7px' }} />
        </Link>
      </TableCell>

      <TableCell align="left" className={classes.tableCellStyle}>
        <ImportStatus data={data} />
      </TableCell>

      <TableCell align="left" className={classes.tableCellStyle}>
        <LastUpdated data={data} />
      </TableCell>
      <TableCell align="left" className={classes.tableCellStyle}>
        <CatalogInfoAction data={data} />
        <DeleteRepository data={data} />
        <SyncRepository data={data} />
      </TableCell>
    </TableRow>
  );
};
