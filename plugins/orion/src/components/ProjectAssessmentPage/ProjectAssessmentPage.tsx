import React from 'react';
import {
  Content,
  ContentHeader,
  Link,
  Page,
  Select,
  SupportButton,
} from '@backstage/core-components';
import { Add } from '@material-ui/icons';
import { Grid } from '@material-ui/core';
import { EmptyProjectsState } from '../EmptyProjectsState';
import { useCommonStyles } from '../../styles';
import { PageHeader } from '../PageHeader';

export const ProjectAssessmentPage = () => {
  const commonStyles = useCommonStyles();

  const projectFilterItems = [
    /* TODO: https://issues.redhat.com/browse/FLPATH-52 */ {
      label: 'foo',
      value: 'bar',
    },
  ];
  const projects = [
    /* TODO */
  ];

  const onFilterProjects = () => {
    console.log('TODO: https://issues.redhat.com/browse/FLPATH-52');
  };

  return (
    <Page themeId="tool">
      <PageHeader />
      <Content>
        <ContentHeader title="Projects overview">
          <SupportButton title="Need help?">Lorem Ipsum</SupportButton>
        </ContentHeader>

        <Grid container direction="row">
          <Grid item xs={3}>
            <Select
              onChange={onFilterProjects}
              placeholder="All projects"
              label="Filter by"
              items={projectFilterItems}
            />
          </Grid>

          <Grid item xs={3}>
            <Link to="/parodos/newproject">
              <Add className={commonStyles.inlineicon} />
              &nbsp;Add new project
            </Link>
          </Grid>

          {!projects?.length && (
            <Grid item xs={12}>
              <EmptyProjectsState />
            </Grid>
          )}
        </Grid>
      </Content>
    </Page>
  );
};
