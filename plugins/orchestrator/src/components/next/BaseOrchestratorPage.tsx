import React, { PropsWithChildren } from 'react';

import { Content, Header, Page } from '@backstage/core-components';

export interface BaseOrchestratorProps {
  title?: string;
  subtitle?: string;
}

export const BaseOrchestratorPage = ({
  title,
  subtitle,
  children,
}: PropsWithChildren<BaseOrchestratorProps>) => {
  return (
    <Page themeId="tool">
      <Header title={title} subtitle={subtitle} />
      <Content noPadding>{children}</Content>
    </Page>
  );
};
