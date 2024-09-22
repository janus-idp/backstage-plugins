import React from 'react';

import { Link } from '@backstage/core-components';
import { RouteFunc, useApi, useRouteRef } from '@backstage/core-plugin-api';
import { AboutField } from '@backstage/plugin-catalog';

import {
  CircularProgress,
  Grid,
  List,
  ListItem,
  makeStyles,
  Typography,
} from '@material-ui/core';
import DotIcon from '@material-ui/icons/FiberManualRecord';
// TODO: use material-ui Stack once the library gets updated
import { Stack, StackItem } from '@patternfly/react-core';

import {
  AssessedProcessInstanceDTO,
  ProcessInstanceErrorDTO,
  ProcessInstanceStatusDTO,
  QUERY_PARAM_ASSESSMENT_INSTANCE_ID,
  WorkflowOverviewDTO,
  WorkflowResultDTO,
} from '@janus-idp/backstage-plugin-orchestrator-common';

import { orchestratorApiRef } from '../api';
import { VALUE_UNAVAILABLE } from '../constants';
import { executeWorkflowRouteRef } from '../routes';
import { buildUrl } from '../utils/UrlUtils';
import { WorkflowDescriptionModal } from './WorkflowDescriptionModal';

const useStyles = makeStyles(theme => ({
  outputGrid: {
    '& h2': {
      textTransform: 'none',
      fontSize: 'small',
    },
  },
  errorIcon: {
    color: theme.palette.error.main,
  },
}));

const ResultMessage = ({
  status,
  error,
  resultMessage,
  completedWith,
}: {
  status?: ProcessInstanceStatusDTO;
  error?: ProcessInstanceErrorDTO;
  resultMessage?: WorkflowResultDTO['message'];
  completedWith: WorkflowResultDTO['completedWith'];
}) => {
  const styles = useStyles();

  const errorMessage = error?.message || error?.toString();
  let noResult = <></>;
  if (!resultMessage && !errorMessage) {
    if (['Error', 'Completed', 'Aborted', 'Suspended'].includes(status || '')) {
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
      {resultMessage && (
        <StackItem>
          {completedWith === 'error' && (
            <DotIcon
              style={{ fontSize: '0.75rem' }}
              className={styles.errorIcon}
            />
          )}
          &nbsp;
          {resultMessage}
        </StackItem>
      )}
      {errorMessage && (
        <StackItem>
          <b>{errorMessage}</b>
        </StackItem>
      )}
      {noResult}
    </>
  );
};

const NextWorkflows = ({
  instanceId,
  nextWorkflows,
}: {
  instanceId: string;
  nextWorkflows: WorkflowResultDTO['nextWorkflows'];
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
  outputs: WorkflowResultDTO['outputs'];
}) => {
  const styles = useStyles();

  if (!outputs?.length) {
    return null;
  }

  return (
    <StackItem>
      <Typography variant="h6" component="div">
        Output
      </Typography>
      <Grid container alignContent="flex-start">
        {outputs?.map(item => {
          // Keep the order set by backend, it might matter
          let value;
          const itemValue = (item.value || VALUE_UNAVAILABLE) as string;
          if (item.format === 'link') {
            value = <Link to={itemValue}>{item.key}</Link>;
          } else {
            value = <AboutField label={item.key} value={itemValue} />;
          }

          return (
            <Grid item md={4} key={item.key} className={styles.outputGrid}>
              {value}
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
  const instance = assessedInstance.instance;
  const result = instance.workflowdata?.result;

  return (
    <Stack hasGutter>
      <ResultMessage
        status={instance.status}
        error={instance.error}
        resultMessage={result?.message}
        completedWith={result?.completedWith}
      />
      <NextWorkflows
        instanceId={instance.id}
        nextWorkflows={result?.nextWorkflows}
      />
      <WorkflowOutputs outputs={result?.outputs} />
    </Stack>
  );
};

WorkflowResult.displayName = 'WorkflowResult';
