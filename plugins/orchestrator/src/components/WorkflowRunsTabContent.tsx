import React, { useState } from 'react';

import {
  ErrorPanel,
  InfoCard,
  Link,
  SelectItem,
  Table,
  TableColumn,
} from '@backstage/core-components';
import { useApi, useRouteRef } from '@backstage/core-plugin-api';

import { Grid } from '@material-ui/core';

import {
  ProcessInstanceState,
  ProcessInstanceStateValues,
} from '@janus-idp/backstage-plugin-orchestrator-common';

import { orchestratorApiRef } from '../api';
import { VALUE_UNAVAILABLE } from '../constants';
import { workflowInstanceRouteRef } from '../routes';
import { capitalize, ellipsis } from '../utils/StringUtils';
import usePolling from '../utils/usePolling';
import { Selector } from './Selector';
import { mapProcessInstanceToDetails } from './WorkflowInstancePageContent';
import { WorkflowInstanceStatusIndicator } from './WorkflowInstanceStatusIndicator';
import { WorkflowRunDetail } from './WorkflowRunDetail';

const makeSelectItemsFromProcessInstanceValues = () =>
  [
    ProcessInstanceState.Active,
    ProcessInstanceState.Error,
    ProcessInstanceState.Completed,
    ProcessInstanceState.Aborted,
    ProcessInstanceState.Suspended,
  ].map(
    (status): SelectItem => ({
      label: capitalize(status),
      value: status,
    }),
  );

export const WorkflowRunsTabContent = () => {
  const orchestratorApi = useApi(orchestratorApiRef);
  const workflowInstanceLink = useRouteRef(workflowInstanceRouteRef);
  const [statusSelectorValue, setStatusSelectorValue] = useState<string>(
    Selector.AllItems,
  );

  const { loading, error, value } = usePolling(async () => {
    const instances = await orchestratorApi.getInstances();
    const clonedData: WorkflowRunDetail[] = instances.map(
      mapProcessInstanceToDetails,
    );

    return clonedData;
  });

  const columns = React.useMemo(
    (): TableColumn<WorkflowRunDetail>[] => [
      {
        title: 'ID',
        render: data => (
          <Link to={workflowInstanceLink({ instanceId: data.id })}>
            {ellipsis(data.id)}
          </Link>
        ),
      },
      {
        title: 'Name',
        field: 'name',
      },
      {
        title: 'Status',
        render: data => (
          <WorkflowInstanceStatusIndicator
            status={data.status as ProcessInstanceStateValues}
          />
        ),
      },
      {
        title: 'Category',
        render: data => capitalize(data.category ?? VALUE_UNAVAILABLE),
      },
      { title: 'Started', field: 'started' },
      { title: 'Duration', field: 'duration' },
    ],
    [workflowInstanceLink],
  );

  const statuses = React.useMemo(makeSelectItemsFromProcessInstanceValues, []);

  const filteredData = React.useMemo(
    () =>
      (value || []).filter(
        (row: WorkflowRunDetail) =>
          statusSelectorValue === Selector.AllItems ||
          row.status === statusSelectorValue,
      ),
    [statusSelectorValue, value],
  );

  const selectors = React.useMemo(
    () => (
      <Grid container alignItems="center">
        <Grid item>
          <Selector
            label="Status"
            items={statuses}
            onChange={setStatusSelectorValue}
            selected={statusSelectorValue}
          />
        </Grid>
      </Grid>
    ),
    [statusSelectorValue, statuses],
  );

  return error ? (
    <ErrorPanel error={error} />
  ) : (
    <InfoCard noPadding title={selectors}>
      <Table
        title="Workflow Runs"
        options={{
          search: true,
          paging: true,
        }}
        isLoading={loading}
        columns={columns}
        data={filteredData}
      />
    </InfoCard>
  );
};
