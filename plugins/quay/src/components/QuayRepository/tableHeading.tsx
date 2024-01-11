import React from 'react';

import { Link, Progress, TableColumn } from '@backstage/core-components';

import { Tooltip } from '@material-ui/core';
import makeStyles from '@material-ui/core/styles/makeStyles';

import { vulnerabilitySummary } from '../../lib/utils';
import type { QuayTagData } from '../../types';

export const columns: TableColumn<QuayTagData>[] = [
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
    render: (rowData: QuayTagData): React.ReactNode => {
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
      const retStr = vulnerabilitySummary(rowData.securityDetails);
      return <Link to={`tag/${tagManifest}`}>{retStr}</Link>;
    },
    id: 'securityScan',
    sorting: false,
  },
  {
    title: 'Size',
    field: 'size',
    type: 'numeric',
    customSort: (a: QuayTagData, b: QuayTagData) => a.rawSize - b.rawSize,
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
    customSort: (a: QuayTagData, b: QuayTagData) =>
      a.manifest_digest_raw.localeCompare(b.manifest_digest_raw),
  },
];

export const useStyles = makeStyles(theme => ({
  empty: {
    padding: theme.spacing(2),
    display: 'flex',
    justifyContent: 'center',
  },
}));
