import React from 'react';
import { Card, makeStyles, Typography } from '@material-ui/core';
import { Link } from '@backstage/core-components';
import { InfoOutlined } from '@material-ui/icons';
import { useCommonStyles } from '../../styles';

export const useStyles = makeStyles({
  paddingtop: {'padding-top': '2rem'},
});

export const EmptyProjectsState = () => {
  const commonStyles = useCommonStyles();
  const styles = useStyles();

  return (
    <Card className={`${commonStyles.center} ${styles.paddingtop}`}>
      <InfoOutlined fontSize="large" className={commonStyles.centericon} />
      <Typography variant="h6">
        You don’t have any projects on here yet!
      </Typography>
      <Typography paragraph>
        To start using Parodos, you’ll first need to initiate a project
        assessment.
      </Typography>
      <Typography paragraph>
        <Link to="/parodos/newproject">GET STARTED</Link>
      </Typography>
    </Card>
  );
};
