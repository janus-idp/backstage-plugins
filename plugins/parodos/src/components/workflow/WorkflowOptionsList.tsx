import { ItemCardHeader } from '@backstage/core-components';
import {
  Button,
  Card,
  CardActions,
  CardContent,
  CardMedia,
  Grid,
  makeStyles,
  Typography,
} from '@material-ui/core';
import React from 'react';
import { useCommonStyles } from '../../styles';
import { Link } from 'react-router-dom';
import { type Project } from '../../models/project';
import { type WorkflowOptionItem } from '../../models/workflow';

export type WorkflowOptionsListItem = WorkflowOptionItem & { type: string };

interface WorkflowOptionsListProps {
  project: Project;
  workflowOptions: WorkflowOptionsListItem[];
}

const useStyles = makeStyles(theme => ({
  applicationHeader: {
    background: theme.palette.background.default,
    color: theme.palette.text.primary,
    '& h4': {
      fontWeight: 400,
    },
  },
  applicationCard: {
    background: theme.palette.background.default,
    color: theme.palette.text.secondary,
    height: '100%',
  },
}));

export function WorkflowOptionsList({
  project,
  workflowOptions,
}: WorkflowOptionsListProps): JSX.Element {
  const commonStyles = useCommonStyles();
  const styles = useStyles();

  return (
    <>
      <Typography paragraph className={commonStyles.margintop1}>
        Assessment completed. To continue please select from the following
        option(s):
      </Typography>
      <Grid container direction="row" spacing={2}>
        {workflowOptions.map(workflowOption => (
          <Grid item xs={12} lg={6} xl={4} key={workflowOption.identifier}>
            <Card raised={false} className={styles.applicationCard}>
              <CardMedia>
                <CardContent>{workflowOption.type}</CardContent>
                <ItemCardHeader
                  title={workflowOption.displayName}
                  classes={{ root: styles.applicationHeader }}
                />
              </CardMedia>
              <CardContent>{workflowOption.description}</CardContent>
              <CardActions>
                <Button
                  variant="text"
                  color="primary"
                  component={Link}
                  // passing the workflow option as query param as a short term measure.  Need proper state management
                  to={`/parodos/onboarding/${project?.id}/${workflowOption.workFlowName}/new/?option=${workflowOption.displayName}`}
                >
                  START
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
    </>
  );
}
