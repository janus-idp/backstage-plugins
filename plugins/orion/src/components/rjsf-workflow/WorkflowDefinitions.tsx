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
import {
  type WorkflowDefinition,
  type Project,
} from '../../models/workflowDefinitionSchema';
import { useCommonStyles } from '../../styles';
import { Link } from 'react-router-dom';

interface WorkflowDefinitionsProps {
  project: Project;
  workflowDefinitions: WorkflowDefinition[];
}

const useStyles = makeStyles({
  applicationHeader: {
    background: 'gray',
  },
  applicationCard: {
    // height: '15rem',
    // width: '17rem',
  },
});

export function WorkflowDefinitions({
  project,
  workflowDefinitions,
}: WorkflowDefinitionsProps): JSX.Element {
  const commonStyles = useCommonStyles();
  const styles = useStyles();

  return (
    <>
      <Typography paragraph className={commonStyles.margintop1}>
        Assessment completed. To continue please select from the following
        option(s):
      </Typography>
      <Grid container direction="row" spacing={2}>
        {workflowDefinitions.map(workflow => (
          <Grid item>
            <Card key={workflow.name} raised className={styles.applicationCard}>
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
                  component={Link}
                  to={`/parodos/onboarding/${project?.id}/${workflow.id}/new/`}
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
