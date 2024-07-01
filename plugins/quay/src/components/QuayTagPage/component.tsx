import React from 'react';
import { useParams } from 'react-router-dom';

import { ErrorPanel, Progress } from '@backstage/core-components';
import { useRouteRef } from '@backstage/core-plugin-api';

import { useRepository, useTagDetails } from '../../hooks';
import { useQuayViewPermission } from '../../hooks/useQuayViewPermission';
import { rootRouteRef } from '../../routes';
import PermissionAlert from '../PermissionAlert/PermissionAlert';
import { QuayTagDetails } from '../QuayTagDetails';

export const QuayTagPage = () => {
  const rootLink = useRouteRef(rootRouteRef);
  const { repository, organization } = useRepository();
  const { digest } = useParams();
  const hasViewPermission = useQuayViewPermission();
  if (!digest) {
    throw new Error('digest is not defined');
  }
  const { loading, value } = useTagDetails(organization, repository, digest);

  if (!hasViewPermission) {
    return <PermissionAlert />;
  }

  if (loading) {
    return (
      <div data-testid="quay-tag-page-progress">
        <Progress variant="query" />
      </div>
    );
  }
  if (!value?.data) {
    return <ErrorPanel error={new Error('no digest')} />;
  }

  return (
    <QuayTagDetails
      rootLink={rootLink}
      layer={value.data.Layer}
      digest={digest}
    />
  );
};

export default QuayTagPage;
