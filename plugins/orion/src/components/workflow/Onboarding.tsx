import React from 'react';
import { ContentHeader, SupportButton } from '@backstage/core-components';
import { Button, ButtonGroup, Chip, Grid, Typography } from '@material-ui/core';
import { useNavigate, useParams } from 'react-router-dom';
import { ParodosPage } from '../ParodosPage';
import {
  WorkflowDefinitionType,
  WorkflowExecuteResponseType,
  WorkflowTaskArgumentType,
  WorkFlowTaskParameterType,
  WorkflowType,
} from '../types';
import { useBackendUrl } from '../api';
import { WorkflowParameterComponent } from './WorkflowParameterComponent';
import {
  WorkflowParametersContext,
  WorkflowParametersContextProvider,
} from '../../context/WorkflowParametersContext';
import { mockAndromedaWorkflowDefinition } from './mockData';

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

type OnboardingProps = {
  isNew?: boolean;
};

export const OnboardingImpl: React.FC<OnboardingProps> = ({ isNew }) => {
  const { workflowId, projectId } = useParams();
  const backendUrl = useBackendUrl();
  const navigate = useNavigate();
  const { getParamValue } = React.useContext(WorkflowParametersContext);
  const [error, setError] = React.useState<string>();
  const [workflow, setWorkflow] = React.useState<WorkflowDefinitionType>();
  const [workflowParameters, setWorkflowParameters] = React.useState<
    WorkFlowTaskParameterType[]
  >([]); // parameters from whole chain of tasks - nextWorkflow

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

        // append mock
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
    const body: WorkflowType = {
      projectId: projectId || 'missing',
      workFlowName: workflow?.name || 'missing',
      workFlowTasks:
        workflow?.tasks.map(task => {
          const args: WorkflowTaskArgumentType[] = [];
          task.parameters?.forEach(param => {
            const value = getParamValue(param.key);
            if (value) {
              args.push({ key: param.key, value });
            }
          });

          return {
            name: task.name,
            arguments: args,
          };
        }) || [],
    };

    try {
      const data = await fetch(`${backendUrl}/api/proxy/parodos/workflows`, {
        method: 'POST',
        body: JSON.stringify(body),
      });
      const response = (await data.json()) as WorkflowExecuteResponseType;
      const executionId = response.workFlowExecutionId;

      // navigate to workflow Detail page after start
      navigate(`/parodos/onboarding/${executionId}/workflow-detail`, {
        state: { isNew: isNew },
      });
    } catch (e) {
      setError('Failed to start workflow');
      // eslint-disable-next-line no-console
      console.error('Failed to start workflow: ', e);
    }
  };

  const isStartDisabled = !workflowParameters.every(param => {
    // Simple check for Required fields
    return param.optional || !!getParamValue(param.key);
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
