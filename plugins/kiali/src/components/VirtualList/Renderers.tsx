import * as React from 'react';
import { Link } from 'react-router-dom';

import { TableCell, Tooltip } from '@material-ui/core';

import { KialiIcon, serverConfig } from '../../config';
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
import { HealthIndicator } from '../Health/HealthIndicator';
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

// Links TODO

const topPosition = 'top';

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
  _: Resource,
  badge: PFBadgeType,
) => {
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
      key={`VirtuaItem_Item_${resource.namespace}_${item.name}`}
      style={{ verticalAlign: 'middle' }}
    >
      <PFBadge badge={serviceBadge} position={topPosition} />
    </TableCell>
  );
};

export const cluster: Renderer<TResource> = (resource: TResource) => {
  return (
    <TableCell
      role="gridcell"
      key={`VirtuaItem_Cluster_${resource.cluster}`}
      style={{ verticalAlign: 'middle' }}
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
      style={{ verticalAlign: 'middle' }}
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
) => {
  // @ts-ignore
  let path = window.location.pathname;
  path = path.substring(path.lastIndexOf('/console') + '/console'.length + 1);
  // const labelFilt = path === 'overview' ? NsLabelFilter : labelFilter;
  // const filters = FilterHelper.getFiltersFromURL([labelFilt, appLabelFilter, versionLabelFilter]);

  return (
    <TableCell
      role="gridcell"
      key={`VirtuaItem_Labels_${
        'namespace' in resource && `${resource.namespace}_`
      }${resource.name}`}
      style={{ verticalAlign: 'middle', paddingBottom: '0.25rem' }}
    >
      {resource.labels &&
        Object.entries(resource.labels).map(([key, value]) => {
          return (
            <Tooltip key={`Tooltip_Label_${key}_${value}`} title={value}>
              <div>{value}</div>
            </Tooltip>
          );
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
    >
      {healthI && <HealthIndicator id={resource.name} health={healthI} />}
    </TableCell>
  );
};

export const details: Renderer<WorkloadListItem | ServiceListItem> = (
  resource: WorkloadListItem | ServiceListItem,
) => {
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
