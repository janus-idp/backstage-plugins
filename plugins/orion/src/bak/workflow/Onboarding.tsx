import React from 'react';
import { ContentHeader, SupportButton } from '@backstage/core-components';
import { Button, ButtonGroup, Chip, Grid, Typography } from '@material-ui/core';
import { useNavigate, useParams } from 'react-router-dom';
import { ParodosPage } from '../../components/ParodosPage';
import {
  WorkflowDefinitionType,
  WorkFlowTaskParameterType,
} from '../../components/types';
import { useBackendUrl } from '../../components/api';
import { WorkflowParameterComponent } from './WorkflowParameterComponent';
import {
  WorkflowParametersContext,
  WorkflowParametersContextProvider,
} from '../context/WorkflowParametersContext';
import { getWorkflowParameters, startWorkflow } from './commands';
import { mockAndromedaWorkflowDefinition } from '../../mocks/workflowDefinitions/andromeda';

type OnboardingProps = {
  isNew?: boolean;
};

export const OnboardingImpl: React.FC<OnboardingProps> = ({ isNew }) => {
  const { workflowId, projectId } = useParams();
  const backendUrl = useBackendUrl();
  const navigate = useNavigate();
  const { getParamValue, getParamValidation } = React.useContext(
    WorkflowParametersContext,
  );
  const [error, setError] = React.useState<string>();
  const [workflow, setWorkflow] = React.useState<WorkflowDefinitionType>();
  const [workflowParameters, setWorkflowParameters] = React.useState<
    WorkFlowTaskParameterType[]
  >([]); // parameters from whole chain of tasks - nextWorkflow

  // Get a list of workflow parameters to ask the user for
  React.useEffect(() => {
    if (!workflowId) {
      return;
    }

    const doItAsync = async () => {
      // Gather list of parameters to ask the user for
      try {
        const response = await fetch(
          `${backendUrl}/api/proxy/parodos/workflowdefinitions`,
        );
        let allWorkflowDefinitions =
          (await response.json()) as WorkflowDefinitionType[];

        // append mock - TODO: remove
        allWorkflowDefinitions = [
          mockAndromedaWorkflowDefinition,
          ...allWorkflowDefinitions,
        ];

        // find the requested workflow definition
        const workflowDefinition = allWorkflowDefinitions.find(def => {
          return def.id === workflowId;
        });
        if (!workflowDefinition) {
          setError('Could not find workflow definition.');
          return;
        }
        setWorkflow(workflowDefinition);

        const params = getWorkflowParameters(
          allWorkflowDefinitions,
          workflowDefinition,
        );

        setWorkflowParameters(params);
      } catch (e) {
        setError('Failed to fetch workflow definitions');
      }
    };
    doItAsync();
  }, [workflowId, backendUrl]);

  const onStart = async () => {
    if (!projectId) {
      setError('No project ID.');
      return;
    }
    if (!workflow) {
      setError('No workflow.');
      return; // should not happen
    }

    const executionId = await startWorkflow({
      workflow,
      projectId,
      getParamValue,
      backendUrl,
      setError,
    });

    if (!executionId) {
      // eslint-disable-next-line no-console
      console.info('Missing workflow execution ID.');
      // return; // Navigate anyway - for now
    }

    // navigate to workflow Detail page after start
    navigate(`/parodos/onboarding/${executionId}/workflow-detail`, {
      state: { isNew: isNew },
    });
  };

  const isStartDisabled = !!workflowParameters.find(param => {
    // Make sure all required fields are entered
    if (!param.optional && !getParamValue(param.key)) {
      return true;
    }

    return !!getParamValidation(param.key);
  });

  return (
    <ParodosPage>
      {error && <Typography>{error}</Typography>}
      {!error && isNew && <Chip label="New application" color="secondary" />}

      {!error && (
        <ContentHeader title={`${workflow?.name || '...'}`}>
          <SupportButton title="Need help?">Lorem Ipsum</SupportButton>
        </ContentHeader>
      )}
      <Typography paragraph>
        You are onboarding {workflow?.id || '...'}.
      </Typography>
      <Typography paragraph>
        Please provide additional information related to your project.
      </Typography>

      <Grid container spacing={3}>
        {workflowParameters.map(param => (
          <Grid item xs={2} key={param.key}>
            <WorkflowParameterComponent param={param} />
          </Grid>
        ))}
      </Grid>

      <ButtonGroup>
        <Button
          variant="contained"
          color="primary"
          onClick={onStart}
          disabled={isStartDisabled}
        >
          Start
        </Button>
        <Button variant="text" color="primary" href="/parodos/project-overview">
          Cancel onboarding
        </Button>
      </ButtonGroup>
    </ParodosPage>
  );
};

export const Onboarding: React.FC<OnboardingProps> = props => (
  <WorkflowParametersContextProvider>
    <OnboardingImpl {...props} />
  </WorkflowParametersContextProvider>
);
