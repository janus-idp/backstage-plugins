import React, { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import useAsync from 'react-use/lib/useAsync';

import {
  Progress,
  ResponseErrorPanel,
  Table,
  TableColumn,
} from '@backstage/core-components';
import { useApi, useRouteRef } from '@backstage/core-plugin-api';

import DeleteForever from '@material-ui/icons/DeleteForever';
import Edit from '@material-ui/icons/Edit';
import Pageview from '@material-ui/icons/Pageview';
import PlayArrow from '@material-ui/icons/PlayArrow';

import {
  extractWorkflowFormatFromUri,
  WorkflowItem,
} from '@janus-idp/backstage-plugin-orchestrator-common';

import { orchestratorApiRef } from '../../api';
import {
  editWorkflowRouteRef,
  executeWorkflowRouteRef,
  workflowDefinitionsRouteRef,
} from '../../routes';

type WorkflowsTableProps = {
  items: WorkflowItem[];
};

export const WorkflowsTable = ({ items }: WorkflowsTableProps) => {
  const orchestratorApi = useApi(orchestratorApiRef);

  const navigate = useNavigate();
  const definitionLink = useRouteRef(workflowDefinitionsRouteRef);
  const executeWorkflowLink = useRouteRef(executeWorkflowRouteRef);
  const editLink = useRouteRef(editWorkflowRouteRef);

  interface Row {
    id: string;
    name: string;
    format: string;
  }

  const columns: TableColumn[] = [{ title: 'Name', field: 'name' }];
  const data: Row[] = items.map(item => {
    return {
      id: item.definition.id,
      name: item.definition.name ?? '',
      format: extractWorkflowFormatFromUri(item.uri),
    };
  });

  const doView = useCallback(
    (rowData: Row) => {
      navigate(
        definitionLink({ workflowId: rowData.id, format: rowData.format }),
      );
    },
    [definitionLink, navigate],
  );

  const doExecute = useCallback(
    (rowData: Row) => {
      navigate(executeWorkflowLink({ workflowId: rowData.id }));
    },
    [executeWorkflowLink, navigate],
  );

  const doEdit = useCallback(
    (rowData: Row) => {
      navigate(
        editLink({ workflowId: `${rowData.id}`, format: rowData.format }),
      );
    },
    [editLink, navigate],
  );

  const doDelete = useCallback(
    (rowData: Row) => {
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

  return (
    <Table
      title=""
      options={{ search: true, paging: false, actionsColumnIndex: 1 }}
      columns={columns}
      data={data}
      actions={[
        {
          icon: () => <PlayArrow />,
          tooltip: 'Execute',
          onClick: (_, rowData) => doExecute(rowData as Row),
        },
        {
          icon: () => <Pageview />,
          tooltip: 'View',
          onClick: (_, rowData) => doView(rowData as Row),
        },
        {
          icon: () => <Edit />,
          tooltip: 'Edit',
          onClick: (_, rowData) => doEdit(rowData as Row),
        },
        {
          icon: () => <DeleteForever />,
          tooltip: 'Delete',
          onClick: (_, rowData) => doDelete(rowData as Row),
        },
      ]}
    />
  );
};

export const WorkflowDefinitionsListComponent = () => {
  const orchestratorApi = useApi(orchestratorApiRef);
  const { value, error, loading } = useAsync(async (): Promise<
    WorkflowItem[]
  > => {
    const data = await orchestratorApi.listWorkflows();
    return data.items;
  }, []);

  if (loading) {
    return <Progress />;
  } else if (error) {
    return <ResponseErrorPanel error={error} />;
  }

  return <WorkflowsTable items={value ?? []} />;
};
