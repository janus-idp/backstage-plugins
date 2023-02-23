import React from 'react';
import '@patternfly/react-core/dist/styles/base.css';
import { PipelineLayout } from './PipelineLayout';

import './TopologyComponent.css';
import { ParodosPage } from '../../ParodosPage';
import { ContentHeader, SupportButton } from '@backstage/core-components';
import { Typography } from '@material-ui/core';

const TopologyContentBody = () => {
  return (
    <div className="pf-ri__topology-demo">
      <PipelineLayout />
    </div>
  );
};

export const WorkFlowStepper = () => {
  return (
    <ParodosPage>
      <ContentHeader title="Onboarding">
        <SupportButton title="Need help?">Lorem Ipsum</SupportButton>
      </ContentHeader>
      <Typography paragraph>
        You are onboarding: org-name/new-project
      </Typography>
      <TopologyContentBody />
    </ParodosPage>
  );
};
