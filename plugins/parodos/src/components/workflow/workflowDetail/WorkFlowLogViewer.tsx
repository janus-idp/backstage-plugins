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

interface WorkFlowLogViewerProps {
  log: string;
  className?: string;
}

export const WorkFlowLogViewer = ({ className, log }: WorkFlowLogViewerProps) => (
  <div className={className}>
    <ParodosLogViewer text={log} />
  </div>
);
