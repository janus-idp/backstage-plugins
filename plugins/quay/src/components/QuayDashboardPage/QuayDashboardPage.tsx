import React from 'react';
import { QuayRepository } from '../QuayRepository';
import { useRepository } from '../../hooks';

export const QuayDashboardPage = () => {
  const { repository, organization } = useRepository();

  return (
    <QuayRepository
      organization={organization}
      repository={repository}
      widget={false}
    />
  );
};
