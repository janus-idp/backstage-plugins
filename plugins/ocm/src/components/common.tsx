import React from 'react';

import { StatusAborted, StatusError, StatusOK } from '@backstage/core-components';

import { Button, Grid, makeStyles, Tooltip } from '@material-ui/core';
import { ArrowCircleUpIcon } from '@patternfly/react-icons';

import { ClusterStatus, ClusterUpdate } from '@janus-idp/backstage-plugin-ocm-common';

const useStyles = makeStyles({
  button: {
    textTransform: 'none',
    borderRadius: 16,
    margin: '0px',
    paddingLeft: '4px',
    paddingRight: '4px',
  },
});

export const Status = ({ status }: { status: ClusterStatus }) => {
  if (!status) {
    return (
      <>
        <StatusAborted />
        Unknown
      </>
    );
  } else if (status.available) {
    return (
      <>
        <StatusOK />
        Ready
      </>
    );
  }
  return (
    <>
      <StatusError />
      Not Ready
    </>
  );
};

export const Update = ({ data }: { data: { version: string; update: ClusterUpdate } }) => {
  const classes = useStyles();
  return (
    <>
      {data.update.available ? (
        <Grid container direction="column" spacing={0}>
          <Grid item>{data.version}</Grid>
          <Grid item>
            <Tooltip title={`Version ${data.update.version!} available`}>
              <Button
                variant="text"
                color="primary"
                startIcon={<ArrowCircleUpIcon />}
                className={classes.button}
                href={data.update.url}
                size="small"
              >
                Upgrade available
              </Button>
            </Tooltip>
          </Grid>
        </Grid>
      ) : (
        data.version
      )}
    </>
  );
};
