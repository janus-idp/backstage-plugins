import { V1Pod, V1Service } from '@kubernetes/client-node';
import { LongArrowAltRightIcon } from '@patternfly/react-icons';
import { BaseNode } from '@patternfly/react-topology';
import * as React from 'react';
import { IngressModel, PodModel, ServiceModel } from '../../../models';
import TopologyResourcesTabPanelItem from './TopologyResourcesTabPaneltem';

const TopologyResourcesTabPanel: React.FC<{ node: BaseNode }> = ({ node }) => {
  const nodeData = node.getData()?.data;
  return (
    <>
      <TopologyResourcesTabPanelItem resourceLabel={PodModel.labelPlural}>
        {nodeData?.podsData?.pods?.length &&
          nodeData.podsData.pods.map((pod: V1Pod) => (
            <li className="item">
              <span style={{ flex: '1' }}>{pod.metadata?.name}</span>
              <span style={{ flex: '1' }}>{pod.status?.phase}</span>
            </li>
          ))}
      </TopologyResourcesTabPanelItem>
      <TopologyResourcesTabPanelItem resourceLabel={ServiceModel.labelPlural}>
        {nodeData?.services?.length &&
          nodeData.services.map((service: V1Service) => (
            <li className="item" style={{ flexDirection: 'column' }}>
              <span>{service.metadata?.name}</span>
              <ul>
                {(service.spec?.ports ?? []).map(
                  ({ name, port, protocol, targetPort }: any) => (
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
      <TopologyResourcesTabPanelItem resourceLabel={IngressModel.labelPlural}>
        {nodeData?.ingressesData?.length &&
          nodeData.ingressesData.map((ingressData: any) => (
            <li className="item" style={{ flexDirection: 'column' }}>
              <span>{ingressData?.ingress?.metadata?.name}</span>
              {ingressData?.url && (
                <>
                  <span className="topology-text-muted">Location:</span>
                  <a
                    href={ingressData?.url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {ingressData?.url}
                  </a>
                </>
              )}
            </li>
          ))}
      </TopologyResourcesTabPanelItem>
    </>
  );
};

export default TopologyResourcesTabPanel;
