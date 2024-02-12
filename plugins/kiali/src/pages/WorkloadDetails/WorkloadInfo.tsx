import React from 'react';

import { Card, CardContent, Grid } from '@material-ui/core';

import { WorkloadHealth } from '../../types/Health';
import { Workload } from '../../types/Workload';
import { WorkloadDescription } from './WorkloadsDescription';

type WorkloadInfoProps = {
  duration?: number;
  namespace?: string;
  workload?: Workload;
  health?: WorkloadHealth;
};

export const WorkloadInfo = (workloadProps: WorkloadInfoProps) => {
  return (
    <Card>
      <CardContent>
        <Grid container spacing={2}>
          <Grid key={`Card_${workloadProps.workload?.name}`} item xs={4}>
            <WorkloadDescription
              workload={workloadProps.workload}
              health={workloadProps.health}
              namespace={workloadProps.namespace}
            />
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};
