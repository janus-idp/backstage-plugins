import React from 'react';
import { useParams } from 'react-router-dom';

import { ErrorPanel, Progress } from '@backstage/core-components';
import { useRouteRef } from '@backstage/core-plugin-api';

import { useRepository, useTagDetails } from '../../hooks';
import { rootRouteRef } from '../../routes';
import { QuayTagDetails } from '../QuayTagDetails';

export const QuayTagPage = () => {
  const rootLink = useRouteRef(rootRouteRef);
  const { repository, organization } = useRepository();
  const { digest } = useParams();
  if (!digest) {
    throw new Error('digest is not defined');
  }
  const { loading, value } = useTagDetails(organization, repository, digest);
  if (loading) {
    return <Progress variant="query" />;
  }
  if (!value || !value.data) {
    return <ErrorPanel error={new Error('no digest')} />;
  }

  return <QuayTagDetails rootLink={rootLink} layer={value.data.Layer} digest={digest} />;
};

export default QuayTagPage;
