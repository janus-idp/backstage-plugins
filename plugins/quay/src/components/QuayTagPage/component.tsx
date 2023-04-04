import React from 'react';
import { useRepository, useTagDetails } from '../../hooks';
import { useParams } from 'react-router';
import { QuayTagDetails } from '../QuayTagDetails';
import { ErrorPanel } from '@backstage/core-components';
// import { QuayTagDetails } from '../QuayTagDetails';

type QuayTagPageProps = Record<never, string>;

// TODO: replace useAsync with tanstack query
export const QuayTagPage: React.FC<QuayTagPageProps> = () => {
  const { repository, organization } = useRepository();
  const { digest } = useParams();
  if (!digest) {
    throw new Error('digest is not defined');
  }
  const { loading, value } = useTagDetails(organization, repository, digest);
  if (loading) {
    return <div>loading...</div>;
  }
  if (!value || !value.data) {
    return <ErrorPanel error={new Error('no digest')} />;
  }

  return <QuayTagDetails layer={value.data.Layer} />;
};

export default QuayTagPage;
