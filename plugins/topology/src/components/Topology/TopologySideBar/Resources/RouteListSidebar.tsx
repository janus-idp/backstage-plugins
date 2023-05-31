import React from 'react';
import TopologyResourcesTabPanelItem from '../TopologyResourcesTabPaneltem';
import { RouteData } from '../../../../types/route';
import { RouteModel } from '../../../../models';
import ResourceName from '../../../../common/components/ResourceName';

const RouteListSidebar = ({ routesData }: { routesData: RouteData[] }) => {
  return (
    <TopologyResourcesTabPanelItem
      resourceLabel={RouteModel.labelPlural}
      dataTest="routes-list"
    >
      {routesData?.length > 0 &&
        routesData.map((routeData: RouteData) => (
          <li
            className="item"
            style={{ flexDirection: 'column' }}
            key={routeData.route.metadata?.uid}
          >
            <span>
              <ResourceName
                name={routeData.route.metadata?.name ?? ''}
                kind={routeData.route.kind ?? ''}
              />
            </span>
            {routeData.url && (
              <>
                <span className="topology-text-muted">Location:</span>
                <a
                  href={routeData.url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {routeData.url}
                </a>
              </>
            )}
          </li>
        ))}
    </TopologyResourcesTabPanelItem>
  );
};

export default RouteListSidebar;
