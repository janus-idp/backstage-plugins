import React from 'react';
import { Content, Header, Page } from '@backstage/core-components';
import { Router } from '../Router';

export const OcirPage = () => (
  <Page themeId="clusters">
    <Header title="Image Registry" />
    <Content>
      <Router />
    </Content>
  </Page>
);
