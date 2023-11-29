import React from 'react';

import { ErrorPanel, InfoCard } from '@backstage/core-components';

type WrapperInfoCardProps = {
  error?: Error;
  selectors?: React.ReactNode;
};

export const WrapperInfoCard = ({
  children,
  error,
  selectors,
}: React.PropsWithChildren<WrapperInfoCardProps>) => (
  <>
    {error && <ErrorPanel error={error} />}
    <InfoCard
      headerStyle={{ height: '5rem' }}
      noPadding
      {...(selectors && {
        title: selectors,
      })}
    >
      {children}
    </InfoCard>
  </>
);
