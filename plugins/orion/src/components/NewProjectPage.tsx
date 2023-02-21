import React from 'react';
import {
  Content,
  ContentHeader,
  Page,
  SupportButton,
} from '@backstage/core-components';
import { PageHeader } from './PageHeader';
import { useCommonStyles } from '../styles';
import {
  Button,
  Grid,
  OutlinedInputProps,
  TextField,
  Typography,
} from '@material-ui/core';

export const NewProjectPage = () => {
  const commonStyles = useCommonStyles();
  const [projectName, setProjectName] = React.useState<string>();
  const [projectRepoOrImage, setProjectRepoOrImage] = React.useState<string>();

  const onChangeProjectName: OutlinedInputProps['onChange'] = event => {
    setProjectName(event.target.value);
  };

  const onChangeProjectRepoOrImage: OutlinedInputProps['onChange'] = event => {
    setProjectRepoOrImage(event.target.value);
  };

  const onStartAssessment = () => {
    console.log('TODO: implement start assessment');
  };

  return (
    <Page themeId="tool">
      <PageHeader />
      <Content>
        <ContentHeader title="Project assessment">
          <SupportButton title="Need help?">Lorem Ipsum</SupportButton>
        </ContentHeader>
        <Typography paragraph>
          Select a project for an assessment of what additional workflows, if
          any, it qualifies for.
        </Typography>

        <Grid container direction="row" spacing={2}>
          <Grid item>
            <TextField
              id="project-name"
              label="Project name"
              variant="outlined"
              value={projectName}
              onChange={onChangeProjectName}
            />
          </Grid>

          <Grid item xs={5}>
            <TextField
              id="project-repo-or-image"
              label="Git Repo URL or Container Image"
              variant="outlined"
              value={projectRepoOrImage}
              onChange={onChangeProjectRepoOrImage}
              fullWidth
            />
          </Grid>

          <Grid item className={commonStyles.paddingtop1}>
            <Button
              id="start-assessment"
              variant="contained"
              onClick={onStartAssessment}
              color="primary"
            >
              START ASSESSMENT
            </Button>
          </Grid>

          <Grid item>{/* Space saver */}</Grid>
        </Grid>
      </Content>
    </Page>
  );
};
