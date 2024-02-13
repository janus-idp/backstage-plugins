import React from 'react';

import { ContentHeader, SupportButton } from '@backstage/core-components';

import { DynamicPluginsTable } from '../DynamicPluginsTable/DynamicPluginsTable';

export const DynamicPluginsInfoContent = () => (
  <>
    <ContentHeader title="">
      <SupportButton>
        The administration area in Developer Hub enables administrators to
        manage content, users, settings, and security measures, which ensures
        seamless operation of the platform.
      </SupportButton>
    </ContentHeader>
    <DynamicPluginsTable />
  </>
);
