import React from 'react';

import ResourceName from '../../../../common/components/ResourceName';
import { IngressModel } from '../../../../models';
import { IngressData } from '../../../../types/ingresses';
import TopologyResourcesTabPanelItem from '../TopologyResourcesTabPaneltem';
import IngressRules from './IngressRules';

const IngressListSidebar = ({ ingressesData }: { ingressesData: IngressData[] }) => {
  return (
    <TopologyResourcesTabPanelItem resourceLabel={IngressModel.labelPlural} dataTest="ingress-list">
      {ingressesData?.length > 0 &&
        ingressesData.map((ingressData: IngressData) => (
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
                <a href={ingressData.url} target="_blank" rel="noopener noreferrer">
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
  );
};

export default IngressListSidebar;
