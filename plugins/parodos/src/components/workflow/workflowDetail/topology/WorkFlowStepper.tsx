import React from 'react';
import '@patternfly/react-core/dist/styles/base.css';
import { PipelineLayout } from './PipelineLayout';

import { makeStyles } from '@material-ui/core';
import { WorkflowTask } from '../../../../models/workflowTaskSchema';

const useStyles = makeStyles(theme => ({
  pfRi__topologyDemo: {
    width: '100%',
    '& .pf-topology-visualization-surface__svg': {
      background: theme.palette.background.default,
    },
  },
}));

type Props = {
  tasks: WorkflowTask[];
  setSelectedTask: (selectedTask: string) => void;
};

export const WorkFlowStepper = (props: Props) => {
  const classes = useStyles();
  return (
    <div className={classes.pfRi__topologyDemo}>
      <PipelineLayout {...props} />
    </div>
  );
};
