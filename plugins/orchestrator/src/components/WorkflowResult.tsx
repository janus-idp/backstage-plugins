import React from 'react';

import { Link } from '@backstage/core-components';
import { RouteFunc, useApi, useRouteRef } from '@backstage/core-plugin-api';
import { AboutField } from '@backstage/plugin-catalog';

import {
  Chip,
  CircularProgress,
  Grid,
  List,
  ListItem,
  makeStyles,
  Typography,
} from '@material-ui/core';
// TODO: use material-ui Stack once the library gets updated
import { Stack, StackItem } from '@patternfly/react-core';

import {
  AssessedProcessInstanceDTO,
  capitalize,
  parseWorkflowVariables,
  ProcessInstanceStatusDTO,
  QUERY_PARAM_ASSESSMENT_INSTANCE_ID,
  WorkflowOverviewDTO,
} from '@janus-idp/backstage-plugin-orchestrator-common';

import { orchestratorApiRef } from '../api';
import { VALUE_UNAVAILABLE } from '../constants';
import { executeWorkflowRouteRef } from '../routes';
import { buildUrl } from '../utils/UrlUtils';
import { WorkflowDescriptionModal } from './WorkflowDescriptionModal';
import { mapProcessInstanceToDetails } from './WorkflowInstancePageContent';
import { WorkflowRunDetail, WorkflowSuggestion } from './WorkflowRunDetail';
import { WorkflowVariablesViewer } from './WorkflowVariablesViewer';

type NextWorkflowType = {
  title: string;
  link: string;
  id: string;
  isRecommended: boolean;
};

const useStyles = makeStyles(_ => ({
  recommendedLabelContainer: {
    display: 'flex',
    alignItems: 'center',
    whiteSpace: 'nowrap',
  },
  recommendedLabel: { margin: '0 0.25rem' },
}));

const getNextWorkflows = (
  details: WorkflowRunDetail,
  executeWorkflowLink: RouteFunc<{ workflowId: string }>,
): NextWorkflowType[] => {
  const nextWorkflows: {
    title: string;
    link: string;
    id: string;
    isRecommended: boolean;
  }[] = [];

  if (details.nextWorkflowSuggestions) {
    Object.entries(details.nextWorkflowSuggestions).forEach(([_, value]) => {
      const nextWorkflowSuggestions: WorkflowSuggestion[] = Array.isArray(value)
        ? value
        : [value];
      nextWorkflowSuggestions.forEach(nextWorkflowSuggestion => {
        // Produce flat structure
        const routeUrl = executeWorkflowLink({
          workflowId: nextWorkflowSuggestion.id,
        });
        const urlToNavigate = buildUrl(routeUrl, {
          [QUERY_PARAM_ASSESSMENT_INSTANCE_ID]: details.id,
        });
        nextWorkflows.push({
          title: nextWorkflowSuggestion.name,
          link: urlToNavigate,
          id: nextWorkflowSuggestion.id,
          isRecommended:
            (
              details.nextWorkflowSuggestions
                ?.currentVersion as WorkflowSuggestion
            )?.id === nextWorkflowSuggestion.id,
        });
      });
    });
  }

  return nextWorkflows;
};

/* DO NOT MERGE
  These mocks will be removed once the new WorkflowResult schema lends and the API gets updated.
  https://github.com/parodos-dev/serverless-workflows/pull/403
*/
const mockErrorInstance = {
  id: 'my-workflow-instance-id',
  state: 'Error',
  error: 'This is an error message by workflow.',
  results: {
    // Of WorkflowResults type
    message: 'A human-friendly description of an error.',
    outputs: [
      {
        key: 'A resource name',
        value: 'foo',
        // default format
      },
      {
        key: 'Another variable',
        value: 'https://foo.bar',
        format: 'link',
      },
      {
        key: 'A numeric value',
        value: 123,
      },
    ],
  },
};

const mockSuccessInstance = {
  id: 'my-workflow-instance-id',
  state: 'Completed',
  error: null,
  results: {
    // Of WorkflowResults type
    message: 'A human-friendly description of recent state.',
    nextWorkflows: [
      {
        id: '123-123-123',
        name: 'Next suggested workflow',
      },
      {
        id: '456-456-456',
        name: 'Another option for next workflow',
      },
    ],
    outputs: [
      {
        key: 'A resource name',
        value: 'foo',
        // default format
      },
      {
        key: 'A link',
        value: 'https://foo.bar',
        format: 'link',
      },
      {
        key: 'A numeric value',
        value: 123,
      },
    ],
  },
};

const ResultMessage = ({
  status,
  error,
  resultMessage,
}: {
  status: ProcessInstanceStatusDTO;
  error?: string | null;
  resultMessage?: string;
}) => {
  let noResult = <></>;
  if (!resultMessage && !error) {
    if (['Error', 'Completed', 'Aborted', 'Suspended'].includes(status)) {
      noResult = (
        <StackItem>
          <i>The workflow provided no additional info about the status.</i>
        </StackItem>
      );
    } else {
      noResult = (
        <StackItem>
          <CircularProgress size="0.75rem" />
          &nbsp;The workflow has not yet provided additional info about the
          status.
        </StackItem>
      );
    }
  }

  return (
    <>
      {error && (
        <StackItem>
          <b>{error}</b>
        </StackItem>
      )}
      {resultMessage && <StackItem>{resultMessage}</StackItem>}
      {noResult}
    </>
  );
};

const NextWorkflows = ({
  instanceId,
  nextWorkflows,
}: {
  instanceId: string;
  nextWorkflows: {
    // TODO: use the generated type instead (not yet available)
    id: string;
    name: string;
  }[];
}) => {
  const orchestratorApi = useApi(orchestratorApiRef);
  const executeWorkflowLink: RouteFunc<{ workflowId: string }> = useRouteRef(
    executeWorkflowRouteRef,
  );

  const [
    currentOpenedWorkflowDescriptionModalID,
    setCurrentOpenedWorkflowDescriptionModalID,
  ] = React.useState('');

  const [currentWorkflow, setCurrentWorkflow] = React.useState(
    {} as WorkflowOverviewDTO,
  );

  const runWorkflowLink = React.useMemo(
    () =>
      buildUrl(
        executeWorkflowLink({
          workflowId: currentOpenedWorkflowDescriptionModalID,
        }),
        {
          [QUERY_PARAM_ASSESSMENT_INSTANCE_ID]: instanceId,
        },
      ),
    [currentOpenedWorkflowDescriptionModalID, executeWorkflowLink, instanceId],
  );

  const openWorkflowDescriptionModal = React.useCallback(
    (itemId: string) => {
      if (itemId) {
        orchestratorApi
          .getWorkflowOverview(itemId)
          .then(
            workflow => {
              setCurrentWorkflow(workflow.data);
            },
            error => {
              throw new Error(error);
            },
          )
          .catch(error => {
            throw new Error(error);
          });
        setCurrentOpenedWorkflowDescriptionModalID(itemId);
      }
    },
    [orchestratorApi],
  );

  const closeWorkflowDescriptionModal = React.useCallback(() => {
    setCurrentOpenedWorkflowDescriptionModalID('');
    setCurrentWorkflow({} as WorkflowOverviewDTO);
  }, []);

  if (!nextWorkflows?.length) {
    return null;
  }

  const sectionLabel =
    nextWorkflows.length === 1
      ? 'Suggested next workflow'
      : 'Suggested next workflows';

  return (
    <StackItem>
      <Typography variant="h6" component="div">
        {sectionLabel}
      </Typography>
      <List dense>
        {nextWorkflows.map(item => (
          <ListItem key={item.id}>
            <Link
              color="primary"
              to="#"
              onClick={() => {
                openWorkflowDescriptionModal(item.id);
              }}
            >
              {item.name}
            </Link>
          </ListItem>
        ))}
      </List>
      <WorkflowDescriptionModal
        workflow={currentWorkflow}
        runWorkflowLink={runWorkflowLink}
        open={!!currentOpenedWorkflowDescriptionModalID}
        onClose={closeWorkflowDescriptionModal}
      />
    </StackItem>
  );
};

const WorkflowOutputs = ({
  outputs,
}: {
  // TODO: use the generated type instead (not yet available)
  outputs?: {
    key: string;
    value: string | number;
    format?: string;
  }[];
}) => {
  if (!outputs?.length) {
    return null;
  }

  return (
    <StackItem>
      <Typography variant="h6" component="div">
        Output
      </Typography>
      {!outputs?.length && (
        <Typography variant="body1" component="div">
          The workflow produced no additional data.
        </Typography>
      )}
      <Grid container alignContent="flex-start">
        {outputs?.map(item => {
          let value;
          if (item.value) {
            if (
              !item.format ||
              item.format === 'string' ||
              item.format === 'number'
            ) {
              value = <b>{item.value}</b>;
            } else if (item.format === 'link') {
              value = <Link to={item.value as string}>{item.value}</Link>;
            }
          } else {
            value = VALUE_UNAVAILABLE;
          }

          return (
            <Grid item md={4} key={item.key}>
              <AboutField label={item.key}>
                <Typography variant="subtitle2" component="div">
                  {value}
                </Typography>
              </AboutField>
            </Grid>
          );
        })}
      </Grid>
    </StackItem>
  );
};

export const WorkflowResult: React.FC<{
  assessedInstance: AssessedProcessInstanceDTO;
}> = ({ assessedInstance }) => {
  // TODO: use the assessedInstance property instead
  console.info('--- do not merge, mocking data for development');
  // const instance = mockErrorInstance;
  const instance = mockSuccessInstance;

  return (
    <Stack hasGutter>
      <ResultMessage
        status={instance.state}
        error={instance.error}
        resultMessage={instance.results?.message}
      />
      <NextWorkflows
        instanceId={instance.id}
        nextWorkflows={instance.results?.nextWorkflows}
      />
      <WorkflowOutputs outputs={instance.results?.outputs} />
    </Stack>
  );
};

WorkflowResult.displayName = 'WorkflowResult';
