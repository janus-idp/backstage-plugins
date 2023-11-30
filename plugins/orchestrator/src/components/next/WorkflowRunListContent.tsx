import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAsync } from 'react-use';

import { SelectItem, Table, TableColumn } from '@backstage/core-components';
import { useApi, useRouteRef } from '@backstage/core-plugin-api';

import { Box } from '@material-ui/core';
import moment from 'moment';

import { orchestratorApiRef } from '../../api';
import { workflowInstanceRouteRef } from '../../routes';
import { ProcessInstanceStatus } from './ProcessInstanceStatus';
import { StatusSelector } from './StatusSelector';
import { TableExpandCollapse } from './TableExpandCollapse';
import { WorkflowSelector } from './WorkflowSelector';
import { WrapperInfoCard } from './WrapperInfoCard';

const DASHES = '---';
interface Row {
  id: string;
  name: string;
  workflow: string;
  status: string;
  started: string;
  duration: string;
  component: string;
}

const DetailPanel = ({ rowData }: { rowData: Row }) => {
  return (
    <div>
      TODO - render timeline component based on {JSON.stringify(rowData)}
    </div>
  );
};

export const WorkflowRunListContent = () => {
  const orchestratorApi = useApi(orchestratorApiRef);
  const workflowInstanceLink = useRouteRef(workflowInstanceRouteRef);
  const [workflow, setWorkflow] = useState<string>();
  const [status, onChangeStatus] = useState<string>();
  const [isExpanded, setIsExpanded] = React.useState(true);

  const { loading, error, value } = useAsync(async () => {
    const instances = await orchestratorApi.getInstances();
    const clonedData: Row[] = instances
      .filter(
        instance =>
          !instance.parentProcessInstanceId /* TODO: verify that this is truely filtering top-level instances */,
      )
      .map(instance => {
        const start = moment(instance.start?.toString());
        const end = moment(instance.end?.toString());
        const duration = moment.duration(start.diff(end));
        const name = instance.processName || instance.processId; /* TODO */

        const row: Row = {
          id: instance.id,
          name,
          workflow: instance.processName || instance.processId,
          started: start.format('MMMM DD, YYYY'),
          duration: duration.humanize(),
          status: instance.state,
          component: instance.source || DASHES /* TODO: is that correct? */,
        };

        return row;
      });

    return clonedData;
  }, [orchestratorApi]);

  const columns = React.useMemo(
    (): TableColumn<Row>[] => [
      {
        title: 'Name',
        render: data => (
          <Link to={workflowInstanceLink({ instanceId: data.id })}>
            {data.name}
          </Link>
        ),
      },
      { title: 'Workflow', field: 'workflow' },
      {
        title: 'Status',
        render: data => <ProcessInstanceStatus status={data.status} />,
      },
      { title: 'Started', field: 'started' },
      { title: 'Duration', field: 'duration' },
      { title: 'Component', field: 'component' },
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

  const filteredData = React.useMemo(
    () =>
      (value || []).filter(
        (row: Row) =>
          (!workflow || row.workflow === workflow) &&
          (!status || row.status === status),
      ),
    [status, value, workflow],
  );

  const selectors = (
    <Box sx={{ display: 'flex', justifyContent: 'flex-start' }}>
      <Box>
        <WorkflowSelector
          workflows={workflows}
          onChange={setWorkflow}
          value={workflow}
        />
      </Box>
      <Box paddingLeft="1rem">
        <StatusSelector onChange={onChangeStatus} value={status} />
      </Box>
      <Box sx={{ display: 'flex', flexGrow: 1, justifyContent: 'flex-end' }}>
        <TableExpandCollapse
          isExpanded={isExpanded}
          setIsExpanded={setIsExpanded}
        />
      </Box>
    </Box>
  );

  return (
    <WrapperInfoCard error={error} selectors={selectors}>
      {isExpanded && (
        <Table
          options={{
            search: true,
            paging: true,
          }}
          isLoading={loading && !error}
          title="Workflow Runs"
          columns={columns}
          data={filteredData}
          detailPanel={DetailPanel}
        />
      )}
    </WrapperInfoCard>
  );
};
