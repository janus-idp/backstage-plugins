/* eslint-disable no-console */
import React from 'react';
import {
  ContentHeader,
  InfoCard,
  Progress,
  SupportButton,
} from '@backstage/core-components';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ParodosPage } from '../../ParodosPage';
import {
  Button,
  ButtonGroup,
  Chip,
  makeStyles,
  Typography,
} from '@material-ui/core';
import { useWorkflowDefinitionToJsonSchema } from '../../../hooks/useWorkflowDefinitionToJsonSchema';
import { assert } from 'assert-ts';
import { Form } from '../../Form/Form';
import { useGetWorkflowDefinition } from '../../../hooks/useGetWorkflowDefinitions';
import useAsyncFn from 'react-use/lib/useAsyncFn';
import { useBackendUrl } from '../../api/useBackendUrl';
import { type IChangeEvent } from '@rjsf/core-v5';
import { WorkflowExecuteResponseType } from '../../types';
import { type RJSFValidationError } from '@rjsf/utils';
import * as urls from '../../../urls';

interface OnboardingProps {
  isNew: boolean;
}

const useStyles = makeStyles(theme => ({
  start: {
    marginTop: theme.spacing(3),
    marginBottom: theme.spacing(2),
    width: '50%',
  },
  cancel: {
    textTransform: 'none',
    paddingLeft: 0,
  },
}));

export function Onboarding({ isNew }: OnboardingProps): JSX.Element {
  const backendUrl = useBackendUrl();
  const { workflowId, projectId } = useParams();
  const styles = useStyles();

  assert(!!workflowId, `no workflowId in Onboarding`);

  const {
    loading,
    error,
    value: formSchema,
  } = useWorkflowDefinitionToJsonSchema(workflowId, 'byId');

  const { value: workflow } = useGetWorkflowDefinition(workflowId, 'byId');

  const navigate = useNavigate();

  const [
    { error: startWorkflowError, loading: startWorkflowLoading },
    startWorkflow,
  ] = useAsyncFn(
    async ({ formData }: IChangeEvent) => {
      assert(!!workflow);
      assert(!!projectId);

      const payload = {
        projectId,
        workFlowName: workflow.name,
        workFlowTasks: workflow.tasks.map(task => {
          return {
            name: task.name,
            arguments: task.parameters.map(param => {
              const value = formData[param.key];

              return {
                key: param.key,
                value: value ?? null,
              };
            }),
          };
        }),
      };

      const data = await fetch(`${backendUrl}${urls.Workflows}`, {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      const response = (await data.json()) as WorkflowExecuteResponseType;
      const executionId = response.workFlowExecutionId;

      navigate(`/parodos/onboarding/${executionId}/workflow-detail`, {
        state: { isNew: isNew },
      });
    },
    [workflow, projectId],
  );

  if (startWorkflowError) {
    throw startWorkflowError;
  }

  return (
    <ParodosPage>
      {error && <Typography>{error}</Typography>}
      {!error && isNew && <Chip label="New application" color="secondary" />}

      {!error && (
        <ContentHeader title={`${workflow?.name}`}>
          <SupportButton title="Need help?">Lorem Ipsum</SupportButton>
        </ContentHeader>
      )}
      <Typography paragraph>You are onboarding {workflow?.name}.</Typography>
      {loading || (startWorkflowLoading && <Progress />)}
      {formSchema?.schema && (
        <InfoCard>
          <Typography paragraph>
            Please provide additional information related to your project.
          </Typography>
          <Form
            formSchema={formSchema}
            onSubmit={startWorkflow}
            disabled={startWorkflowLoading}
            transformErrors={(errors: RJSFValidationError[]) => {
              return errors.map(err =>
                err?.message?.includes('must match pattern')
                  ? { ...err, message: 'invalid url' }
                  : err,
              );
            }}
          >
            <ButtonGroup orientation="vertical">
              <Button
                type="submit"
                variant="contained"
                color="primary"
                className={styles.start}
              >
                Start
              </Button>
              <Button
                variant="text"
                component={Link}
                color="primary"
                to="/parodos/project-overview"
                className={styles.cancel}
              >
                Cancel and exit onboarding
              </Button>
            </ButtonGroup>
          </Form>
        </InfoCard>
      )}
    </ParodosPage>
  );
}
