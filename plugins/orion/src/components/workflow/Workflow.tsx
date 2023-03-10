import React, { useState } from 'react';
import {
  ContentHeader,
  InfoCard,
  Progress,
  SupportButton,
} from '@backstage/core-components';
import { useEffect } from 'react';
import { errorApiRef, useApi } from '@backstage/core-plugin-api';
import { Form } from '../Form/Form';
import { ParodosPage } from '../ParodosPage';
import { Typography, Button, makeStyles, Grid } from '@material-ui/core';
import { useGetProjectAssessmentSchema } from './useGetProjectAssessmentSchema';
import type { AssessmentStatusType } from '../types';
import useAsyncFn from 'react-use/lib/useAsyncFn';
import { useBackendUrl } from '../api';
import { IChangeEvent } from '@rjsf/core-v5';
import { WorkflowDefinitions } from './WorkflowDefinitions';
import { useGetWorkflowDefinitions } from '../../hooks/useGetWorkflowDefinitions';
import * as urls from '../../urls';
import { workflowSchema } from '../../models/workflow';
import { assert } from 'assert-ts';
import { type Project, projectSchema } from '../../models/project';
import { ASSESSMENT_WORKFLOW } from './constants';

const useStyles = makeStyles({
  fullHeight: {
    height: '100%',
  },
});

export function Workflow(): JSX.Element {
  const [project, setProject] = useState<Project>();
  const backendUrl = useBackendUrl();
  const { value: workflowDefinitions = [] } = useGetWorkflowDefinitions();
  const [assessmentStatus, setAssessmentStatus] =
    useState<AssessmentStatusType>('none');
  const styles = useStyles();

  const { loading, error, value: formSchema } = useGetProjectAssessmentSchema();

  const [, startAssessment] = useAsyncFn(async ({ formData }: IChangeEvent) => {
    setAssessmentStatus('inprogress');

    const newProjectResponse = await fetch(`${backendUrl}${urls.Projects}`, {
      method: 'POST',
      body: JSON.stringify({
        name: formData.Name,
      }),
    });

    const newProjectResult = projectSchema.safeParse(
      await newProjectResponse.json(),
    );

    assert(newProjectResult.success);

    const newProject = newProjectResult.data;

    setProject(newProject);

    const workFlowResponse = await fetch(`${backendUrl}${urls.Workflows}`, {
      method: 'POST',
      body: JSON.stringify({
        projectId: newProject.id,
        workFlowName: ASSESSMENT_WORKFLOW,
        workFlowTasks: [],
      }),
    });

    const workflowResult = workflowSchema.safeParse(
      await workFlowResponse.json(),
    );

    assert(workflowResult.success);

    setAssessmentStatus('complete');

    const workflow = workflowResult.data;

    console.log(workflow);
  }, []);

  const errorApi = useApi(errorApiRef);

  useEffect(() => {
    if (error) {
      errorApi.post(new Error(`Getting definition failed, ${error}`));
    }
  }, [error, errorApi]);

  const inProgress = assessmentStatus === 'inprogress';
  const complete = assessmentStatus === 'complete';

  const disableForm = inProgress || complete;

  return (
    <ParodosPage stretch>
      <ContentHeader title="Project assessment">
        <SupportButton title="Need help?">Lorem Ipsum</SupportButton>
      </ContentHeader>
      <Typography paragraph>
        Select a project for an assessment of what additional workflows, if any,
        it qualifies for.
      </Typography>
      {loading && <Progress />}
      {formSchema?.schema && (
        <InfoCard className={styles.fullHeight}>
          <Grid container direction="row">
            <Grid item xs={12} xl={8}>
              <Form
                formSchema={formSchema}
                onSubmit={startAssessment}
                disabled={disableForm}
              >
                <Button
                  type="submit"
                  disabled={disableForm}
                  variant="contained"
                  color="primary"
                >
                  {inProgress ? 'IN PROGRESS' : 'START ASSESSMENT'}
                </Button>
              </Form>
            </Grid>
            <Grid item xs={12}>
              {assessmentStatus === 'complete' && project && (
                <WorkflowDefinitions
                  project={project}
                  workflowDefinitions={workflowDefinitions.filter(
                    workflowDefinition =>
                      // TODO: is following correct?
                      !['ASSESSMENT', 'CHECKER'].includes(
                        workflowDefinition.type,
                      ),
                  )}
                />
              )}
            </Grid>
          </Grid>
        </InfoCard>
      )}
    </ParodosPage>
  );
}
