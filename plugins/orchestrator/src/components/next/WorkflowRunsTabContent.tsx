import React, { useState } from 'react';
import { useAsync } from 'react-use';

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

import { ProcessInstanceState } from '@janus-idp/backstage-plugin-orchestrator-common';

import { orchestratorApiRef } from '../../api';
import { VALUE_UNAVAILABLE } from '../../constants';
import { nextWorkflowInstanceRouteRef } from '../../routes';
import { humanizeProcessInstanceState } from '../../utils';
import { capitalize } from '../../utils/StringUtils';
import { ProcessInstanceStatus } from './ProcessInstanceStatus';
import { Selector } from './Selector';
import { TableExpandCollapse } from './TableExpandCollapse';
import { mapProcessInstanceToDetails } from './WorkflowInstancePageContent';
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
      label: humanizeProcessInstanceState(status) || '',
      value: status,
    }),
  );

export const WorkflowRunsTabContent = () => {
  const orchestratorApi = useApi(orchestratorApiRef);
  const workflowInstanceLink = useRouteRef(nextWorkflowInstanceRouteRef);
  const [workflowSelectorValue, setWorkflowSelectorValue] = useState<string>(
    Selector.AllItems,
  );
  const [statusSelectorValue, setStatusSelectorValue] = useState<string>(
    Selector.AllItems,
  );
  const [isExpanded, setIsExpanded] = React.useState(true);

  const { loading, error, value } = useAsync(async () => {
    const instances = await orchestratorApi.getInstances();
    const clonedData: WorkflowRunDetail[] = instances.map(
      mapProcessInstanceToDetails,
    );

    return clonedData;
  }, [orchestratorApi]);

  const columns = React.useMemo(
    (): TableColumn<WorkflowRunDetail>[] => [
      {
        title: 'Name',
        render: data => (
          <Link to={workflowInstanceLink({ instanceId: data.id })}>
            {data.name}
          </Link>
        ),
      },
      {
        title: 'Category',
        render: data => capitalize(data.category ?? VALUE_UNAVAILABLE),
      },
      {
        title: 'Status',
        render: data => <ProcessInstanceStatus status={data.status} />,
      },
      { title: 'Started', field: 'started' },
      { title: 'Duration', field: 'duration' },
      { title: 'ID', field: 'id' },
    ],
    [workflowInstanceLink],
  );

  const workflows: SelectItem[] = React.useMemo(
    () =>
      [
        // deduplicate
        ...new Set(value?.map(row => row.workflow)),
      ]
        .sort((a, b) => a.localeCompare(b))
        .map(
          // make the resulting SelectItem
          name => ({ label: name, value: name }),
        ),
    [value],
  );

  const statuses = React.useMemo(makeSelectItemsFromProcessInstanceValues, []);

  const filteredData = React.useMemo(
    () =>
      (value || []).filter(
        (row: WorkflowRunDetail) =>
          (workflowSelectorValue === Selector.AllItems ||
            row.workflow === workflowSelectorValue) &&
          (statusSelectorValue === Selector.AllItems ||
            row.status === statusSelectorValue),
      ),
    [statusSelectorValue, value, workflowSelectorValue],
  );

  const selectors = React.useMemo(
    () => (
      <Grid container alignItems="center">
        <Grid item>
          <Selector
            label="Workflow"
            items={workflows}
            onChange={setWorkflowSelectorValue}
            selected={workflowSelectorValue}
          />
        </Grid>
        <Grid item>
          <Selector
            label="Status"
            items={statuses}
            onChange={setStatusSelectorValue}
            selected={statusSelectorValue}
          />
        </Grid>
        <Grid item style={{ marginLeft: 'auto' }}>
          <TableExpandCollapse
            isExpanded={isExpanded}
            setIsExpanded={setIsExpanded}
          />
        </Grid>
      </Grid>
    ),
    [
      isExpanded,
      statusSelectorValue,
      statuses,
      workflowSelectorValue,
      workflows,
    ],
  );

  return error ? (
    <ErrorPanel error={error} />
  ) : (
    <InfoCard noPadding title={selectors}>
      {isExpanded ? (
        <Table
          title="Workflow Runs"
          options={{
            search: true,
            paging: true,
          }}
          isLoading={loading && !error}
          columns={columns}
          data={filteredData}
        />
      ) : null}
    </InfoCard>
  );
};
