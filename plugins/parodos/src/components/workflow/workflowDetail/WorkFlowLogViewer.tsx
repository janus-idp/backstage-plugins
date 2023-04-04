import { LogViewer } from '@backstage/core-components';
import React from 'react';
import { withStyles } from '@material-ui/core';

const ParodosLogViewer = withStyles(theme => ({
  root: {
    background: theme.palette.background.paper,
  },
  log: {
    background: theme.palette.background.paper,
  },
}))(LogViewer);

export const WorkFlowLogViewer = ({ log }: { log: string }) => (
  <div>
    <ParodosLogViewer text={log} />
  </div>
);
