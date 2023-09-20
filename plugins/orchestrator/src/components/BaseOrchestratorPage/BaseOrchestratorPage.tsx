import React, { PropsWithChildren } from 'react';

import { Content, Header, HeaderLabel, Page } from '@backstage/core-components';

import { workflow_title } from '@janus-idp/backstage-plugin-orchestrator-common';

export const BaseOrchestratorPage = (props: PropsWithChildren<{}>) => {
  return (
    <Page themeId="tool">
      <Header
        title="Orchestrator"
        subtitle={`Where all your ${workflow_title} needs come to life!`}
      >
        <HeaderLabel label="Owner" value="Team X" />
        <HeaderLabel label="Lifecycle" value="Alpha" />
      </Header>
      <Content>{props.children}</Content>
    </Page>
  );
};
