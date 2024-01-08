import React from 'react';

import { Link, Progress, TableColumn } from '@backstage/core-components';

import { Tooltip } from '@material-ui/core';
import makeStyles from '@material-ui/core/styles/makeStyles';

import { vulnerabilitySummary } from '../../lib/utils';
import type { QuayTagData } from '../../types';

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
      const quayRowData = rowData as QuayTagData;
      if (!quayRowData.securityStatus && !quayRowData.securityDetails) {
        return (
          <span data-testid="quay-repo-security-scan-progress">
            <Progress />
          </span>
        );
      }

      if (quayRowData.securityStatus === 'unsupported') {
        return (
          <Tooltip title="The manifest for this tag has an operating system or package manager unsupported by Quay Security Scanner">
            <span data-testid="quay-repo-security-scan-unsupported">
              Unsupported
            </span>
          </Tooltip>
        );
      }

      const tagManifest = quayRowData.manifest_digest_raw;
      const retStr = vulnerabilitySummary(quayRowData.securityDetails);
      return <Link to={`tag/${tagManifest}`}>{retStr}</Link>;
    },
    id: 'securityScan',
    sorting: false,
  },
  {
    title: 'Size',
    field: 'size',
    type: 'numeric',
    customSort: (a, b) => {
      const A = a as QuayTagData;
      const B = b as QuayTagData;

      return A.rawSize - B.rawSize;
    },
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
    customSort: (a, b) => {
      const A = a as QuayTagData;
      const B = b as QuayTagData;

      return A.manifest_digest_raw.localeCompare(B.manifest_digest_raw);
    },
  },
];

export const useStyles = makeStyles(theme => ({
  empty: {
    padding: theme.spacing(2),
    display: 'flex',
    justifyContent: 'center',
  },
}));
