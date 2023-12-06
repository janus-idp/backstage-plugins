import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { Table, TableColumn, TableProps } from '@backstage/core-components';
import { useApi, useRouteRef } from '@backstage/core-plugin-api';

import DeleteForever from '@material-ui/icons/DeleteForever';
import Edit from '@material-ui/icons/Edit';
import Pageview from '@material-ui/icons/Pageview';
import PlayArrow from '@material-ui/icons/PlayArrow';

import { WorkflowOverview } from '@janus-idp/backstage-plugin-orchestrator-common';

import { orchestratorApiRef } from '../../api';
import WorkflowOverviewFormatter, {
  FormattedWorkflowOverview,
} from '../../dataFormatters/WorkflowOverviewFormatter';
import {
  editWorkflowRouteRef,
  nextExecuteWorkflowRouteRef,
  workflowDefinitionsRouteRef,
} from '../../routes';
import { ProcessInstanceStatus } from './ProcessInstanceStatus';

export interface WorkflowsTableProps {
  items: WorkflowOverview[];
}

export const WorkflowsTable = ({ items }: WorkflowsTableProps) => {
  const orchestratorApi = useApi(orchestratorApiRef);
  const navigate = useNavigate();
  const definitionLink = useRouteRef(workflowDefinitionsRouteRef);
  const executeWorkflowLink = useRouteRef(nextExecuteWorkflowRouteRef);
  const editLink = useRouteRef(editWorkflowRouteRef);
  const [data, setData] = useState<FormattedWorkflowOverview[]>([]);

  const initialState = useMemo(
    () => items.map(WorkflowOverviewFormatter.format),
    [items],
  );

  useEffect(() => {
    setData(initialState);
  }, [initialState]);

  const handleView = useCallback(
    (rowData: FormattedWorkflowOverview) => {
      navigate(
        definitionLink({ workflowId: rowData.id, format: rowData.format }),
      );
    },
    [definitionLink, navigate],
  );

  const handleExecute = useCallback(
    (rowData: FormattedWorkflowOverview) => {
      navigate(executeWorkflowLink({ workflowId: rowData.id }));
    },
    [executeWorkflowLink, navigate],
  );

  const handleEdit = useCallback(
    (rowData: FormattedWorkflowOverview) => {
      navigate(
        editLink({ workflowId: `${rowData.id}`, format: rowData.format }),
      );
    },
    [editLink, navigate],
  );

  const handleDelete = useCallback(
    (rowData: FormattedWorkflowOverview) => {
      // Lazy use of window.confirm vs writing a popup.
      if (
        // eslint-disable-next-line no-alert
        window.confirm(
          `Please confirm you want to delete '${rowData.id}' permanently.`,
        )
      ) {
        orchestratorApi.deleteWorkflowDefinition(rowData.id);
      }
    },
    [orchestratorApi],
  );

  const actions: TableProps<FormattedWorkflowOverview>['actions'] = useMemo(
    () => [
      {
        icon: PlayArrow,
        tooltip: 'Execute',
        onClick: (_, rowData) =>
          handleExecute(rowData as FormattedWorkflowOverview),
      },
      {
        icon: Pageview,
        tooltip: 'View',
        onClick: (_, rowData) =>
          handleView(rowData as FormattedWorkflowOverview),
      },
      {
        icon: Edit,
        tooltip: 'Edit',
        onClick: (_, rowData) =>
          handleEdit(rowData as FormattedWorkflowOverview),
      },
      {
        icon: DeleteForever,
        tooltip: 'Delete',
        onClick: (_, rowData) =>
          handleDelete(rowData as FormattedWorkflowOverview),
      },
    ],
    [handleDelete, handleEdit, handleExecute, handleView],
  );

  const columns = useMemo<TableColumn<FormattedWorkflowOverview>[]>(
    () => [
      { title: 'Name', field: 'name' },
      { title: 'Last run', field: 'lastTriggered' },
      {
        title: 'Last run status',
        render: rowData => (
          <ProcessInstanceStatus status={rowData.lastRunStatus} />
        ),
      },
      { title: 'Type', field: 'type' },
      { title: 'Avg. duration', field: 'avgDuration' },
      { title: 'Description', field: 'description' },
    ],
    [],
  );

  const options = useMemo<TableProps['options']>(
    () => ({
      search: true,
      paging: false,
      actionsColumnIndex: columns.length,
    }),
    [columns.length],
  );

  return (
    <Table<FormattedWorkflowOverview>
      title="Workflows"
      options={options}
      columns={columns}
      data={data}
      actions={actions}
    />
  );
};
