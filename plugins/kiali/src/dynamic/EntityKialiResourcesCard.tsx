import * as React from 'react';

import {
  CardTab,
  CodeSnippet,
  EmptyState,
  TabbedCard,
} from '@backstage/core-components';
import { useEntity } from '@backstage/plugin-catalog-react';

import { Box } from '@material-ui/core';

import { AppListPage } from '../pages/AppList/AppListPage';
import { ServiceListPage } from '../pages/ServiceList/ServiceListPage';
import { WorkloadListPage } from '../pages/WorkloadList/WorkloadListPage';
import { DRAWER } from '../types/types';

const tabStyle: React.CSSProperties = {
  overflowY: 'scroll',
  maxHeight: '400px',
};

export const EntityKialiResourcesCard = () => {
  const { entity } = useEntity();
  return !entity ? (
    <EmptyState
      missing="data"
      title="No resources to show with these annotations"
      description={
        <>
          Kiali detected the annotations
          <div style={{ marginTop: '40px' }}>
            This is the entity loaded.
            <Box style={{ marginTop: '10px' }}>
              <CodeSnippet
                text={JSON.stringify(entity, null, 2)}
                language="yaml"
                showLineNumbers
                customStyle={{ background: 'inherit', fontSize: '115%' }}
              />
            </Box>
          </div>
        </>
      }
    />
  ) : (
    <TabbedCard title="Service Mesh Resources">
      <CardTab label="Workloads">
        <div style={tabStyle}>
          <WorkloadListPage view={DRAWER} entity={entity} />
        </div>
      </CardTab>
      <CardTab label="Services">
        <div style={tabStyle}>
          <ServiceListPage view={DRAWER} entity={entity} />
        </div>
      </CardTab>
      <CardTab label="Applications">
        <div style={tabStyle}>
          <AppListPage view={DRAWER} entity={entity} />
        </div>
      </CardTab>
    </TabbedCard>
  );
};
