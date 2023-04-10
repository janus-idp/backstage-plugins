import * as React from 'react';
import { V1Pod, V1Service, V1ServicePort } from '@kubernetes/client-node';
import { LongArrowAltRightIcon } from '@patternfly/react-icons';
import { BaseNode } from '@patternfly/react-topology';
import { IngressModel, PodModel, ServiceModel } from '../../../models';
import { IngressData } from '../../../types/ingresses';
import TopologyResourcesTabPanelItem from './TopologyResourcesTabPaneltem';

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
              <span style={{ flex: '1' }}>{pod.metadata?.name}</span>
              <span style={{ flex: '1' }}>{pod.status?.phase}</span>
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
              <span>{service.metadata?.name}</span>
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
              <span>{ingressData.ingress.metadata?.name}</span>
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
            </li>
          ))}
      </TopologyResourcesTabPanelItem>
    </div>
  );
};

export default TopologyResourcesTabPanel;
