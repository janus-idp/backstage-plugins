import React, { useState } from 'react';
import {
  ContentHeader,
  InfoCard,
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
import { IChangeEvent } from '@rjsf/core-v5';
import * as urls from '../../urls';
import {
  displayableWorkflowOptions,
  workflowSchema,
} from '../../models/workflow';
import { type Project, projectSchema } from '../../models/project';
import { ASSESSMENT_WORKFLOW } from './constants';
import {
  WorkflowOptionsList,
  type WorkflowOptionsListItem,
} from './WorkflowOptionsList';
import { assert } from 'assert-ts';
import { useStore } from '../../stores/workflowStore/workflowStore';

const useStyles = makeStyles(theme => ({
  fullHeight: {
    height: '100%',
  },
  form: {
    marginTop: theme.spacing(2),
  },
}));

interface ProjectsPayload {
  onboardingAssessmentTask: {
    Name: string;
  };
}

export function Workflow(): JSX.Element {
  const projectsUrl = useStore(state => state.getApiUrl(urls.Projects));
  const workflowsUrl = useStore(state => state.getApiUrl(urls.Workflows));
  const addProject = useStore(state => state.addProject);

  const [project, setProject] = useState<Project>();
  const [assessmentStatus, setAssessmentStatus] =
    useState<AssessmentStatusType>('none');
  const [workflowOptions, setWorkflowOptions] = useState<
    WorkflowOptionsListItem[]
  >([]);
  const styles = useStyles();

  const formSchema = useGetProjectAssessmentSchema();

  const [{ error: startAssessmentError }, startAssessment] = useAsyncFn(
    async ({ formData }: IChangeEvent<ProjectsPayload>) => {
      assert(!!formData, `no formData`);

      setAssessmentStatus('inprogress');

      const newProjectResponse = await fetch(projectsUrl, {
        method: 'POST',
        body: JSON.stringify({
          name: formData.onboardingAssessmentTask.Name,
        }),
      });

      if (!newProjectResponse.ok) {
        throw new Error(newProjectResponse.statusText);
      }

      const newProject = projectSchema.parse(await newProjectResponse.json());

      setProject(newProject);

      const workFlowResponse = await fetch(workflowsUrl, {
        method: 'POST',
        body: JSON.stringify({
          projectId: newProject.id,
          workFlowName: ASSESSMENT_WORKFLOW,
          works: [],
        }),
      });

      if (!workFlowResponse.ok) {
        throw new Error(workFlowResponse.statusText);
      }

      const workflow = workflowSchema.parse(await workFlowResponse.json());

      const options = displayableWorkflowOptions.flatMap(option => {
        const items = workflow.workFlowOptions[option];

        if (items.length === 0) {
          return items;
        }

        const optionType = option
          .replace(/([a-z])([A-Z])/g, '$1 $2')
          .split(' ')[0]
          .toUpperCase();

        return items.map(item => ({
          ...item,
          type: optionType,
        }));
      }) as WorkflowOptionsListItem[];

      setWorkflowOptions(options);

      addProject(newProject);

      setAssessmentStatus('complete');
    },
    [addProject, projectsUrl, workflowsUrl],
  );

  const errorApi = useApi(errorApiRef);

  useEffect(() => {
    if (startAssessmentError) {
      // eslint-disable-next-line no-console
      console.error(startAssessmentError);
      errorApi.post(new Error(`Creating assessment failed`));
    }
  }, [errorApi, startAssessmentError]);

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
      {formSchema && (
        <InfoCard className={styles.fullHeight}>
          <Grid container direction="row" className={styles.form}>
            <Grid item xs={12} xl={8}>
              <Form
                formSchema={formSchema}
                onSubmit={startAssessment}
                disabled={disableForm}
                hideTitle
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
                <WorkflowOptionsList
                  project={project}
                  workflowOptions={workflowOptions}
                />
              )}
            </Grid>
          </Grid>
        </InfoCard>
      )}
    </ParodosPage>
  );
}
