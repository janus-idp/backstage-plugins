import React, { useContext, useEffect } from 'react';
import ToastContext from '../../context/toast';
import { ContentHeader, SupportButton, Tabs } from '@backstage/core-components';
import { Typography } from '@material-ui/core';
import { ParodosPage } from '../ParodosPage';

export const Notification = () => {
  const toastContext = useContext(ToastContext);
  useEffect(() => {
    toastContext.handleOpenToast(
      `Oops! Something went wrong. Please try again`,
    );
  }, [toastContext]);

  return (
    <ParodosPage>
      <ContentHeader title="Notification">
        <SupportButton title="Need help?">Lorem Ipsum</SupportButton>
      </ContentHeader>
      <Typography paragraph>Check and update notifications</Typography>
      <Tabs
        tabs={[
          {
            label: `RECENT`,
            content: <div>recent</div>,
          },
          {
            label: `HISTORY`,
            content: <div>history</div>,
          },
        ]}
      />
    </ParodosPage>
  );
};
