import { LogViewer } from '@backstage/core-components';
import React from 'react';
import { withStyles } from '@material-ui/core';

const exampleLog = `Starting up task with following steps
[32minfo[39m: green 1
[32minfo[39m: green 2
[32minfo[39m: green 3
[31merror[39m: red 1
[31merror[39m: red 2
[31merror[39m: red 3
[33merror[39m: yellow 1
[33merror[39m: yellow 2
[33merror[39m: yellow 3
[34merror[39m: blue 1
[34merror[39m: blue 2
[34merror[39m: blue 3
[35merror[39m: purple 1
[36merror[39m: cyan 1
`;

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

export const WorkFlowLogViewer = () => (
  <div style={{ height: '43%' }}>
    <ParodosLogViewer text={exampleLog} />
  </div>
);
