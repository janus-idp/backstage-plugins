import React from 'react';

import { Link, Progress, TableColumn } from '@backstage/core-components';

import makeStyles from '@material-ui/core/styles/makeStyles';

import { vulnerabilitySummary } from '../../lib/utils';
import type { Layer } from '../../types';

export const columns: TableColumn[] = [
  {
    title: 'Tag',
    field: 'name',
    type: 'string',
    highlight: true,
  },
  {
    title: 'Last Modified',
    field: 'last_modified',
    type: 'date',
  },
  {
    title: 'Security Scan',
    field: 'securityScan',
    render: (rowData: any): React.ReactNode => {
      if (!rowData.securityDetails) {
        return (
          <span data-testid="quay-repo-security-scan-progress">
            <Progress />
          </span>
        );
      }
      const tagManifest = rowData.manifest_digest_raw;
      const retStr = vulnerabilitySummary(rowData.securityDetails as Layer);
      return <Link to={`tag/${tagManifest}`}>{retStr}</Link>;
    },
    id: 'securityScan',
  },
  {
    title: 'Size',
    field: 'size',
    type: 'numeric',
  },
  {
    title: 'Expires',
    field: 'expiration',
    type: 'date',
    emptyValue: <i>Never</i>,
  },
  {
    title: 'Manifest',
    field: 'manifest_digest',
    type: 'string',
  },
];

export const useStyles = makeStyles(theme => ({
  empty: {
    padding: theme.spacing(2),
    display: 'flex',
    justifyContent: 'center',
  },
}));
