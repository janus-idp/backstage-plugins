import React from 'react';
import { V1Pod, V1Service, V1ServicePort } from '@kubernetes/client-node';
import { LongArrowAltRightIcon } from '@patternfly/react-icons';
import { BaseNode } from '@patternfly/react-topology';
import ResourceStatus from '../../../common/components/ResourceStatus';
import Status from '../../../common/components/Status';
import { IngressModel, PodModel, ServiceModel } from '../../../models';
import { IngressData } from '../../../types/ingresses';
import ResourceName from '../../../common/components/ResourceName';
import TopologyResourcesTabPanelItem from './TopologyResourcesTabPaneltem';
import IngressRules from './IngressRules';

const TopologyResourcesTabPanel: React.FC<{ node: BaseNode }> = ({ node }) => {
  const nodeData = node.getData()?.data;
  return (
    <div data-testid="resources-tab">
      <TopologyResourcesTabPanelItem
        resourceLabel={PodModel.labelPlural}
        dataTest="pod-list"
      >
        {nodeData?.podsData?.pods?.length &&
          nodeData.podsData.pods.map((pod: V1Pod) => (
            <li className="item" key={pod.metadata?.uid}>
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
                  <Status status={pod.status?.phase ?? ''} />
                </ResourceStatus>
              </span>
            </li>
          ))}
      </TopologyResourcesTabPanelItem>
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
                      <span className="topology-text-muted">Service port:</span>{' '}
                      {name || `${port}-${protocol}`}
                      &nbsp;
                      <LongArrowAltRightIcon />
                      &nbsp;
                      <span className="topology-text-muted">
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
      <TopologyResourcesTabPanelItem
        resourceLabel={IngressModel.labelPlural}
        dataTest="ingress-list"
      >
        {nodeData?.ingressesData?.length &&
          nodeData.ingressesData.map((ingressData: IngressData) => (
            <li
              className="item"
              style={{ flexDirection: 'column' }}
              key={ingressData.ingress.metadata?.uid}
            >
              <span>
                <ResourceName
                  name={ingressData.ingress.metadata?.name ?? ''}
                  kind={ingressData.ingress.kind ?? ''}
                />
              </span>
              {ingressData.url && (
                <>
                  <span className="topology-text-muted">Location:</span>
                  <a
                    href={ingressData.url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {ingressData.url}
                  </a>
                </>
              )}
              {ingressData.ingress.spec?.rules?.length && (
                <IngressRules ingress={ingressData.ingress} />
              )}
            </li>
          ))}
      </TopologyResourcesTabPanelItem>
    </div>
  );
};

export default TopologyResourcesTabPanel;
