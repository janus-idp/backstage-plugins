import React, { useEffect, useMemo, useState } from 'react';
import Moment from 'react-moment';

import { InfoCard, Table } from '@backstage/core-components';
import { useApi } from '@backstage/core-plugin-api';

import { Grid } from '@material-ui/core';
import Tooltip from '@material-ui/core/Tooltip';
import CancelOutlinedIcon from '@material-ui/icons/CancelOutlined';
import CheckOutlinedIcon from '@material-ui/icons/CheckOutlined';
import NotInterestedOutlinedIcon from '@material-ui/icons/NotInterestedOutlined';
import ReplayOutlinedIcon from '@material-ui/icons/ReplayOutlined';
import ScheduleOutlinedIcon from '@material-ui/icons/ScheduleOutlined';

import {
  JobStatus,
  ProcessInstance,
} from '@janus-idp/backstage-plugin-orchestrator-common';

import { orchestratorApiRef } from '../../api';
import { Paragraph } from '../Paragraph/Paragraph';

interface ProcessJobsProps {
  selectedInstance: ProcessInstance | undefined;
}

type TableRow = {
  jobId: React.ReactNode;
  status: React.ReactNode;
  expirationTime: React.ReactNode;
};

function capitalizeFirstChar(input: string): string {
  if (input.length === 0) {
    return input;
  }

  const firstChar = input[0].toLocaleUpperCase('en-US');
  const restOfString = input.slice(1).toLocaleLowerCase('en-US');

  return firstChar + restOfString;
}

const TABLE_HEADERS = [
  { title: 'Timer Id', field: 'jobId' },
  { title: 'Status', field: 'status' },
  { title: 'Expiration', field: 'expirationTime' },
];

export const ProcessJobs = (props: ProcessJobsProps) => {
  const orchestratorApi = useApi(orchestratorApiRef);
  const { selectedInstance } = props;
  const [data, setData] = useState<TableRow[] | null>(null);

  const viewState = useMemo(() => {
    if (!selectedInstance) {
      return 'unselected';
    }
    return 'selected';
  }, [selectedInstance]);

  useEffect(() => {
    if (!selectedInstance) {
      return;
    }

    orchestratorApi.getInstanceJobs(selectedInstance.id).then(jobs => {
      if (!jobs?.length) {
        setData([]);
        return;
      }

      const rows: TableRow[] = jobs.map(job => {
        let statusIcon;
        switch (job.status) {
          case JobStatus.Canceled:
            statusIcon = <NotInterestedOutlinedIcon />;
            break;
          case JobStatus.Retry:
            statusIcon = <ReplayOutlinedIcon />;
            break;
          case JobStatus.Scheduled:
            statusIcon = <ScheduleOutlinedIcon />;
            break;
          case JobStatus.Executed:
            statusIcon = <CheckOutlinedIcon htmlColor="#3E8635" />;
            break;
          case JobStatus.Error:
            statusIcon = <CancelOutlinedIcon htmlColor="#C9190B" />;
            break;
          default:
            break;
        }

        const expirationTime = new Date(job.expirationTime);
        const isExpired = expirationTime < new Date();

        return {
          jobId: (
            <Tooltip title={job.id}>
              <div>{job.id.substring(0, 7)}</div>
            </Tooltip>
          ),
          status: (
            <Grid container spacing={1} direction="row" alignItems="center">
              <Grid item>{statusIcon}</Grid>
              <Grid item> {capitalizeFirstChar(job.status)}</Grid>
            </Grid>
          ),
          expirationTime: job.expirationTime ? (
            <Tooltip title={expirationTime.toString()}>
              <div>
                {isExpired ? 'expired' : 'expires'}{' '}
                <Moment fromNow>{expirationTime}</Moment>
              </div>
            </Tooltip>
          ) : (
            '-'
          ),
        };
      });
      setData(rows);
    });
  }, [selectedInstance, orchestratorApi]);

  return (
    <InfoCard title="Timers">
      {viewState === 'unselected' && (
        <Paragraph>No instance selected</Paragraph>
      )}
      {viewState === 'selected' && (
        <Table<TableRow>
          data={data ?? []}
          columns={TABLE_HEADERS}
          options={{
            padding: 'dense',
            search: false,
          }}
        />
      )}
    </InfoCard>
  );
};
