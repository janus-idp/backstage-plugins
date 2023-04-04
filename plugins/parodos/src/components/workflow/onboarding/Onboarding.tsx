/* eslint-disable no-console */
import React, { useEffect } from 'react';
import {
  ContentHeader,
  InfoCard,
  Progress,
  SupportButton,
} from '@backstage/core-components';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { ParodosPage } from '../../ParodosPage';
import { Button, Chip, makeStyles, Typography } from '@material-ui/core';
import { useWorkflowDefinitionToJsonSchema } from '../../../hooks/useWorkflowDefinitionToJsonSchema/useWorkflowDefinitionToJsonSchema';
import { assert } from 'assert-ts';
import { Form } from '../../Form/Form';
import { useGetWorkflowTasksForTopology } from '../../../hooks/useGetWorkflowDefinitions';
import { type RJSFValidationError } from '@rjsf/utils';
import * as urls from '../../../urls';
import { errorApiRef, useApi } from '@backstage/core-plugin-api';
import { useStore } from '../../../stores/workflowStore/workflowStore';
import { useStartWorkflow } from '../hooks/useStartWorkflow';

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
  const { workflowName, projectId } = useParams();
  const workflowsUrl = useStore(state => state.getApiUrl(urls.Workflows));

  assert(!!workflowName, `no workflowId in Onboarding`);

  const workflow = useStore(state =>
    state.getWorkDefinitionBy('byName', workflowName),
  );

  const styles = useStyles();
  const [searchParams] = useSearchParams();
  const errorApi = useApi(errorApiRef);

  const workflowOption = searchParams.get('option');

  const formSchema = useWorkflowDefinitionToJsonSchema(workflowName, 'byName');

  const tasks = useGetWorkflowTasksForTopology(workflowName);

  assert(!!workflow);
  assert(!!projectId);

  const [{ error, loading }, startWorkflow] = useStartWorkflow({
    workflowsUrl,
    workflow,
    projectId,
    tasks,
    isNew,
  });

  useEffect(() => {
    if (error) {
      console.error(error);

      errorApi.post(new Error('Start workflow failed'));
    }
  }, [errorApi, error]);

  return (
    <ParodosPage>
      {isNew && <Chip label="New application" color="secondary" />}

      <ContentHeader title={`${workflowOption}`}>
        <SupportButton title="Need help?">Lorem Ipsum</SupportButton>
      </ContentHeader>
      <Typography paragraph>You are onboarding {workflowOption}.</Typography>
      {loading && <Progress />}
      {formSchema.steps.length > 0 && (
        <InfoCard>
          <Typography paragraph>
            Please provide additional information related to your project.
          </Typography>
          <Form
            formSchema={formSchema}
            onSubmit={startWorkflow}
            disabled={loading}
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
