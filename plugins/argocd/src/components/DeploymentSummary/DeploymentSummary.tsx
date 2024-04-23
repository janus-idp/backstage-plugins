import React from 'react';

import { Table, TableColumn } from '@backstage/core-components';
import { useEntity } from '@backstage/plugin-catalog-react';

import { IconButton, Link } from '@material-ui/core';
import ExternalLinkIcon from '@patternfly/react-icons/dist/esm/icons/external-link-alt-icon';
import moment from 'moment';

import { useApplications } from '../../hooks/useApplications';
import { useArgocdConfig } from '../../hooks/useArgocdConfig';
import { Application, HealthStatus, SyncStatuses } from '../../types';
import {
  getAppSelector,
  getCommitUrl,
  getProjectName,
} from '../../utils/utils';
import AppSyncStatus from '../AppStatus/AppSyncStatus';
import { AppHealthIcon } from '../AppStatus/StatusIcons';

const DeploymentSummary = () => {
  const { entity } = useEntity();

  const { baseUrl, instances, instanceName, intervalMs } = useArgocdConfig();

  const { apps, loading, error } = useApplications({
    instanceName,
    intervalMs,
    appSelector: encodeURIComponent(getAppSelector(entity)),
    projectName: getProjectName(entity),
  });

  const supportsMultipleArgoInstances = !!instances.length;
  const getBaseUrl = (row: any): string | undefined => {
    if (supportsMultipleArgoInstances && !baseUrl) {
      return instances?.find(
        value => value?.name === row.metadata?.instance?.name,
      )?.url;
    }
    return baseUrl;
  };

  const columns: TableColumn<Application>[] = [
    {
      title: 'ArgoCD App',
      field: 'name',
      render: (row: Application): React.ReactNode =>
        getBaseUrl(row) ? (
          <>
            <Link
              href={`${getBaseUrl(row)}/applications/${row?.metadata?.name}`}
              target="_blank"
              rel="noopener"
            >
              {row.metadata.name}{' '}
              <IconButton color="primary" size="small">
                <ExternalLinkIcon />
              </IconButton>
            </Link>
          </>
        ) : (
          row.metadata.name
        ),
    },
    {
      title: 'Namespace',
      field: 'namespace',
      render: (row: Application): React.ReactNode => {
        return <>{row.spec.destination.namespace}</>;
      },
    },
    {
      title: 'Instance',
      field: 'instance',
      render: (row: Application): React.ReactNode => {
        return <>{row.metadata?.instance.name}</>;
      },
    },
    {
      title: 'Server',
      field: 'server',
      render: (row: Application): React.ReactNode => {
        return <>{row.spec.destination.server}</>;
      },
    },
    {
      title: 'Revision',
      field: 'revision',
      render: (row: Application): React.ReactNode => {
        const historyList = row.status?.history ?? [];
        const latestRev = historyList[historyList.length - 1];
        const commitUrl = getCommitUrl(
          row?.spec?.source?.repoURL,
          latestRev?.revision,
          entity?.metadata?.annotations || {},
        );
        return (
          <Link href={commitUrl} target="_blank" rel="noopener">
            {latestRev?.revision?.substring(0, 7) ?? '-'}
          </Link>
        );
      },
    },

    {
      id: 'test',
      title: 'Last deployed',
      field: 'lastdeployed',
      customSort: (a: Application, b: Application) => {
        const bHistory = b?.status?.history ?? [];
        const bDeployedAt = bHistory?.[bHistory.length - 1]?.deployedAt;

        const aHistory = a?.status?.history ?? [];
        const aDeployedAt = aHistory?.[aHistory.length - 1]?.deployedAt;

        return moment(aDeployedAt).diff(moment(bDeployedAt));
      },
      render: (row: Application): React.ReactNode => {
        const history = row?.status?.history ?? [];
        const finishedAt = history[history.length - 1]?.deployedAt;
        return (
          <>
            {finishedAt
              ? moment(finishedAt).local().format('D/MM/YYYY, H:mm:ss')
              : null}
          </>
        );
      },
    },
    {
      title: 'Sync status',
      field: 'syncstatus',
      customSort: (a: Application, b: Application): number => {
        const syncStatusOrder: String[] = Object.values(SyncStatuses);
        return (
          syncStatusOrder.indexOf(a?.status?.sync?.status) -
          syncStatusOrder.indexOf(b?.status?.sync?.status)
        );
      },
      render: (row: Application): React.ReactNode => (
        <AppSyncStatus app={row} />
      ),
    },
    {
      title: 'Health status',
      field: 'healthstatus',
      customSort: (a: Application, b: Application): number => {
        const healthStatusOrder: String[] = Object.values(HealthStatus);
        return (
          healthStatusOrder.indexOf(a?.status?.health?.status) -
          healthStatusOrder.indexOf(b?.status?.health?.status)
        );
      },
      render: (row: Application): React.ReactNode => (
        <>
          <AppHealthIcon status={row.status.health.status as HealthStatus} />{' '}
          {row?.status?.health?.status}
        </>
      ),
    },
  ];

  return !error ? (
    <Table
      title="Deployment summary"
      options={{
        paging: true,
        search: false,
        draggable: false,
        padding: 'dense',
      }}
      isLoading={loading}
      data={apps as Application[]}
      columns={columns}
    />
  ) : null;
};
export default DeploymentSummary;
