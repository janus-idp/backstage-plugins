import React from 'react';

import { Link, Table, TableColumn } from '@backstage/core-components';
import type { RouteFunc } from '@backstage/core-plugin-api';

import { makeStyles, TableContainer, TableHead } from '@material-ui/core';
import KeyboardBackspaceIcon from '@material-ui/icons/KeyboardBackspace';
import LinkIcon from '@material-ui/icons/Link';
import WarningIcon from '@material-ui/icons/Warning';

import { SEVERITY_COLORS } from '../../lib/utils';
import {
  Layer,
  Vulnerability,
  VulnerabilityListItem,
  VulnerabilityOrder,
} from '../../types';

type QuayTagDetailsProps = {
  layer: Layer;
  digest: string;
  rootLink: RouteFunc<undefined>;
};

// from: https://github.com/quay/quay/blob/f1d85588157eababc3cbf789002c5db521dbd616/web/src/routes/TagDetails/SecurityReport/SecurityReportTable.tsx#L43
const getVulnerabilityLink = (link: string) => link.split(' ')[0];

const columns: TableColumn[] = [
  {
    title: 'Advisory',
    field: 'name',
    render: (rowData: any): React.ReactNode => {
      const row = rowData as Vulnerability;
      return (
        <div style={{ display: 'flex', alignItems: 'center' }}>
          {row.Name}
          {row.Link.trim().length > 0 ? (
            <Link to={getVulnerabilityLink(row.Link)}>
              <LinkIcon style={{ marginLeft: '0.5rem' }} />
            </Link>
          ) : null}
        </div>
      );
    },
  },
  {
    title: 'Severity',
    field: 'Severity',
    render: (rowData: any): React.ReactNode => {
      const row = rowData as Vulnerability;
      return (
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <WarningIcon
            htmlColor={SEVERITY_COLORS[row.Severity]}
            style={{
              marginRight: '0.5rem',
            }}
          />
          <span>{row.Severity}</span>
        </div>
      );
    },
  },
  {
    title: 'Package Name',
    field: 'PackageName',
    type: 'string',
  },
  {
    title: 'Current Version',
    field: 'CurrentVersion',
    type: 'string',
  },
  {
    title: 'Fixed By',
    field: 'FixedBy',
    render: (rowData: any): React.ReactNode => {
      const row = rowData as VulnerabilityListItem;
      return (
        <>
          {row.FixedBy.length > 0 ? (
            <>
              <span>{row.FixedBy}</span>
            </>
          ) : (
            '(None)'
          )}
        </>
      );
    },
  },
];

const useStyles = makeStyles({
  link: {
    display: 'flex',
    alignItems: 'center',
  },
  linkText: {
    marginLeft: '0.5rem',
    fontSize: '1.1rem',
  },
  tableHead: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: '1rem',
  },
});

export const QuayTagDetails = ({
  layer,
  rootLink,
  digest,
}: QuayTagDetailsProps) => {
  const classes = useStyles();
  const vulnerabilities = layer.Features.filter(
    feat => typeof feat.Vulnerabilities !== 'undefined',
  )
    .map(feature => {
      // TS doesn't seem to register this list as never being undefined from the above filter
      // so we cast it into the list
      // NOSONAR - irrelevant as per above comment
      return (feature.Vulnerabilities as Vulnerability[]).map(
        (v: Vulnerability): VulnerabilityListItem => {
          return {
            ...v,
            PackageName: feature.Name,
            CurrentVersion: feature.Version,
          };
        },
      );
    })
    .flat()
    .sort((a, b) => {
      const severityA = VulnerabilityOrder[a.Severity];
      const severityB = VulnerabilityOrder[b.Severity];

      return severityA - severityB;
    });

  return (
    <TableContainer>
      <TableHead className={classes.tableHead}>
        <Link to={rootLink()} className={classes.link}>
          <KeyboardBackspaceIcon />
          <span className={classes.linkText}>Back to repository</span>
        </Link>
      </TableHead>
      <Table
        title={`Vulnerabilities for ${digest.substring(0, 17)}`}
        data={vulnerabilities}
        columns={columns}
      />
    </TableContainer>
  );
};

export default QuayTagDetails;
