import React from 'react';

import { makeStyles } from '@material-ui/core';
import DotIcon from '@material-ui/icons/FiberManualRecord';

import { ProcessInstanceState } from '@janus-idp/backstage-plugin-orchestrator-common';

import { humanizeProcessInstanceState } from './utils';

const useStyles = makeStyles(theme => ({
  root: {},
  icon: { fontSize: '0.75rem' },
  [ProcessInstanceState.Active.toLowerCase()]: {
    color: theme.palette.primary.main,
  },
  [ProcessInstanceState.Aborted.toLowerCase()]: {
    color: theme.palette.grey[400],
  },
  [ProcessInstanceState.Completed.toLowerCase()]: {
    color: theme.palette.success.main,
  },
  [ProcessInstanceState.Error.toLowerCase()]: {
    color: theme.palette.error.main,
  },
  [ProcessInstanceState.Suspended.toLowerCase()]: {
    color: theme.palette.warning.main,
  },
}));

export const ProcessInstanceStatus = ({ status }: { status: string }) => {
  const styles = useStyles();
  const colorStyle = styles[status.toLowerCase()];

  const icon = colorStyle && (
    <DotIcon className={`${styles.icon} ${colorStyle}`} />
  );

  // TODO(mlibra): Show progress, i.e.: (2/5)
  return (
    <div className={styles.root}>
      {icon} {humanizeProcessInstanceState(status)}
    </div>
  );
};
