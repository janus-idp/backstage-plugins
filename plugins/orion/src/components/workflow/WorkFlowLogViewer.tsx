import { LogViewer } from '@backstage/core-components';
import React from 'react';
import { withStyles } from '@material-ui/core';

const ParodosLogViewer = withStyles(theme => ({
  root: {
    background: theme.palette.background.paper,
  },
  log: {
    background: theme.palette.background.paper,
    // fontSize: theme.typography.body2.fontSize,
    // fontFamily: theme.typography.fontFamily,
  },
}))(LogViewer);

export const WorkFlowLogViewer = ({ log }: { log: string }) => (
  <div style={{ height: '43%' }}>
    <ParodosLogViewer text={log} />
  </div>
);
