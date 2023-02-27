import React from 'react';
import {
  ContentHeader,
  ItemCardHeader,
  SupportButton,
} from '@backstage/core-components';
import { useCommonStyles } from '../../styles';
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
import { configApiRef, useApi } from '@backstage/core-plugin-api';

import { ParodosPage } from '../ParodosPage';
import { mockApplications } from './mockData';

type ApplicationType = {
  id: string;
  name: string;
  subtitle: string;
  description: string;
};

type AssessmentStatusType = 'none' | 'inprogress' | 'complete';

const useStyles = makeStyles({
  applicationHeader: {
    background: 'gray',
  },
  applicationCard: {
    'max-height': '15rem',
    width: '17rem',
  },
});

export const Workflow = () => {
  const commonStyles = useCommonStyles();
  const styles = useStyles();

  const config = useApi(configApiRef);

  const [projectName, setProjectName] = React.useState<string>('');
  const [projectRepoOrImage, setProjectRepoOrImage] = React.useState<string>();
  const [assessmentStatus, setAssessmentStatus] =
    React.useState<AssessmentStatusType>('none');
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
        const backendUrl = config.getString('backend.baseUrl');

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
        await response.json(); // So far we don't need the response

        // TODO: and others, i.e. workflows: https://issues.redhat.com/browse/FLPATH-50?focusedCommentId=21768215&page=com.atlassian.jira.plugin.system.issuetabpanels%3Acomment-tabpanel#comment-21768215
        setTimeout(() => setAssessmentStatus('complete'), 3000);
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

  const applications: ApplicationType[] = mockApplications;

  const getOnApplicationStart = (app: ApplicationType) => () => {
    // eslint-disable-next-line no-console
    console.log('TODO: implement handler for applilcation: ', app);
  };

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
              {applications.map(application => (
                <Grid item>
                  <Card
                    key={application.name}
                    raised
                    className={styles.applicationCard}
                  >
                    <CardMedia>
                      <ItemCardHeader
                        title={application.name}
                        subtitle={application.subtitle}
                        classes={{ root: styles.applicationHeader }}
                      />
                    </CardMedia>
                    <CardContent>{application.description}</CardContent>
                    <CardActions>
                      <Button
                        id={application.id}
                        variant="text"
                        onClick={getOnApplicationStart(application)}
                        color="primary"
                        // TODO: following should be moved to getOnApplicationStart() or pass the application as a parameter here
                        href="/parodos/onboarding"
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
