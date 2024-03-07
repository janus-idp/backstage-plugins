import React from 'react';

import { Content, Page } from '@backstage/core-components';

import { ListViewPage } from '../Overview/ListView/ListViewPage';
import { OverviewPage } from '../Overview/OverviewPage';

export const KialiEntity = () => {
  return (
    <Page themeId="tool">
      <Content>
        <OverviewPage entity />
        <ListViewPage />
      </Content>
    </Page>
  );
};
