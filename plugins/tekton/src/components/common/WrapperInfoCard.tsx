import React from 'react';

import { BottomLinkProps, InfoCard } from '@backstage/core-components';

import { ClusterErrors } from '../../types/types';
import { ClusterSelector, ErrorPanel } from '../common';

type WrapperInfoCardProps = {
  title: string;
  allErrors?: ClusterErrors;
  footerLink?: BottomLinkProps;
  showClusterSelector?: boolean;
};

export const WrapperInfoCard = ({
  children,
  allErrors,
  footerLink,
  title,
  showClusterSelector = true,
}: React.PropsWithChildren<WrapperInfoCardProps>) => (
  <>
    {allErrors && allErrors.length > 0 && <ErrorPanel allErrors={allErrors} />}
    <InfoCard
      title={title}
      {...(showClusterSelector && { subheader: <ClusterSelector /> })}
      deepLink={footerLink}
    >
      {children}
    </InfoCard>
  </>
);

export default WrapperInfoCard;
