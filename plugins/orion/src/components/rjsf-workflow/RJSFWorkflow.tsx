import React from 'react';
import {
  ContentHeader,
  InfoCard,
  Progress,
  SupportButton,
} from '@backstage/core-components';
import { useEffect } from 'react';
import { useGetWorkflowDefinition } from '../../hooks/useGetWorkflowDefinitions';
import { errorApiRef, useApi } from '@backstage/core-plugin-api';
import { Stepper } from './Stepper';
import { WorkflowParametersContextProvider } from '../../context/WorkflowParametersContext';
import { ParodosPage } from '../ParodosPage';
import { Typography } from '@material-ui/core';

function RJSFWorkflowView(): JSX.Element {
  const {
    loading,
    error,
    value: assessment,
  } = useGetWorkflowDefinition('ASSESSMENT');

  console.log({loading, error, assessment})

  const errorApi = useApi(errorApiRef);

  useEffect(() => {
    if (error) {
      errorApi.post(new Error(`Getting definition failed, ${error}`));
    }
  }, [error, errorApi]);

  return (
    <ParodosPage>
      <ContentHeader title="Project assessment">
        <SupportButton title="Need help?">Lorem Ipsum</SupportButton>
      </ContentHeader>
      <Typography paragraph>
        Select a project for an assessment of what additional workflows, if any,
        it qualifies for.
      </Typography>
      {loading && <Progress />}
      {assessment && (
        <InfoCard noPadding>
          <Stepper />
        </InfoCard>
      )}
    </ParodosPage>
  );
}

export function RJSFWorkflow(): JSX.Element {
  return (
    <WorkflowParametersContextProvider>
      <RJSFWorkflowView />
    </WorkflowParametersContextProvider>
  );
}
