import React from 'react';
import { Box, makeStyles, Typography } from '@material-ui/core';
import { Link } from '@backstage/core-components';
import { ProjectIcon } from '../icons/Project';

export const useStyles = makeStyles(theme => ({
  spacing: {
    display: 'grid',
    placeItems: 'center',
    marginTop: theme.spacing(5),
    [theme.breakpoints.up('xl')]: {
      gridTemplateRows: 'auto 1.5fr 1fr 1.5fr',
    },
  },
}));

export const EmptyProjectsState = () => {
  const styles = useStyles();

  return (
    <Box className={styles.spacing}>
      <ProjectIcon style={{ fontSize: '6rem' }} />
      <Typography variant="h6">
        You don&apos;t have any projects on here yet!
      </Typography>
      <Typography paragraph>
        To start using Parodos, you&apos;ll first need to initiate a project
        assessment.
      </Typography>
      <Typography paragraph>
        <Link to="/parodos/workflow">GET STARTED</Link>
      </Typography>
    </Box>
  );
};
