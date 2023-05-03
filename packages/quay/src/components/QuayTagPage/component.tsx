import React from 'react';
import { useRepository, useTagDetails } from '../../hooks';
import { useParams } from 'react-router-dom';
import { QuayTagDetails } from '../QuayTagDetails';
import { ErrorPanel, Progress } from '@backstage/core-components';
import { useRouteRef } from '@backstage/core-plugin-api';
import { rootRouteRef } from '../../routes';

type QuayTagPageProps = Record<never, string>;

export const QuayTagPage: React.FC<QuayTagPageProps> = () => {
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

  return (
    <QuayTagDetails
      rootLink={rootLink}
      layer={value.data.Layer}
      digest={digest}
    />
  );
};

export default QuayTagPage;
