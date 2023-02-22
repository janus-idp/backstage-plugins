import React from 'react';
import {
  ContentHeader,
  Link,
  Select,
  SupportButton,
} from '@backstage/core-components';
import Add from '@material-ui/icons/Add';
import { Grid } from '@material-ui/core';
import { EmptyProjectsState } from './EmptyProjectsState';
import { useCommonStyles } from '../../styles';
import { ParodosPage } from '../ParodosPage';
import { mockProjectFilterItems, mockProjects } from './mockData';

export const ProjectOverviewPage = () => {
  const commonStyles = useCommonStyles();

  const projectFilterItems = mockProjectFilterItems;
  const projects = mockProjects;

  const onFilterProjects = () => {
    // eslint-disable-next-line no-console
    console.log('TODO: https://issues.redhat.com/browse/FLPATH-52');
  };

  return (
    <ParodosPage>
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
          <Link to="/parodos/workflow">
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
    </ParodosPage>
  );
};
