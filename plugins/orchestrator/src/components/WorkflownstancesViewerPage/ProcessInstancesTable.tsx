import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { InfoCard, Table } from '@backstage/core-components';
import {
  useApi,
  useRouteRef,
  useRouteRefParams,
} from '@backstage/core-plugin-api';

import { Button, Typography } from '@material-ui/core';

import { ProcessInstance } from '@janus-idp/backstage-plugin-orchestrator-common';

import { orchestratorApiRef } from '../../api';
import {
  workflowInstanceRouteRef,
  workflowInstancesRouteRef,
} from '../../routes';

interface ProcessInstancesTableProps {
  selectedInstance: ProcessInstance | undefined;
  setSelectedInstance: (instance: ProcessInstance | undefined) => void;
}

type Row = {
  pid: string;
  name: string;
  state: string;
};

const REFRESH_COUNTDOWN_INITIAL_VALUE_IN_SECONDS = 30;

export const ProcessInstancesTable = (props: ProcessInstancesTableProps) => {
  const orchestratorApi = useApi(orchestratorApiRef);
  const { instanceId } = useRouteRefParams(workflowInstanceRouteRef);
  const [data, setData] = useState<Row[]>([]);
  const { selectedInstance, setSelectedInstance } = props;
  const [isLoadingInstances, setIsLoadingInstances] = useState(false);
  const [refreshCountdownInSeconds, setRefreshCountdownInSeconds] = useState(
    REFRESH_COUNTDOWN_INITIAL_VALUE_IN_SECONDS,
  );
  const instanceLink = useRouteRef(workflowInstanceRouteRef);
  const instancesLink = useRouteRef(workflowInstancesRouteRef);

  const navigate = useNavigate();

  const column1 = {
    title: 'Id',
    field: 'pid',
  };

  const column2 = {
    title: 'Name',
    field: 'name',
  };

  const column3 = {
    title: 'State',
    field: 'state',
  };

  const loadInstances = useCallback(async () => {
    try {
      setIsLoadingInstances(true);
      const instances = await orchestratorApi.getInstances();
      const rows: Row[] = instances
        .map(pi => {
          return {
            pid: pi.id,
            name: pi.processId,
            state: pi.state,
          };
        })
        .reverse();
      setData(rows);
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(e);
    } finally {
      setIsLoadingInstances(false);
      setRefreshCountdownInSeconds(REFRESH_COUNTDOWN_INITIAL_VALUE_IN_SECONDS);
    }
  }, [orchestratorApi]);

  useEffect(() => {
    loadInstances();
  }, [loadInstances]);

  const loadInstance = useCallback(
    (pid: string | undefined) => {
      if (pid) {
        orchestratorApi.getInstance(pid).then(value => {
          setSelectedInstance(value);
          navigate(instanceLink({ instanceId: pid }), { replace: true });
        });
      }
    },
    [orchestratorApi, navigate, instanceLink, setSelectedInstance],
  );

  useEffect(() => {
    if (!instanceId) {
      setSelectedInstance(undefined);
    }

    const selectedRowData = data.find(d => d.pid === instanceId);
    if (!selectedRowData) {
      return;
    }

    loadInstance(selectedRowData.pid);
  }, [
    loadInstance,
    data,
    instanceId,
    setSelectedInstance,
    navigate,
    instancesLink,
  ]);

  useEffect(() => {
    if (instanceId) {
      return;
    }
    navigate(instancesLink(), { replace: true });
  }, [instanceId, instancesLink, navigate]);

  useEffect(() => {
    if (!selectedInstance || !data.length) {
      return undefined;
    }

    const updatedItem = data.find(pi => pi.pid === selectedInstance.id);
    if (!updatedItem) {
      return undefined;
    }

    if (selectedInstance.state !== updatedItem.state) {
      setSelectedInstance(undefined);
      loadInstance(updatedItem.pid);
    }

    return () => {
      setRefreshCountdownInSeconds(REFRESH_COUNTDOWN_INITIAL_VALUE_IN_SECONDS);
    };
  }, [data, loadInstance, selectedInstance, setSelectedInstance]);

  useEffect(() => {
    if (isLoadingInstances) {
      return undefined;
    }

    const interval = window.setInterval(() => {
      setRefreshCountdownInSeconds(prev => prev - 1);
    }, 1000);

    return () => {
      window.clearInterval(interval);
    };
  }, [isLoadingInstances]);

  useEffect(() => {
    if (refreshCountdownInSeconds > 0) {
      return;
    }

    loadInstances();
  }, [loadInstances, refreshCountdownInSeconds]);

  return (
    <InfoCard
      title=" "
      action={
        <Button
          variant="outlined"
          style={{ marginTop: 8, marginRight: 8 }}
          disabled={isLoadingInstances}
          onClick={() => loadInstances()}
        >
          Refresh
        </Button>
      }
    >
      <div style={{ height: '500px', padding: '10px' }}>
        <Table<Row>
          data={data}
          columns={[column1, column2, column3]}
          isLoading={isLoadingInstances}
          onRowClick={(_, rowData) => {
            if (rowData && rowData.pid !== selectedInstance?.id) {
              loadInstance(rowData.pid);
            }
          }}
          options={{
            padding: 'dense',
            paging: true,
            pageSize: 8,
            rowStyle: (rowData: Row) => {
              return rowData.pid === selectedInstance?.id
                ? { backgroundColor: '#a266e5' }
                : {};
            },
          }}
        />
        {!isLoadingInstances && (
          <Typography
            variant="caption"
            style={{ marginTop: '6px', float: 'right' }}
          >
            <i>Auto refreshing in {refreshCountdownInSeconds} seconds</i>
          </Typography>
        )}
      </div>
    </InfoCard>
  );
};
