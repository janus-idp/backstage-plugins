import React from 'react';
import { Header, Page } from '@backstage/core-components';
import { OcirImagesComponent } from '../OcirImagesComponent';

export const OcirPage = () => (
  <Page themeId="tool">
    <Header title="Image Registry" />
    <OcirImagesComponent />
  </Page>
);
