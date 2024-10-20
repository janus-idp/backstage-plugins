import * as React from 'react';
import { useAsync } from 'react-use';

import { Link } from '@backstage/core-components';
import { useApi } from '@backstage/core-plugin-api';

import { Checkbox, makeStyles, TableCell, TableRow } from '@material-ui/core';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';

import { bulkImportApiRef } from '../../api/BulkImportBackendClient';
import { AddRepositoryData, RepositoryStatus } from '../../types';
import { urlHelper } from '../../utils/repository-utils';
import { CatalogInfoStatus } from './CatalogInfoStatus';

const useStyles = makeStyles(() => ({
  tableCellStyle: {
    lineHeight: '1.5rem',
    fontSize: '0.875rem',
    padding: '15px 16px 15px 6px',
  },
}));

export const RepositoryTableRow = ({
  handleClick,
  isItemSelected,
  data,
  isDrawer = false,
}: {
  handleClick: (_event: React.MouseEvent, id: AddRepositoryData) => void;
  isItemSelected: boolean;
  data: AddRepositoryData;
  isDrawer?: boolean;
}) => {
  const classes = useStyles();
  const bulkImportApi = useApi(bulkImportApiRef);
  const { value, loading } = useAsync(async () => {
    if (data.repoUrl) {
      const result = await bulkImportApi.getImportAction(
        data.repoUrl,
        data?.defaultBranch || 'main',
      );
      return result;
    }
    return null;
  }, [data.repoUrl]);

  return (
    <TableRow
      hover
      aria-checked={isItemSelected}
      tabIndex={-1}
      key={data.id}
      selected={isItemSelected}
    >
      <TableCell
        component="th"
        scope="row"
        padding="none"
        className={classes.tableCellStyle}
      >
        <Checkbox
          disableRipple
          color="primary"
          checked={
            value?.status === RepositoryStatus.ADDED ? true : isItemSelected
          }
          disabled={loading || value?.status === RepositoryStatus.ADDED}
          onClick={event => handleClick(event, data)}
          style={{ padding: '0 12px' }}
        />
        {data.repoName}
      </TableCell>
      <TableCell align="left" className={classes.tableCellStyle}>
        {data.repoUrl ? (
          <Link to={data.repoUrl}>
            {urlHelper(data.repoUrl)}
            <OpenInNewIcon
              style={{ verticalAlign: 'sub', paddingTop: '7px' }}
            />
          </Link>
        ) : (
          <>-</>
        )}
      </TableCell>
      {!isDrawer && (
        <TableCell align="left" className={classes.tableCellStyle}>
          {data?.organizationUrl ? (
            <Link to={data.organizationUrl}>
              {urlHelper(data.organizationUrl)}
              <OpenInNewIcon
                style={{ verticalAlign: 'sub', paddingTop: '7px' }}
              />
            </Link>
          ) : (
            <>-</>
          )}
        </TableCell>
      )}

      <TableCell align="left" className={classes.tableCellStyle}>
        <CatalogInfoStatus
          data={data}
          importStatus={value?.status as string}
          isLoading={loading}
          isItemSelected={isItemSelected}
          isDrawer={isDrawer}
        />
      </TableCell>
    </TableRow>
  );
};
