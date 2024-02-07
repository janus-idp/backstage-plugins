import React from 'react';

import { Content, Page } from '@backstage/core-components';

import { OverviewPage } from '../Overview/OverviewPage';

export const KialiEntity = () => {
  return (
    <Page themeId="tool">
      <Content>
        <OverviewPage entity />
      </Content>
    </Page>
  );
};
