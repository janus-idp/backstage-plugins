import React from 'react';
import { Link, TableColumn } from '@backstage/core-components';
import makeStyles from '@material-ui/core/styles/makeStyles';
import type { Layer } from '../../types';

const vulnerabilitySummary = (layer?: Layer): string => {
  if (!layer) {
    return 'No security scan';
  }
  const summary: Record<string, number> = {};

  layer.Features.forEach(feature => {
    feature.Vulnerabilities?.forEach(vulnerability => {
      const { Severity } = vulnerability;
      if (!summary[Severity]) {
        summary[Severity] = 0;
      }
      summary[Severity]++;
    });
  });

  return Object.entries(summary)
    .map(([severity, count]) => `${severity}: ${count}`)
    .join(', ');
};

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
      const tagManifest = rowData.manifest_digest_raw as string;
      const retStr = vulnerabilitySummary(rowData.securityDetails as Layer);
      return <Link to={`tag/${tagManifest}`}>{retStr}</Link>;
    },
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
