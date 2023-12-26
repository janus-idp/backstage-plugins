import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAsync } from 'react-use';

import { SelectItem, Table, TableColumn } from '@backstage/core-components';
import { useApi, useRouteRef } from '@backstage/core-plugin-api';

import { Box, makeStyles } from '@material-ui/core';

import { WorkflowCategory } from '@janus-idp/backstage-plugin-orchestrator-common';

import { orchestratorApiRef } from '../../api';
import { nextWorkflowInstanceRouteRef } from '../../routes';
import { firstLetterCapital } from '../../utils';
import { ProcessInstanceStatus } from './ProcessInstanceStatus';
import { StatusSelector } from './StatusSelector';
import { TableExpandCollapse } from './TableExpandCollapse';
import {
  mapProcessInstanceToDetails,
  WorkflowRunDetail,
} from './WorkflowInstancePageContent';
import { WorkflowSelector } from './WorkflowSelector';
import { WrapperInfoCard } from './WrapperInfoCard';

const useStyles = makeStyles(_ => ({
  link: {
    color: '-webkit-link',
  },
}));

export const WorkflowRunsTabContent = () => {
  const orchestratorApi = useApi(orchestratorApiRef);
  const workflowInstanceLink = useRouteRef(nextWorkflowInstanceRouteRef);
  const styles = useStyles();
  const [workflow, setWorkflow] = useState<string>();
  const [status, setStatus] = useState<string>();
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
        render: data =>
          data.category?.toLowerCase() ===
          WorkflowCategory.ASSESSMENT.toLowerCase() ? (
            <Link
              className={styles.link}
              to={workflowInstanceLink({ instanceId: data.id })}
            >
              {data.name}
            </Link>
          ) : (
            data.name
          ),
      },
      { title: 'Type', render: data => firstLetterCapital(data.category) },
      {
        title: 'Status',
        render: data => <ProcessInstanceStatus status={data.status} />,
      },
      { title: 'Started', field: 'started' },
      { title: 'Duration', field: 'duration' },
      { title: 'Component', field: 'component' },
      { title: 'ID', field: 'id' },
    ],
    [styles.link, workflowInstanceLink],
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
        (row: WorkflowRunDetail) =>
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
        <StatusSelector onChange={setStatus} value={status} />
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
        />
      )}
    </WrapperInfoCard>
  );
};
