import * as React from 'react';

import { CardTab, TabbedCard } from '@backstage/core-components';

import { baseStyle } from '../../../styles/StyleUtils';
import { ENTITY } from '../../../types/types';
import { AppListPage } from '../../AppList/AppListPage';
import { ServiceListPage } from '../../ServiceList/ServiceListPage';
import { WorkloadListPage } from '../../WorkloadList/WorkloadListPage';

export const ListViewPage = () => {
  return (
    <div className={baseStyle}>
      <div>
        <TabbedCard title="List">
          <CardTab label="Workloads">
            <WorkloadListPage view={ENTITY} />
          </CardTab>
          <CardTab label="Services">
            <ServiceListPage view={ENTITY} />
          </CardTab>
          <CardTab label="Applications">
            <AppListPage view={ENTITY} />
          </CardTab>
        </TabbedCard>
      </div>
    </div>
  );
};
