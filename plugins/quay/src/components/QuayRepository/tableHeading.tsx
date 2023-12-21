import React from 'react';

import { Link, Progress, TableColumn } from '@backstage/core-components';

import { Tooltip } from '@material-ui/core';
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
      if (!rowData.securityStatus && !rowData.securityDetails) {
        return (
          <span data-testid="quay-repo-security-scan-progress">
            <Progress />
          </span>
        );
      }

      if (rowData.securityStatus === 'unsupported') {
        return (
          <Tooltip title="The manifest for this tag has an operating system or package manager unsupported by Quay Security Scanner">
            <span data-testid="quay-repo-security-scan-unsupported">
              Unsupported
            </span>
          </Tooltip>
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
