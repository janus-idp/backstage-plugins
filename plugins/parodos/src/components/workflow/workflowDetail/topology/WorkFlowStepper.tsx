import React from 'react';
import '@patternfly/react-core/dist/styles/base.css';
import { PipelineLayout } from './PipelineLayout';

import { makeStyles } from '@material-ui/core';
import { WorkFlowTask } from '../../../../models/workFlowTaskSchema';

const useStyles = makeStyles(theme => ({
  pfRi__topologyDemo: {
    width: '100%',
    height: '35%',
    '& .pf-topology-visualization-surface__svg': {
      background: theme.palette.background.default,
    },
  },
}));

type Props = {
  tasks: WorkFlowTask[];
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
