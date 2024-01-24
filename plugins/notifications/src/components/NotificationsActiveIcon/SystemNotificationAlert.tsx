import React from 'react';

import { useRouteRef } from '@backstage/core-plugin-api';

import { IconButton, Link, makeStyles, Snackbar } from '@material-ui/core';
import CloseIcon from '@material-ui/icons/Close';

import { notificationsRootRouteRef } from '../../routes';

const useStyles = makeStyles(_theme => ({
  systemAlertAction: {
    marginRight: '1rem',
  },
}));

export type SystemNotificationAlertProps = {
  message: string;
  onCloseNotification: () => void;
};

export const SystemNotificationAlert = ({
  message,
  onCloseNotification,
}: SystemNotificationAlertProps) => {
  const styles = useStyles();
  const notificationsRoute = useRouteRef(notificationsRootRouteRef);

  return (
    <Snackbar
      anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      open
      message={message}
      action={
        <>
          <Link
            href={`${notificationsRoute()}/updates`}
            className={styles.systemAlertAction}
          >
            Show
          </Link>
          <IconButton
            size="small"
            aria-label="close"
            color="inherit"
            onClick={onCloseNotification}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </>
      }
    />
  );
};
