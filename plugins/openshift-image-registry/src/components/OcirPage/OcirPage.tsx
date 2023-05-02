import React from 'react';
import { Content, Header, Page } from '@backstage/core-components';
import { OcirImagesComponent } from '../OcirImagesComponent';

export const OcirPage = () => (
  <Page themeId="tool">
    <Header title="Image Registry" />
    <Content>
      <OcirImagesComponent />
    </Content>
  </Page>
);
