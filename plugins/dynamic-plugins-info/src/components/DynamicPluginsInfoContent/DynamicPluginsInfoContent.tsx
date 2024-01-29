import React from 'react';

import { ContentHeader, SupportButton } from '@backstage/core-components';

import { DynamicPluginsTable } from '../DynamicPluginsTable/DynamicPluginsTable';

export const DynamicPluginsInfoContent = () => (
  <>
    <ContentHeader title="">
      <SupportButton title="Support">Some placeholder text</SupportButton>
    </ContentHeader>
    <DynamicPluginsTable />
  </>
);
