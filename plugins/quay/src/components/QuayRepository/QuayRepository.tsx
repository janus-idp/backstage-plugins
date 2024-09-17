import React from 'react';

import { Link, Progress, Table } from '@backstage/core-components';
import { configApiRef, useApi } from '@backstage/core-plugin-api';

import { useRepository, useTags } from '../../hooks';
import { useQuayViewPermission } from '../../hooks/useQuayViewPermission';
import PermissionAlert from '../PermissionAlert/PermissionAlert';
import { columns, useStyles } from './tableHeading';

type QuayRepositoryProps = Record<never, any>;

export function QuayRepository(_props: QuayRepositoryProps) {
  const { repository, organization } = useRepository();
  const classes = useStyles();
  const configApi = useApi(configApiRef);
  const quayUiUrl = configApi.getOptionalString('quay.uiUrl');

  const hasViewPermission = useQuayViewPermission();

  const title = quayUiUrl ? (
    <>
      {`Quay repository: `}
      <Link
        to={`${quayUiUrl}/repository/${organization}/${repository}`}
      >{`${organization}/${repository}`}</Link>
    </>
  ) : (
    `Quay repository: ${organization}/${repository}`
  );
  const { loading, data } = useTags(organization, repository);

  if (!hasViewPermission) {
    return <PermissionAlert />;
  }

  if (loading) {
    return (
      <div data-testid="quay-repo-progress">
        <Progress />
      </div>
    );
  }

  return (
    <div data-testid="quay-repo-table">
      <Table
        title={title}
        options={{ sorting: true, paging: true, padding: 'dense' }}
        data={data}
        columns={columns}
        emptyContent={
          <div data-testid="quay-repo-table-empty" className={classes.empty}>
            There are no images available.
          </div>
        }
      />
    </div>
  );
}
