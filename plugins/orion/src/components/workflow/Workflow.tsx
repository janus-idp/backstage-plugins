import React from 'react';
import {
  ContentHeader,
  ItemCardHeader,
  SupportButton,
} from '@backstage/core-components';
import {
  Button,
  Card,
  CardActions,
  CardContent,
  CardMedia,
  Grid,
  makeStyles,
  OutlinedInputProps,
  TextField,
  Typography,
} from '@material-ui/core';

import { useCommonStyles } from '../../styles';
import { ParodosPage } from '../ParodosPage';
import { useBackendUrl } from '../api';
import {
  AssessmentStatusType,
  ProjectType,
  WorkflowDefinitionType,
} from '../types';
import { mockAndromedaWorkflowDefinition } from './mockData';

const useStyles = makeStyles({
  applicationHeader: {
    background: 'gray',
  },
  applicationCard: {
    height: '15rem',
    width: '17rem',
  },
});

export const Workflow = () => {
  const commonStyles = useCommonStyles();
  const styles = useStyles();
  const backendUrl = useBackendUrl();

  const [projectName, setProjectName] = React.useState<string>('');
  const [project, setProject] = React.useState<ProjectType>();
  const [projectRepoOrImage, setProjectRepoOrImage] = React.useState<string>();
  const [assessmentStatus, setAssessmentStatus] =
    React.useState<AssessmentStatusType>('none');
  const [workflowDefinitions, setWorkflowDefinitions] = React.useState<
    WorkflowDefinitionType[]
  >([]);
  const [_, setError] = React.useState<string>();
  // TODO: render error

  const onChangeProjectName: OutlinedInputProps['onChange'] = event => {
    setProjectName(event.target.value);
  };

  const onChangeProjectRepoOrImage: OutlinedInputProps['onChange'] = event => {
    setProjectRepoOrImage(event.target.value);
  };

  const onStartAssessment = () => {
    setAssessmentStatus('inprogress');

    const doItAsync = async () => {
      try {
        const response = await fetch(
          `${backendUrl}/api/proxy/parodos/projects`,
          {
            method: 'POST',
            body: JSON.stringify({
              name: projectName,
              repo: projectRepoOrImage, // Not used yet
            }),
          },
        );
        const prj = (await response.json()) as ProjectType;
        setProject(prj);

        setAssessmentStatus('complete');

        // eslint-disable-next-line no-console
        console.log('TODO: implement fully start assessment');
        // TODO: blocked by https://issues.redhat.com/browse/FLPATH-99
        // TODO: https://issues.redhat.com/browse/FLPATH-100
        // TODO: https://issues.redhat.com/browse/FLPATH-101
      } catch (e) {
        setError('Failed to start assessment.');
        // eslint-disable-next-line no-console
        console.error('Error: ', e);
      }
    };
    doItAsync();
  };

  React.useEffect(() => {
    const doItAsync = async () => {
      try {
        const response = await fetch(
          `${backendUrl}/api/proxy/parodos/workflowdefinitions`,
        );
        const allWorkflowDefinitions =
          (await response.json()) as WorkflowDefinitionType[];

        let filteredWorkflowDefinitions = allWorkflowDefinitions.filter(
          workflowDefinition => workflowDefinition.type === 'ASSESSMENT',
        );

        // mock
        filteredWorkflowDefinitions = [
          mockAndromedaWorkflowDefinition,
          ...filteredWorkflowDefinitions,
        ];

        setWorkflowDefinitions(filteredWorkflowDefinitions);
      } catch (e) {
        setError('Failed to get workflow definitions.');
        // eslint-disable-next-line no-console
        console.error('Error: ', e);
      }
    };
    doItAsync();
  }, [backendUrl]);

  return (
    <ParodosPage>
      <ContentHeader title="Project assessment">
        <SupportButton title="Need help?">Lorem Ipsum</SupportButton>
      </ContentHeader>
      <Typography paragraph>
        Select a project for an assessment of what additional workflows, if any,
        it qualifies for.
      </Typography>

      <Grid container direction="column" spacing={2}>
        <Grid container direction="row" spacing={2}>
          <Grid item>
            <TextField
              id="project-name"
              disabled={assessmentStatus !== 'none'}
              label="Project name"
              variant="outlined"
              value={projectName}
              onChange={onChangeProjectName}
            />
          </Grid>

          <Grid item xs={5}>
            <TextField
              id="project-repo-or-image"
              disabled={assessmentStatus !== 'none'}
              label="Git Repo URL or Container Image"
              variant="outlined"
              value={projectRepoOrImage}
              onChange={onChangeProjectRepoOrImage}
              fullWidth
            />
          </Grid>

          <Grid item className={commonStyles.paddingtop1}>
            {assessmentStatus === 'inprogress' ? (
              <Button
                id="assessment-inprogress"
                disabled
                variant="contained"
                color="primary"
              >
                IN PROGRESS
              </Button>
            ) : (
              <Button
                id="assessment-start"
                variant="contained"
                onClick={onStartAssessment}
                color="primary"
                disabled={assessmentStatus === 'complete'}
              >
                START ASSESSMENT
              </Button>
            )}
          </Grid>

          <Grid item>{/* Space saver */}</Grid>
        </Grid>

        {assessmentStatus === 'complete' && (
          <>
            <Typography paragraph className={commonStyles.margintop1}>
              Assessment completed. To continue please select from the following
              option(s):
            </Typography>
            <Grid container direction="row" spacing={2}>
              {workflowDefinitions.map(workflow => (
                <Grid item>
                  <Card
                    key={workflow.name}
                    raised
                    className={styles.applicationCard}
                  >
                    <CardMedia>
                      <ItemCardHeader
                        title={workflow.name}
                        classes={{ root: styles.applicationHeader }}
                      />
                    </CardMedia>
                    <CardContent>{workflow.description}</CardContent>
                    <CardActions>
                      <Button
                        id={workflow.id}
                        variant="text"
                        color="primary"
                        href={`/parodos/onboarding/${project?.id}/${workflow.id}/new/`}
                      >
                        START
                      </Button>
                    </CardActions>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </>
        )}
      </Grid>
    </ParodosPage>
  );
};
