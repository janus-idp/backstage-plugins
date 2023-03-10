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
import * as urls from '../../urls';
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
  fullHeight: {
    display: 'flex',
    minHeight: 0,
    height: '100%',
  },
  table: {
    marginTop: theme.spacing(5),
  },
  addIcon: {
    display: 'flex',
    alignItems: 'center',
    marginTop: theme.spacing(2),
    [theme.breakpoints.up('md')]: {
      marginLeft: theme.spacing(2),
    },
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
    value: allProjects = [],
    loading: loadingProjects,
    error: errorProjects,
  } = useAsync(async (): Promise<ProjectType[]> => {
    // TODO: finish after https://issues.redhat.com/browse/FLPATH-131

    const response = await fetch(`${backendUrl}${urls.Projects}`);
    const receivedProjects = (await response.json()) as ProjectType[];

    // mock status for now:
    const status: ProjectStatusType = 'in-progress';
    const result = receivedProjects.map(project => ({ ...project, status }));

    return result;
  }, [backendUrl]);

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
  } else if (allProjects.length > 0) {
    content = (
      <Grid item className={styles.table}>
        <ProjectsTable projects={filteredProjects} />
      </Grid>
    );
  } else {
    content = (
      <Grid container direction="column" alignItems="center" spacing={0}>
        <EmptyProjectsState />
      </Grid>
    );
  }

  return (
    <ParodosPage stretch>
      <ContentHeader title="Projects overview">
        <SupportButton title="Need help?">Lorem Ipsum</SupportButton>
      </ContentHeader>
      <Card className={styles.fullHeight}>
        <CardContent>
          <Grid container direction="row" alignItems="center">
            <Grid item xs={12} md={4} lg={2}>
              <Select
                onChange={onFilterProjects}
                label="Filter by"
                items={projectFilterItems}
                selected={projectFilter}
                margin="none"
              />
            </Grid>

            <Grid item xs={12} md={8} lg={10}>
              <Link to="/parodos/workflow" className={styles.addIcon}>
                <Add />
                Add new project
              </Link>
            </Grid>
          </Grid>

          {content}
        </CardContent>
      </Card>
    </ParodosPage>
  );
};
