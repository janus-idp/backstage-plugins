import React from 'react';
import {
  ContentHeader,
  Link,
  Select,
  SelectedItems,
  SupportButton,
} from '@backstage/core-components';
import Add from '@material-ui/icons/Add';
import { Card, CardContent, Grid, makeStyles } from '@material-ui/core';
import { useAsync } from 'react-use';

import { EmptyProjectsState } from './EmptyProjectsState';
import { ParodosPage } from '../ParodosPage';
import { ProjectStatusType, ProjectType } from '../types';
import { ProjectsTable } from './ProjectsTable';
import { useBackendUrl } from '../api';

const projectFilterItems: { label: string; value: ProjectStatusType }[] = [
  { label: 'All Projects', value: 'all-projects' },
  { label: 'In Progress', value: 'in-progress' },
  { label: 'On Boarded', value: 'on-boarded' },
];

export const useStyles = makeStyles(theme => ({
  full: {
    height: '100%',
  },
  addIcon: {
    display: 'flex',
    alignItems: 'center',
    marginTop: `${theme.spacing(2)}px`,
    [theme.breakpoints.up('md')]: {
      marginLeft: `${theme.spacing(2)}px`,
    }
  },
}));

export const ProjectOverviewPage = (): JSX.Element => {
  const styles = useStyles();
  const [projectFilter, setProjectFilter] = React.useState('all-projects');
  const [filteredProjects, setFilteredProjects] = React.useState<ProjectType[]>(
    [],
  );
  const backendUrl = useBackendUrl();

  const {
    value: allProjects,
    loading: loadingProjects,
    error: errorProjects,
  } = useAsync(async (): Promise<ProjectType[]> => {
    // TODO: finish after https://issues.redhat.com/browse/FLPATH-131
    // return mockProjects;

    const response = await fetch(`${backendUrl}/api/proxy/parodos/projects`);
    const receivedProjects = (await response.json()) as ProjectType[];

    // mock status for now:
    const status: ProjectStatusType = 'in-progress';
    const result = receivedProjects.map(project => ({ ...project, status }));

    return result;
  }, []);

  React.useEffect(() => {
    if (!allProjects) {
      setFilteredProjects([]);
      return;
    }

    let filtered = allProjects;
    if (projectFilter !== 'all-projects') {
      filtered = allProjects.filter(
        project => project.status === projectFilter,
      );
    }
    setFilteredProjects(filtered);
  }, [allProjects, projectFilter]);

  const onFilterProjects = (selected: SelectedItems) => {
    setProjectFilter(
      selected as ProjectStatusType /* we have single-selection here */,
    );
  };

  let content: React.ReactElement | null = null;
  if (loadingProjects) {
    content = <div>Loading...</div>;
  } else if (errorProjects) {
    content = <div>Error: {errorProjects.message}</div>;
  } else if (allProjects && allProjects.length > 0) {
    content = (
      <Grid container direction="row" spacing={0}>
        <Grid item xs={3}>
          <Select
            onChange={onFilterProjects}
            label="Filter by"
            items={projectFilterItems}
            selected={projectFilter}
          />
        </Grid>

        <Grid item xs={9}>
          <ProjectsTable projects={filteredProjects} />
        </Grid>
      </Grid>
    );
  } else {
    content = <EmptyProjectsState />;
  }

  return (
    <ParodosPage>
      <ContentHeader title="Projects overview">
        <SupportButton title="Need help?">Lorem Ipsum</SupportButton>
      </ContentHeader>
      <Card className={styles.full}>
        <CardContent>
          <Grid container direction="row" spacing={0} alignItems="center">
            <Grid item xs={11} md={3} lg={2}>
              <Select
                onChange={onFilterProjects}
                label="Filter by"
                items={projectFilterItems}
                selected={projectFilter}
              />
            </Grid>

            <Grid item xs={11} md={3} lg={9}>
              <Link to="/parodos/workflow" className={styles.addIcon}>
                <Add />
                Add new project
              </Link>
            </Grid>
          </Grid>
          <Grid container direction="column" justifyContent="space-around" alignItems="center">
            {content}
          </Grid>
        </CardContent>
      </Card>
    </ParodosPage>
  );
};
