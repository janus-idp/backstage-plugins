import React from 'react';

import { V1Pod, V1Service, V1ServicePort } from '@kubernetes/client-node';
import { ChartLabel } from '@patternfly/react-charts';
import { LongArrowAltRightIcon } from '@patternfly/react-icons';
import { BaseNode } from '@patternfly/react-topology';

import ResourceName from '../../../common/components/ResourceName';
import ResourceStatus from '../../../common/components/ResourceStatus';
import Status from '../../../common/components/Status';
import { MAXSHOWRESCOUNT } from '../../../const';
import {
  CronJobModel,
  JobModel,
  PodModel,
  ServiceModel,
} from '../../../models';
import { JobData } from '../../../types/jobs';
import { podPhase } from '../../../utils/pod-resource-utils';
import { byCreationTime } from '../../../utils/resource-utils';
import PodStatus from '../../Pods/PodStatus';
import PLRlist from './PLRlist';
import { PodLogsDialog } from './PodLogs/PodLogsDialog';
import IngressListSidebar from './Resources/IngressListSidebar';
import RouteListSidebar from './Resources/RouteListSidebar';
import TopologyResourcesTabPanelItem from './TopologyResourcesTabPaneltem';

import './TopologyResourcesTabPanel.css';

type TopologyResourcesTabPanelProps = { node: BaseNode };

const TopologyResourcesTabPanel = ({
  node,
}: TopologyResourcesTabPanelProps) => {
  const data = node.getData();
  const nodeData = data?.data;
  const resource = data?.resource;
  const pipelines = nodeData?.pipelinesData?.pipelines;
  const pipelineRuns = nodeData?.pipelinesData?.pipelineRuns;
  const showIngressRoute = () => {
    const { ingressesData, routesData } = nodeData;
    const hasIngressData = ingressesData?.length > 0;
    const hasRoutesData = routesData?.length > 0;
    if (hasIngressData && hasRoutesData) {
      return (
        <>
          <RouteListSidebar routesData={routesData} />
          <IngressListSidebar ingressesData={ingressesData} />
        </>
      );
    } else if (hasRoutesData && !hasIngressData) {
      return <RouteListSidebar routesData={routesData} />;
    }

    return <IngressListSidebar ingressesData={ingressesData} />;
  };

  return (
    <div data-testid="resources-tab">
      <TopologyResourcesTabPanelItem
        resourceLabel={PodModel.labelPlural}
        showResCount={
          nodeData?.podsData?.pods?.length > MAXSHOWRESCOUNT
            ? MAXSHOWRESCOUNT
            : undefined
        }
        dataTest="pod-list"
      >
        {nodeData?.podsData?.pods?.length &&
          nodeData.podsData.pods
            .sort(byCreationTime)
            .slice(0, MAXSHOWRESCOUNT)
            .map((pod: V1Pod) => {
              const status = podPhase(pod);
              return (
                <li
                  style={{ gap: '10px' }}
                  className="item"
                  key={pod.metadata?.uid}
                >
                  <span style={{ flex: '1' }}>
                    <ResourceName
                      name={pod.metadata?.name ?? ''}
                      kind={pod.kind ?? ''}
                    />
                  </span>
                  <span style={{ flex: '1' }}>
                    {' '}
                    <ResourceStatus
                      additionalClassNames="hidden-xs"
                      noStatusBackground
                    >
                      {status ? <Status status={status} /> : '-'}
                    </ResourceStatus>
                  </span>
                  <span style={{ flex: '1' }}>
                    <PodLogsDialog podData={pod} />
                  </span>
                </li>
              );
            })}
      </TopologyResourcesTabPanelItem>
      {pipelines?.length > 0 ? (
        <PLRlist pipelines={pipelines} pipelineRuns={pipelineRuns} />
      ) : null}
      {resource.kind === CronJobModel.kind ? (
        <TopologyResourcesTabPanelItem
          resourceLabel={JobModel.labelPlural}
          dataTest="job-list"
        >
          {nodeData?.jobsData?.length &&
            nodeData.jobsData.map((jobData: JobData) => (
              <li
                className="item"
                key={jobData.job.metadata?.uid}
                style={{ alignItems: 'center' }}
              >
                <span style={{ flex: '1' }}>
                  <ResourceName
                    name={jobData.job.metadata?.name ?? ''}
                    kind={jobData.job.kind ?? ''}
                  />
                </span>
                <span className="bs-topology-job-pod-ring">
                  <PodStatus
                    standalone
                    data={jobData.podsData.pods}
                    size={25}
                    innerRadius={8}
                    outerRadius={12}
                    title={`${jobData.podsData.pods.length}`}
                    titleComponent={<ChartLabel style={{ fontSize: '10px' }} />}
                    showTooltip={false}
                  />
                </span>
              </li>
            ))}
        </TopologyResourcesTabPanelItem>
      ) : null}
      <TopologyResourcesTabPanelItem
        resourceLabel={ServiceModel.labelPlural}
        dataTest="service-list"
      >
        {nodeData?.services?.length &&
          nodeData.services.map((service: V1Service) => (
            <li
              className="item"
              style={{ flexDirection: 'column' }}
              key={service.metadata?.uid}
            >
              <span>
                <ResourceName
                  name={service.metadata?.name ?? ''}
                  kind={service.kind ?? ''}
                />
              </span>
              <ul>
                {(service.spec?.ports ?? []).map(
                  ({ name, port, protocol, targetPort }: V1ServicePort) => (
                    <li key={name || `${port}-${protocol}`}>
                      <span className="bs-topology-text-muted">
                        Service port:
                      </span>{' '}
                      {name || `${port}-${protocol}`}
                      &nbsp;
                      <LongArrowAltRightIcon />
                      &nbsp;
                      <span className="bs-topology-text-muted">
                        Pod port:
                      </span>{' '}
                      {targetPort}
                    </li>
                  ),
                )}
              </ul>
            </li>
          ))}
      </TopologyResourcesTabPanelItem>
      {showIngressRoute()}
    </div>
  );
};

export default TopologyResourcesTabPanel;
