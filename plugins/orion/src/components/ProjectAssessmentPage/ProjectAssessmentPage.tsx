import React from 'react';
import {
  Content,
  ContentHeader,
  Header,
  Page,
  Select,
} from '@backstage/core-components';
import { Add } from '@material-ui/icons';
import { Grid } from '@material-ui/core';

export const ProjectAssessmentPage = () => {
  const projectFilterItems = [
    /* TODO: https://issues.redhat.com/browse/FLPATH-52 */ {
      label: 'foo',
      value: 'bar',
    },
  ];

  const onFilterProjects = () => {
    console.log('TODO: https://issues.redhat.com/browse/FLPATH-52');
  };

  return (
    <Page themeId="tool">
      <Header title="Orion" />
      <Content>
        <ContentHeader title="Projects overview" />

        <Grid container spacing={3}>
          <Grid item xs={3}>
            <Select
              onChange={onFilterProjects}
              placeholder="All projects"
              label="Filter by"
              items={projectFilterItems}
            />
          </Grid>

          <Grid item xs={3}>
            <span>
              <Add className="inline-icon" />
              &nbsp;Add new project
            </span>
          </Grid>
        </Grid>
      </Content>
    </Page>
  );
};
