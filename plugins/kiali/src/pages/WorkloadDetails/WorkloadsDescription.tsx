import * as React from 'react';

import {
  Card,
  CardBody,
  CardHeader,
  Title,
  TitleSizes,
  Tooltip,
  TooltipPosition,
} from '@patternfly/react-core';

import { HealthIndicator } from '../../components/Health/HealthIndicator';
import { renderAPILogo, renderRuntimeLogo } from '../../components/Logos/Logos';
import { PFBadge, PFBadges } from '../../components/Pf/PfBadges';
import { TextOrLink } from '../../components/TextOrLink';
import { LocalTime } from '../../components/Time/LocalTime';
import { isMultiCluster, serverConfig } from '../../config';
import { KialiIcon } from '../../config/KialiIcon';
import { kialiStyle } from '../../styles/StyleUtils';
import * as H from '../../types/Health';
import { Workload } from '../../types/Workload';

type WorkloadDescriptionProps = {
  health?: H.Health;
  namespace?: string;
  workload?: Workload;
};

const resourceListStyle = kialiStyle({
  marginBottom: '0.75rem',
  $nest: {
    '& > ul > li span': {
      float: 'left',
      width: '125px',
      fontWeight: 700,
    },
  },
});

const iconStyle = kialiStyle({
  display: 'inline-block',
});

const infoStyle = kialiStyle({
  marginLeft: '0.5rem',
  verticalAlign: '-0.125rem',
});

const healthIconStyle = kialiStyle({
  marginLeft: '0.5rem',
  verticalAlign: '-0.075rem',
});

const additionalItemStyle = kialiStyle({
  display: 'flex',
  alignItems: 'center',
});

const runtimeInfoStyle = kialiStyle({
  display: 'flex',
  alignItems: 'center',
  marginTop: '0.5rem',
});

export const WorkloadDescription: React.FC<WorkloadDescriptionProps> = (
  props: WorkloadDescriptionProps,
) => {
  const workload = props.workload;
  const apps: string[] = [];
  const services: string[] = [];

  if (workload) {
    if (workload.labels[serverConfig.istioLabels.appLabelName]) {
      apps.push(workload.labels[serverConfig.istioLabels.appLabelName]);
    }

    workload.services?.forEach(s => services.push(s.name));
  }

  const runtimes = (workload?.runtimes ?? [])
    .map(r => r.name)
    .filter(name => name !== '');

  const workloadProperties = workload ? (
    <>
      <div key="properties-list" className={resourceListStyle}>
        <ul style={{ listStyleType: 'none' }}>
          {workload.istioInjectionAnnotation !== undefined && (
            <li>
              <span>Istio Injection</span>
              {String(workload.istioInjectionAnnotation)}
            </li>
          )}

          <li>
            <span>Type</span>
            {workload.type ? workload.type : 'N/A'}
          </li>

          <li>
            <span>Created</span>
            <div style={{ display: 'inline-block' }}>
              <LocalTime time={workload.createdAt} />
            </div>
          </li>

          <li>
            <span>Version</span>
            {workload.resourceVersion}
          </li>

          {workload.additionalDetails.map((additionalItem, idx) => {
            return (
              <li
                key={`additional-details-${idx}`}
                id={`additional-details-${idx}`}
              >
                <div className={additionalItemStyle}>
                  <span>{additionalItem.title}</span>
                  {additionalItem.icon &&
                    renderAPILogo(additionalItem.icon, undefined, idx)}
                </div>
                <TextOrLink text={additionalItem.value} urlTruncate={64} />
              </li>
            );
          })}

          {runtimes.length > 0 && (
            <li id="runtimes">
              <div className={runtimeInfoStyle}>
                <span>Runtimes</span>
                <div style={{ display: 'inline-block' }}>
                  {runtimes
                    .map((rt, idx) => renderRuntimeLogo(rt, idx))
                    .reduce(
                      (list: React.ReactNode[], elem) =>
                        list.length > 0
                          ? [...list, <span key="sep"> | </span>, elem]
                          : [elem],
                      [],
                    )}
                </div>
              </div>
            </li>
          )}
        </ul>
      </div>
    </>
  ) : undefined;

  return workload ? (
    <Card id="WorkloadDescriptionCard" data-test="workload-description-card">
      <CardHeader>
        <Title headingLevel="h5" size={TitleSizes.lg}>
          <div key="service-icon" className={iconStyle}>
            <PFBadge badge={PFBadges.Workload} position={TooltipPosition.top} />
          </div>

          {props.workload ? props.workload.name : 'Workload'}

          {workloadProperties ? (
            <Tooltip
              position={TooltipPosition.right}
              content={
                <div style={{ textAlign: 'left' }}>{workloadProperties}</div>
              }
            >
              <KialiIcon.Info className={infoStyle} />
            </Tooltip>
          ) : undefined}

          <span className={healthIconStyle}>
            <HealthIndicator id={workload.name} health={props.health} />
          </span>
        </Title>

        {props.workload?.cluster && isMultiCluster && (
          <div key="cluster-icon" className={iconStyle}>
            <PFBadge
              badge={PFBadges.Cluster}
              position={TooltipPosition.right}
            />{' '}
            {props.workload.cluster}
          </div>
        )}
      </CardHeader>

      <CardBody>{props.workload?.name}</CardBody>
    </Card>
  ) : (
    <>Loading</>
  );
};
