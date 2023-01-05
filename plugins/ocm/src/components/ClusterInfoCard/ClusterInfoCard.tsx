import React from 'react';
import { Button, Grid, makeStyles, Tooltip } from '@material-ui/core';
import ArrowUpwardRoundedIcon from '@material-ui/icons/ArrowUpwardRounded';
import { useCluster } from '../ClusterContext';
import { TableCardFromData } from '../TableCardFromData';

const useStyles = makeStyles({
  button: {
    textTransform: 'none',
    borderRadius: 16,
    margin: '0px',
    paddingLeft: '4px',
    paddingRight: '4px',
  },
});

export const ClusterInfoCard = () => {
  const { data } = useCluster();
  const classes = useStyles();

  if (!data) {
    return null;
  }

  data.openshiftVersion = (
    <>
      {data.update?.available ? (
        <Grid container direction="column" spacing={0}>
          <Grid item>{data.openshiftVersion}</Grid>
          <Grid item>
            <Tooltip title={`Version ${data.update?.version!} available`}>
              <Button
                variant="text"
                color="primary"
                startIcon={<ArrowUpwardRoundedIcon style={{ fontSize: 22 }} />}
                className={classes.button}
                href={data.update?.url}
                size="small"
              >
                Upgrade available
              </Button>
            </Tooltip>
          </Grid>
        </Grid>
      ) : (
        data.openshiftVersion
      )}
    </>
  ) as any;

  const nameMap = new Map<string, string>([
    ['name', 'Name'],
    ['kubernetesVersion', 'Kubernetes version'],
    ['openshiftId', 'OpenShift ID'],
    ['openshiftVersion', 'OpenShift version'],
    ['platform', 'Platform'],
    ['region', 'Region'],
    ['consoleUrl', 'Console URL'],
    ['oauthUrl', 'OAuth URL'],
  ]);
  return (
    <TableCardFromData data={data} title="Cluster Info" nameMap={nameMap} />
  );
};
