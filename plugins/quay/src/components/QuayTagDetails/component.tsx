import { Table, TableColumn } from '@backstage/core-components';
import React from 'react';
import {
  Layer,
  Vulnerability,
  VulnerabilityListItem,
  VulnerabilitySeverity,
} from '../../types';
import Link from '@material-ui/icons/Link';
import Warning from '@material-ui/icons/Warning';
import { getSeverityColor } from '../../lib/utils';

type QuayTagDetailsProps = {
  layer: Layer;
};

// from: https://github.com/quay/quay/blob/f1d85588157eababc3cbf789002c5db521dbd616/web/src/routes/TagDetails/SecurityReport/SecurityReportTable.tsx#L43
const getVulnerabilityLink = (link: string) => link.split(' ')[0] as string;

const columns: TableColumn[] = [
  {
    title: 'Advisory',
    field: 'name',
    render: (rowData: any): React.ReactNode => {
      const row = rowData as Vulnerability;
      // eslint-disable-next-line no-console
      console.log('row', row);
      return (
        <>
          {row.Name}
          {row.Link.trim().length > 0 ? (
            <a
              href={getVulnerabilityLink(row.Link)}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Link style={{ marginLeft: '5px' }} />
            </a>
          ) : null}
        </>
      );
    },
  },
  {
    title: 'Severity',
    field: 'Severity',
    render: (rowData: any): React.ReactNode => {
      const row = rowData as Vulnerability;
      const severity = row.Severity as VulnerabilitySeverity;
      return (
        <>
          {/* TODO: figure out a way for the warning icon to have color */}
          <Warning htmlColor={getSeverityColor(severity)} />
          <span>{severity}</span>
        </>
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

export const QuayTagDetails: React.FC<QuayTagDetailsProps> = ({
  layer,
}: QuayTagDetailsProps) => {
  const vulnerabilities = layer.Features.filter(
    feat => typeof feat.Vulnerabilities !== 'undefined',
  )
    .map(feature => {
      // TS doesn't seem to register this list as never being undefined from the above filter
      // so we cast it into the list
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
    .flat();

  return (
    <Table title="Vulnerabilities" data={vulnerabilities} columns={columns} />
  );
};

export default QuayTagDetails;
