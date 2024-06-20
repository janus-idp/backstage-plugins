import * as React from 'react';

import { DismissableBanner, WarningIcon } from '@backstage/core-components';

type DismissableBannerProps = {
  message: React.ReactElement;
  variant: 'info' | 'warning' | 'error';
  fixed: boolean;
};

const defaultProps: DismissableBannerProps = {
  message: (
    <>
      <WarningIcon /> This is a tech preview feature
    </>
  ),
  variant: 'warning',
  fixed: false,
};

export const TechPreviewWarning = () => {
  return (
    <div>
      <DismissableBanner {...defaultProps} id="default_dismissable" />
    </div>
  );
};
