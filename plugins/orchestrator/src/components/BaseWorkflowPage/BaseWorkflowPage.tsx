import React, { PropsWithChildren } from 'react';

import { Content, Header, HeaderLabel, Page } from '@backstage/core-components';

import { workflow_title } from '@janus-idp/backstage-plugin-orchestrator-common';

export const BaseWorkflowPage = (props: PropsWithChildren<{}>) => {
  return (
    <Page themeId="tool">
      <Header
        title={workflow_title}
        subtitle={`Where all your ${workflow_title} needs come to life!`}
      >
        <HeaderLabel label="Owner" value="Team X" />
        <HeaderLabel label="Lifecycle" value="Alpha" />
      </Header>
      <Content>{props.children}</Content>
    </Page>
  );
};
