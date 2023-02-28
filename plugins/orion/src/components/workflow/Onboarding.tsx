import React from 'react';
import { ContentHeader, SupportButton } from '@backstage/core-components';
import { Button, ButtonGroup, Chip, Grid, Typography } from '@material-ui/core';
import { useNavigate, useParams } from 'react-router-dom';
import { ParodosPage } from '../ParodosPage';
import {
  ApplicationType,
  WorkflowDefinitionType,
  WorkFlowTaskParameterType,
} from '../types';
import { mockApplications, mockWorkflowParams } from './mockData';
import { useBackendUrl } from '../api';
import { WorkflowParameterComponent } from './WorkflowParameterComponent';
import { WorkflowParametersContextProvider } from '../../context/WorkflowParametersContext';

// TODO: use WorkflowStepper component after http://161.156.17.167:8080/swagger-ui/index.html#/Workflow/execute

const getAllFlattenedParameters = (
  allWorkflowDefinitions: WorkflowDefinitionType[],
  workflowDefinition: WorkflowDefinitionType,
): WorkFlowTaskParameterType[] => {
  const tasks = workflowDefinition.tasks || [];
  const paramsOfAllTasks: WorkFlowTaskParameterType[][] = tasks.map(task => {
    const taskParameters = task.parameters || [];
    // TODO: more filtering or mapping?
    return taskParameters;
  });
  const allFlatParameters: WorkFlowTaskParameterType[] =
    paramsOfAllTasks.flat();

  // Deep-dive into sub-workflows
  // Assumption: there are no loops in the workflow definitions
  tasks.forEach(task => {
    if (!task.nextWorkFlow) {
      return;
    }

    const subworkflowDefinition = allWorkflowDefinitions.find(
      def => def.id === task.nextWorkFlow,
    );
    if (!subworkflowDefinition) {
      // eslint-disable-next-line no-console
      console.info('Can not find subworkflow definition for task: ', task);
      return;
    }
    allFlatParameters.push(
      ...getAllFlattenedParameters(
        allWorkflowDefinitions,
        subworkflowDefinition,
      ),
    );
  });

  return allFlatParameters;
};

// TODO: Gather workflow-level parameters as well. So far we collect task-level parameters only since the Workflow-level params are missing in the swagger.
const getWorkflowParameters = (
  allWorkflowDefinitions: WorkflowDefinitionType[],
  workflowDefinition: WorkflowDefinitionType,
): WorkFlowTaskParameterType[] => {
  const allFlatParameters = getAllFlattenedParameters(
    allWorkflowDefinitions,
    workflowDefinition,
  );

  // Filter unique by key
  // Assumptions:
  // - the "key" of a parameter is unique over all workflow definitions and tasks
  const filteredParameters: WorkFlowTaskParameterType[] = [];
  const map = new Map();
  for (const item of allFlatParameters) {
    if (!map.has(item.key)) {
      map.set(item.key, true);
      filteredParameters.push(item);
    }
  }

  return filteredParameters;
};

export const Onboarding: React.FC<{ isNew?: boolean }> = ({ isNew }) => {
  const { appId } = useParams();
  const backendUrl = useBackendUrl();
  const navigate = useNavigate();
  const [application, setApplication] = React.useState<ApplicationType>();
  const [error, setError] = React.useState<string>();
  const [isStartDisabled, setIsStartDisabled] = React.useState<boolean>(false);
  const [workflowParameters, setWorkflowParameters] = React.useState<
    WorkFlowTaskParameterType[]
  >([]);
  // TODO: provide inra for storing dynamic parameters

  // TODO: use real data
  const applications: ApplicationType[] = mockApplications;

  React.useEffect(() => {
    const app = applications.find(a => a.id === appId);
    if (!app) {
      setError('Could not find application');
    }
    setApplication(app);
  }, [appId, applications]);

  React.useEffect(() => {
    if (!application) {
      return;
    }

    const doItAsync = async () => {
      // Gather list of parameters to ask the user for
      try {
        const response = await fetch(
          `${backendUrl}/api/proxy/parodos/workflowdefinitions`,
        );
        const allWorkflowDefinitions =
          (await response.json()) as WorkflowDefinitionType[];

        // find the right workflow for the selected application type
        const workflowDefinition = allWorkflowDefinitions.find(def => {
          // TODO: so far mock only - we do not know how to match the App to a workflow definition
          return def.name === 'onboardingWorkFlow_INFRASTRUCTURE_WORKFLOW';
        });
        if (!workflowDefinition) {
          setError('Could not find workflow definition for the application.');
          return;
        }

        let params = getWorkflowParameters(
          allWorkflowDefinitions,
          workflowDefinition,
        );
        // eslint-disable-next-line no-console
        console.log(
          'So far using mocks, but once API provides data, we can use dynamically retrieved parameters to render: ',
          params,
        );

        // Since we do not have data so far, let's use mock instead for now
        params = mockWorkflowParams;

        setWorkflowParameters(params);
      } catch (e) {
        setError('Failed to fetch workflow definitions');
      }
    };
    doItAsync();
  }, [application, backendUrl]);

  const onStart = () => {
    setIsStartDisabled(true);

    // eslint-disable-next-line no-console
    console.log('TODO: implement onStart');
    // TODO: call HTTP POST to /workflow/execute
    const executionId = 'responded-execution-id';

    // navigate to workflow Detail page after start
    navigate(`/parodos/onboarding/${executionId}/workflow-detail`, {
      state: { isNew: isNew },
    });
  };

  return (
    <ParodosPage>
      {error && <Typography>{error}</Typography>}
      {!error && isNew && <Chip label="New application" color="secondary" />}

      {!error && (
        <ContentHeader title={`${application?.name || '...'}`}>
          <SupportButton title="Need help?">Lorem Ipsum</SupportButton>
        </ContentHeader>
      )}
      <Typography paragraph>
        You are onboarding {application?.id || '...'}.
      </Typography>
      <Typography paragraph>
        Please provide additional information related to your project.
      </Typography>

      <WorkflowParametersContextProvider>
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
          <Button
            variant="text"
            color="primary"
            href="/parodos/project-overview"
          >
            Cancel onboarding
          </Button>
        </ButtonGroup>
      </WorkflowParametersContextProvider>
    </ParodosPage>
  );
};
