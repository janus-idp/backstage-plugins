import React from 'react';

import { EntityRefLinkProps } from '@backstage/plugin-catalog-react';

import {
  ClusterNodesStatus,
  ClusterStatus,
  ClusterUpdate,
} from '@janus-idp/backstage-plugin-ocm-common';

export type versionDetails = {
  version: string;
  update: ClusterUpdate;
};

export type ClusterStatusRowData = {
  name: React.ReactElement<EntityRefLinkProps>;
  status: React.ReactElement<{ status: ClusterStatus }>;
  infrastructure: string;
  version: React.ReactElement<{ data: versionDetails }>;
  nodes: React.ReactElement<{ nodes: Array<ClusterNodesStatus> }>;
};
