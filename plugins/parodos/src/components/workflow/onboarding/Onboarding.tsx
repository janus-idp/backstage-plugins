/* eslint-disable no-console */
import React, { useEffect } from 'react';
import {
  ContentHeader,
  InfoCard,
  Progress,
  SupportButton,
} from '@backstage/core-components';
import {
  Link,
  useNavigate,
  useParams,
  useSearchParams,
} from 'react-router-dom';
import { ParodosPage } from '../../ParodosPage';
import { Button, Chip, makeStyles, Typography } from '@material-ui/core';
import { useWorkflowDefinitionToJsonSchema } from '../../../hooks/useWorkflowDefinitionToJsonSchema/useWorkflowDefinitionToJsonSchema';
import { assert } from 'assert-ts';
import { Form } from '../../Form/Form';
import {
  useGetWorkflowDefinition,
  useGetWorkflowTasksForTopology,
} from '../../../hooks/useGetWorkflowDefinitions';
import useAsyncFn from 'react-use/lib/useAsyncFn';
import { useBackendUrl } from '../../api/useBackendUrl';
import { type IChangeEvent } from '@rjsf/core-v5';
import { WorkflowExecuteResponseType } from '../../types';
import { type RJSFValidationError } from '@rjsf/utils';
import * as urls from '../../../urls';
import lodashGet from 'lodash.get';
import { errorApiRef, useApi } from '@backstage/core-plugin-api';

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
  const { workflowName, projectId } = useParams();
  const styles = useStyles();
  const [searchParams] = useSearchParams();
  const errorApi = useApi(errorApiRef);

  const workflowOption = searchParams.get('option');

  assert(!!workflowName, `no workflowId in Onboarding`);

  const {
    loading,
    error,
    value: formSchema,
  } = useWorkflowDefinitionToJsonSchema(workflowName, 'byName');

  const { value: workflow } = useGetWorkflowDefinition(workflowName, 'byName');
  const { value: tasks } = useGetWorkflowTasksForTopology(workflowName);

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
        workFlowTasks: workflow.works.map(work => {
          return {
            name: work.name,
            arguments: work.parameters?.map(param => {
              const value = lodashGet(
                formData,
                `${work.name}.${param.key}`,
                null,
              );

              return {
                key: param.key,
                value: value,
              };
            }),
          };
        }),
      };

      const data = await fetch(`${backendUrl}${urls.Workflows}`, {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      if (!data.ok) {
        throw new Error(`${data.status} - ${data.statusText}`);
      }

      const response = (await data.json()) as WorkflowExecuteResponseType;
      const executionId = response.workFlowExecutionId;

      navigate(`/parodos/onboarding/${executionId}/workflow-detail`, {
        state: { isNew: isNew, initTasks: tasks },
      });
    },
    [workflow, projectId, backendUrl, navigate, isNew, tasks],
  );

  useEffect(() => {
    if (startWorkflowError) {
      console.error(startWorkflowError);

      errorApi.post(new Error('Start workflow failed'));
    }
  }, [errorApi, startWorkflowError]);

  return (
    <ParodosPage>
      {error && <Typography>{error}</Typography>}
      {!error && isNew && <Chip label="New application" color="secondary" />}

      {!error && (
        <ContentHeader title={`${workflowOption}`}>
          <SupportButton title="Need help?">Lorem Ipsum</SupportButton>
        </ContentHeader>
      )}
      <Typography paragraph>You are onboarding {workflowOption}.</Typography>
      {loading || (startWorkflowLoading && <Progress />)}
      {formSchema && formSchema.steps.length > 0 && (
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
            <Button
              variant="text"
              component={Link}
              color="primary"
              to="/parodos/project-overview"
              className={styles.cancel}
            >
              Cancel and exit onboarding
            </Button>
          </Form>
        </InfoCard>
      )}
    </ParodosPage>
  );
}
