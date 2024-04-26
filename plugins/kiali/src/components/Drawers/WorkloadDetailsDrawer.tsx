import * as React from 'react';
import { useAsyncFn, useDebounce } from 'react-use';

import { useApi } from '@backstage/core-plugin-api';

import { CircularProgress } from '@material-ui/core';

import { WorkloadInfo } from '../../pages/WorkloadDetails/WorkloadInfo';
import { kialiApiRef } from '../../services/Api';
import { WorkloadHealth } from '../../types/Health';
import { ENTITY } from '../../types/types';
import { Workload, WorkloadQuery } from '../../types/Workload';

type Props = {
  namespace: string;
  workload: string;
};
export const WorkloadDetailsDrawer = (props: Props) => {
  const kialiClient = useApi(kialiApiRef);
  const [workloadItem, setWorkloadItem] = React.useState<Workload>();
  const [health, setHealth] = React.useState<WorkloadHealth>();

  const fetchWorkload = async () => {
    const query: WorkloadQuery = {
      health: 'true',
      rateInterval: `60s`,
      validate: 'false',
    };

    kialiClient
      .getWorkload(
        props.namespace ? props.namespace : '',
        props.workload ? props.workload : '',
        query,
      )
      .then((workloadResponse: Workload) => {
        setWorkloadItem(workloadResponse);

        const wkHealth = WorkloadHealth.fromJson(
          props.namespace ? props.namespace : '',
          workloadResponse.name,
          workloadResponse.health,
          {
            rateInterval: 60,
            hasSidecar: workloadResponse.istioSidecar,
            hasAmbient: workloadResponse.istioAmbient,
          },
        );
        setHealth(wkHealth);
      })
      .catch(err => {
        // eslint-disable-next-line no-console
        console.log(err);
      });
  };

  const [{ loading }, refresh] = useAsyncFn(
    async () => {
      // Check if the config is loaded
      await fetchWorkload();
    },
    [],
    { loading: true },
  );
  useDebounce(refresh, 10);

  if (loading) {
    return <CircularProgress />;
  }

  return (
    <>
      {workloadItem && (
        <WorkloadInfo
          workload={workloadItem}
          duration={60}
          namespace={props.namespace}
          health={health}
          view={ENTITY}
        />
      )}
    </>
  );
};
