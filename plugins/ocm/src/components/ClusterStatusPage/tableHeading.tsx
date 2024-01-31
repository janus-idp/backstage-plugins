import { TableColumn } from '@backstage/core-components';

import semver from 'semver';

import { ClusterStatusRowData } from '../../types';

export const columns: TableColumn<ClusterStatusRowData>[] = [
  {
    title: 'Name',
    field: 'name',
    highlight: true,
    customSort: (a, b) => {
      // The children type here is actually a ReactNode, but we know it's a string
      return (a.name.props.children as string).localeCompare(
        b.name.props.children as string,
        'en',
      );
    },
  },
  {
    title: 'Status',
    field: 'status',
    customSort: (a, b) => {
      const availabilityA = a.status.props.status.available;
      const availabilityB = b.status.props.status.available;
      if (availabilityA === availabilityB) return 0;
      return availabilityA ? -1 : 1;
    },
  },
  {
    title: 'Infrastructure',
    field: 'infrastructure',
  },
  {
    title: 'Version',
    field: 'version',
    customSort: (a, b) => {
      return semver.gt(
        a.version.props.data.version,
        b.version.props.data.version,
      )
        ? 1
        : -1;
    },
  },
  {
    title: 'Nodes',
    field: 'nodes',
    customSort: (a, b) => {
      return a.nodes.props.nodes.length - b.nodes.props.nodes.length;
    },
  },
];
