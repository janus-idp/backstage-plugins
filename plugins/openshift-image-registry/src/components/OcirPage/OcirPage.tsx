import React from 'react';
import { Content, Header, Page } from '@backstage/core-components';
import { OcirImagesView } from '../OcirImages/OcirImagesView';

export const OcirPage = () => (
  <Page themeId="home">
    <Header title="Image Registry" />
    <Content>
      <OcirImagesView />
    </Content>
  </Page>
);
