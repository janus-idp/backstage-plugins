import * as React from 'react';
import { Link } from 'react-router-dom';

import { TableCell, Tooltip } from '@material-ui/core';

import { isMultiCluster, KialiIcon, serverConfig } from '../../config';
import { isWaypoint } from '../../helpers/LabelFilterHelper';
import { infoStyle } from '../../pages/Overview/OverviewCard/CanaryUpgradeProgress';
import { ControlPlaneBadge } from '../../pages/Overview/OverviewCard/ControlPlaneBadge';
import { OverviewCardSparklineCharts } from '../../pages/Overview/OverviewCard/OverviewCardSparklineCharts';
import { Health } from '../../types/Health';
import { IstioConfigItem } from '../../types/IstioConfigList';
import { ValidationStatus } from '../../types/IstioObjects';
import { ComponentStatus } from '../../types/IstioStatus';
import { NamespaceInfo } from '../../types/NamespaceInfo';
import { ServiceListItem } from '../../types/ServiceList';
import { WorkloadListItem } from '../../types/Workload';
import { StatefulFilters } from '../Filters/StatefulFilters';
import { HealthIndicator } from '../Health/HealthIndicator';
import { Label } from '../Label/Label';
import { getIstioObjectUrl } from '../Link/IstioObjectLink';
import { ValidationSummaryLink } from '../Link/ValidationSummaryLink';
import { NamespaceMTLSStatus } from '../MTls/NamespaceMTLSStatus';
import { PFBadge, PFBadges, PFBadgeType } from '../Pf/PfBadges';
import { ValidationSummary } from '../Validations/ValidationSummary';
import {
  IstioTypes,
  Renderer,
  Resource,
  SortResource,
  TResource,
} from './Config';

const topPosition = 'top';

// Istio Links
const getIstioLink = (item: TResource): string => {
  let type = '';
  if ('type' in item) {
    type = item.type;
  }

  return getIstioObjectUrl(item.name, item.namespace, type, item.cluster);
};

// Links
const getLink = (item: TResource, config: Resource, query?: string): string => {
  let url =
    config.name === 'istio'
      ? getIstioLink(item)
      : `/namespaces/${item.namespace}/${config.name}/${item.name}`;

  if (item.cluster && isMultiCluster && !url.includes('cluster')) {
    if (url.includes('?')) {
      url = `${url}&clusterName=${item.cluster}`;
    } else {
      url = `${url}?clusterName=${item.cluster}`;
    }
  }

  if (query) {
    if (url.includes('?')) {
      url = `${url}&${query}`;
    } else {
      url = `${url}?${query}`;
    }
  }

  return url;
};

// Cells
export const actionRenderer = (
  key: string,
  action: React.ReactNode,
): React.ReactNode => {
  return (
    <TableCell
      role="gridcell"
      key={`VirtuaItem_Action_${key}`}
      style={{ verticalAlign: 'middle' }}
    >
      {action}
    </TableCell>
  );
};

export const item: Renderer<TResource> = (
  resource: TResource,
  config: Resource,
  badge: PFBadgeType,
) => {
  const key = `link_definition_${config.name}_${resource.namespace}_${resource.name}`;
  let serviceBadge = badge;

  if ('serviceRegistry' in resource && resource.serviceRegistry) {
    switch (resource.serviceRegistry) {
      case 'External':
        serviceBadge = PFBadges.ExternalService;
        break;
      case 'Federation':
        serviceBadge = PFBadges.FederatedService;
        break;
      default: // TODO
        serviceBadge = PFBadges.ExternalService;
        break;
    }
  }

  return (
    <TableCell
      role="gridcell"
      key={`VirtuaItem_Item_${resource.namespace}_${resource.name}`}
      style={{ verticalAlign: 'middle', whiteSpace: 'nowrap' }}
    >
      <PFBadge badge={serviceBadge} position={topPosition} />
      <Link key={key} to={getLink(resource, config)}>
        {resource.name}
      </Link>
    </TableCell>
  );
};

export const cluster: Renderer<TResource> = (resource: TResource) => {
  return (
    <TableCell
      role="gridcell"
      key={`VirtuaItem_Cluster_${resource.cluster}`}
      style={{ verticalAlign: 'middle', whiteSpace: 'nowrap' }}
    >
      <PFBadge badge={PFBadges.Cluster} position={topPosition} />
      {resource.cluster}
    </TableCell>
  );
};

export const namespace: Renderer<TResource> = (resource: TResource) => {
  return (
    <TableCell
      role="gridcell"
      key={`VirtuaItem_Namespace_${resource.namespace}_${item.name}`}
      style={{ verticalAlign: 'middle', whiteSpace: 'nowrap' }}
    >
      <PFBadge badge={PFBadges.Namespace} position={topPosition} />
      {resource.namespace}
    </TableCell>
  );
};

export const labels: Renderer<SortResource | NamespaceInfo> = (
  resource: SortResource | NamespaceInfo,
  _: Resource,
  __: PFBadgeType,
  ___?: Health,
  ____?: React.RefObject<StatefulFilters>,
) => {
  // @ts-ignore
  let path = window.location.pathname;
  path = path.substring(path.lastIndexOf('/console') + '/console'.length + 1);

  return (
    <TableCell
      role="gridcell"
      key={`VirtuaItem_Labels_${
        'namespace' in resource && `${resource.namespace}_`
      }${resource.name}`}
      style={{ verticalAlign: 'middle', paddingBottom: '0.25rem' }}
    >
      {resource.labels &&
        Object.entries(resource.labels).map(([key, value], i) => {
          return <Label key={`label_${i}`} name={key} value={value} />;
        })}
    </TableCell>
  );
};

export const health: Renderer<TResource> = (
  resource: TResource,
  __: Resource,
  _: PFBadgeType,
  healthI?: Health,
) => {
  return (
    <TableCell
      role="gridcell"
      key={`VirtuaItem_Health_${resource.namespace}_${resource.name}`}
      style={{ verticalAlign: 'middle' }}
      align="center"
    >
      {healthI && <HealthIndicator id={resource.name} health={healthI} />}
    </TableCell>
  );
};

export const details: Renderer<WorkloadListItem | ServiceListItem> = (
  resource: WorkloadListItem | ServiceListItem,
) => {
  const isAmbientWaypoint = isWaypoint(resource.labels);

  return (
    <TableCell
      role="gridcell"
      key={`VirtuaItem_Details_${resource.namespace}_${resource.name}`}
      style={{ verticalAlign: 'middle', whiteSpace: 'nowrap' }}
    >
      <ul>
        {resource.istioReferences?.length > 0 &&
          resource.istioReferences.map(ir => (
            <li
              key={
                ir.namespace
                  ? `${ir.objectType}_${ir.name}_${ir.namespace}`
                  : ir.name
              }
              style={{ marginBottom: '0.125rem' }}
            >
              <PFBadge badge={PFBadges[ir.objectType]} position={topPosition} />
              {ir.name}
            </li>
          ))}
        {isAmbientWaypoint && (
          <li style={{ marginBottom: '0.125rem' }}>
            <PFBadge badge={PFBadges.Waypoint} position={topPosition} />
            Waypoint Proxy
            <Tooltip
              key="tooltip_missing_label"
              title="Layer 7 service Mesh capabilities in Istio Ambient"
            >
              <KialiIcon.Info className={infoStyle} />
            </Tooltip>
          </li>
        )}
      </ul>
    </TableCell>
  );
};

export const tls: Renderer<NamespaceInfo> = (ns: NamespaceInfo) => {
  return (
    <TableCell
      role="gridcell"
      key={`VirtualItem_tls_${ns.name}`}
      style={{ verticalAlign: 'middle' }}
    >
      {ns.tlsStatus ? (
        <NamespaceMTLSStatus status={ns.tlsStatus.status} />
      ) : undefined}
    </TableCell>
  );
};

export const serviceConfiguration: Renderer<ServiceListItem> = (
  resource: ServiceListItem,
  _: Resource,
) => {
  const validation = resource.validation;

  return (
    <TableCell
      role="gridcell"
      key={`VirtuaItem_Conf_${resource.namespace}_${resource.name}`}
      style={{ verticalAlign: 'middle' }}
    >
      {validation ? <Link to="">${resource.name}</Link> : <>N/A</>}
    </TableCell>
  );
};

export const istioConfiguration: Renderer<IstioConfigItem> = (
  resource: IstioConfigItem,
  _: Resource,
) => {
  const validation = resource.validation;

  return (
    <TableCell
      role="gridcell"
      key={`VirtuaItem_Conf_${resource.namespace}_${resource.name}`}
      style={{ verticalAlign: 'middle' }}
    >
      {validation ? <Link to="">{resource.name}</Link> : <>N/A</>}
    </TableCell>
  );
};

export const workloadType: Renderer<WorkloadListItem> = (
  resource: WorkloadListItem,
) => {
  return (
    <TableCell
      role="gridcell"
      key={`VirtuaItem_WorkloadType_${resource.namespace}_${item.name}`}
      style={{ verticalAlign: 'middle' }}
    >
      {resource.type}
    </TableCell>
  );
};

export const istioType: Renderer<IstioConfigItem> = (
  resource: IstioConfigItem,
) => {
  const type = resource.type;
  const object = IstioTypes[type];

  return (
    <TableCell
      role="gridcell"
      key={`VirtuaItem_IstioType_${resource.namespace}_${resource.name}`}
      style={{ verticalAlign: 'middle' }}
    >
      {object.name}
    </TableCell>
  );
};

export const nsItem: Renderer<NamespaceInfo> = (
  ns: NamespaceInfo,
  _config: Resource,
  badge: PFBadgeType,
) => {
  // TODO: Status
  const istioStatus: ComponentStatus[] = [];

  return (
    <TableCell
      role="gridcell"
      key={`VirtuaItem_NamespaceItem_${ns.name}`}
      style={{ verticalAlign: 'middle' }}
    >
      <PFBadge badge={badge} />
      {ns.name}
      {ns.name === serverConfig.istioNamespace && (
        <ControlPlaneBadge
          cluster={ns.cluster}
          annotations={ns.annotations}
          status={istioStatus}
        />
      )}
    </TableCell>
  );
};

export const istioConfig: Renderer<NamespaceInfo> = (ns: NamespaceInfo) => {
  let validations: ValidationStatus = {
    objectCount: 0,
    errors: 0,
    warnings: 0,
  };

  if (!!ns.validations) {
    validations = ns.validations;
  }

  const status = (
    <TableCell
      role="gridcell"
      key={`VirtuaItem_IstioConfig_${ns.name}`}
      style={{ verticalAlign: 'middle' }}
    >
      <ValidationSummaryLink
        namespace={ns.name}
        objectCount={validations.objectCount}
        errors={validations.errors}
        warnings={validations.warnings}
      >
        <ValidationSummary
          id={`ns-val-${ns.name}`}
          errors={validations.errors}
          warnings={validations.warnings}
          objectCount={validations.objectCount}
        />
      </ValidationSummaryLink>
    </TableCell>
  );

  return status;
};

export const status: Renderer<NamespaceInfo> = (ns: NamespaceInfo) => {
  if (ns.status) {
    return (
      <TableCell
        role="gridcell"
        key={`VirtuaItem_Status_${ns.name}`}
        style={{ verticalAlign: 'middle' }}
      >
        <OverviewCardSparklineCharts
          istioAPIEnabled={false}
          key={`${ns.name}_chart`}
          name={ns.name}
          annotations={ns.annotations}
          duration={30} // TODO
          direction="inbound" // TODO
          metrics={ns.metrics}
          errorMetrics={ns.errorMetrics}
          controlPlaneMetrics={ns.controlPlaneMetrics}
        />
      </TableCell>
    );
  }

  return <TableCell role="gridcell" key={`VirtuaItem_Status_${ns.name}`} />;
};
