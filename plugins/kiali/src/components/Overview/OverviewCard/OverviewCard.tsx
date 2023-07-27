import React from 'react';

import { Link } from '@backstage/core-components';

import { Card, CardActions, CardContent, Grid } from '@material-ui/core';

import {
  CanaryUpgradeStatus,
  ComponentStatus,
  IstiodResourceThresholds,
  KialiConfigT,
  NamespaceInfo,
  OutboundTrafficPolicy,
  OverviewType,
} from '@janus-idp/backstage-plugin-kiali-common';

import { OverviewCardBody } from './OverviewCardBody';
import { OverviewCardHeader } from './OverviewCardHeader';
import { OverviewMetrics } from './OverviewMetrics';

declare const directionTypes: {
  inbound: string;
  outbound: string;
};
export type DirectionType = keyof typeof directionTypes;

export type DirectionTypeOptions = 'inbound' | 'outbound';

type OverviewCardProps = {
  canaryStatus?: CanaryUpgradeStatus;
  canaryUpgrade?: boolean;
  direction: DirectionTypeOptions;
  duration: number;
  ns: NamespaceInfo;
  outboundTrafficPolicy: OutboundTrafficPolicy;
  istioAPIEnabled?: boolean;
  istiodResourceThresholds?: IstiodResourceThresholds;
  istioStatus?: ComponentStatus[];
  kialiConfig: KialiConfigT;
  type: OverviewType;
};

const getLinks = (
  ns: NamespaceInfo,
  graphtype: string,
  duration: number,
  link: string,
): { [key: string]: string } => {
  // graph Params

  const graphTypeQ = `graphType=${graphtype}`;
  const durationQ = `duration=${duration}`;
  const namespaces = `namespaces=${ns.name}`;
  const graph = `${
    new URL('/console/graph/namespaces', link).href
  }?${graphTypeQ}&${durationQ}&${namespaces}`;

  // Istio Config List Params
  const validations = ns.validations;
  let validationP = '';
  if (validations) {
    if (validations.warnings) {
      validationP += 'configvalidation=Warning';
    }
    if (validationP !== '') {
      validationP += '&';
    }
    if (validations.errors) {
      validationP += 'configvalidation=Not+Valid';
    }
  }

  const istioValidations = `${
    new URL('/console/istio', link).href
  }?${namespaces}&${validationP}`;

  return {
    graph,
    istioValidations,
  };
};

export const OverviewCard = (props: OverviewCardProps) => {
  const links = getLinks(
    props.ns,
    props.type,
    props.duration,
    props.kialiConfig.kialiConsole,
  );
  const isIstioNs = props.ns.name === props.kialiConfig.server.istioNamespace;
  return (
    <Grid
      item
      zeroMinWidth
      key={`kiali_nscard_${props.ns.cluster}_${props.ns.name}`}
    >
      <Card>
        <OverviewCardHeader {...props} />
        <CardContent>
          <Grid container>
            <Grid item xs={12}>
              <OverviewCardBody {...props} />
            </Grid>
            <Grid item xs={12}>
              <OverviewMetrics {...props} isIstioNs={isIstioNs} />
            </Grid>
          </Grid>
        </CardContent>
        <CardActions>
          <Link to={links.graph}>Go To Kiali Graph</Link>
        </CardActions>
      </Card>
    </Grid>
  );
};
