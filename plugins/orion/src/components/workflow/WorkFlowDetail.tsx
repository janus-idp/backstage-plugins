import { ParodosPage } from '../ParodosPage';
import { ContentHeader, SupportButton } from '@backstage/core-components';
import { Chip, Typography } from '@material-ui/core';
import { WorkFlowLogViewer } from './WorkFlowLogViewer';
import React from 'react';
import { WorkFlowStepper } from './topology/WorkFlowStepper';
import { useParams } from 'react-router-dom';

export const WorkFlowDetail = ({ isNew }: { isNew: boolean }) => {
  const { executionId } = useParams();
  return (
    <ParodosPage>
      {isNew && <Chip label="New application" color="secondary" />}
      <ContentHeader title="Onboarding">
        <SupportButton title="Need help?">Lorem Ipsum</SupportButton>
      </ContentHeader>
      <Typography paragraph>
        You are onboarding: org-name/new-project. Execution Id is {executionId}
      </Typography>
      <WorkFlowStepper />
      <WorkFlowLogViewer />
    </ParodosPage>
  );
};
