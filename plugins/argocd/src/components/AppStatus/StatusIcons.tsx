import React from 'react';

import { createStyles, makeStyles, Theme } from '@material-ui/core';
import ArrowCircleUpIcon from '@mui/icons-material/ArrowCircleUp';
import HeartIcon from '@mui/icons-material/Favorite';
import HeartBrokenIcon from '@mui/icons-material/HeartBroken';
import PauseCircleIcon from '@mui/icons-material/PauseCircleOutlineOutlined';

import { Status } from '@janus-idp/shared-react';

import { HealthStatus, SyncStatusCode, SyncStatuses } from '../../types';
import GhostIcon from '../Icons/GhostIcon';

const useIconStyles = makeStyles<Theme>(theme =>
  createStyles({
    icon: {
      marginRight: theme.spacing(0.6),
      height: '0.8em',
      width: '0.8em',
      top: '0.125em',
      position: 'relative',
      flexShrink: 0,
    },
    bsIcon: {
      marginLeft: theme.spacing(0.6),
      marginBottom: '7px',
      marginRight: theme.spacing(0.6),
      width: '0.8em',
    },
    iconOnly: {
      marginLeft: theme.spacing(0.6),
      height: '0.8em',
      width: '0.8em',
      top: '0',
      position: 'relative',
      flexShrink: 0,
    },
    'icon-spin': {
      animation: '$spin-animation 0.5s infinite',
      display: 'inline-block',
    },

    '@keyframes spin-animation': {
      '0%': {
        transform: 'rotate(0deg)',
      },
      '100%': {
        transform: 'rotate(359deg)',
      },
    },
  }),
);
export const SyncIcon = ({
  status,
  iconOnly,
}: {
  status: SyncStatusCode;
  iconOnly?: boolean;
}): React.ReactNode => {
  const classes = useIconStyles();
  switch (status) {
    case SyncStatuses.Synced:
      return (
        <Status
          status={SyncStatuses.Synced}
          dataTestId="synced-icon"
          iconOnly={iconOnly}
          iconClassNames={iconOnly ? classes.bsIcon : ''}
        />
      );
    case SyncStatuses.OutOfSync:
      return (
        <>
          <ArrowCircleUpIcon
            data-testid="outofsync-icon"
            className={iconOnly ? classes.iconOnly : classes.icon}
            style={{
              color: '#f4c030',
            }}
          />
          {!iconOnly && status}
        </>
      );
    case SyncStatuses.Unknown:
      return (
        <Status
          status="Running"
          dataTestId="unknown-icon"
          iconOnly={iconOnly}
          iconClassNames={iconOnly ? classes.bsIcon : ''}
        />
      );
    default:
      return null;
  }
};

export const AppHealthIcon = ({
  status,
  iconOnly,
}: {
  status: HealthStatus;
  iconOnly?: boolean;
}): React.ReactNode => {
  const classes = useIconStyles();

  switch (status) {
    case HealthStatus.Healthy:
      return (
        <>
          <HeartIcon
            data-testid="healthy-icon"
            className={iconOnly ? classes.iconOnly : classes.icon}
            style={{ color: 'green' }}
          />
          {!iconOnly && status}
        </>
      );
    case HealthStatus.Suspended:
      return (
        <>
          <PauseCircleIcon
            data-testid="suspended-icon"
            className={iconOnly ? classes.iconOnly : classes.icon}
            style={{ color: '#766f94' }}
          />
          {!iconOnly && status}
        </>
      );
    case HealthStatus.Degraded:
      return (
        <>
          <HeartBrokenIcon
            data-testid="degraded-icon"
            className={iconOnly ? classes.iconOnly : classes.icon}
            style={{ color: '#E96D76' }}
          />
          {!iconOnly && status}
        </>
      );
    case HealthStatus.Progressing:
      return (
        <Status
          status={HealthStatus.Progressing}
          iconOnly={iconOnly}
          iconClassNames={iconOnly ? classes.bsIcon : ''}
          dataTestId="progressing-icon"
        />
      );
    case HealthStatus.Missing:
      return (
        <>
          <GhostIcon
            dataTestId="missing-icon"
            className={iconOnly ? classes.iconOnly : classes.icon}
          />
          {!iconOnly && status}
        </>
      );
    default:
      return (
        <>
          <Status
            status="Unknown"
            iconStyles={{ color: 'green' }}
            iconOnly={iconOnly}
            iconClassNames={iconOnly ? classes.bsIcon : ''}
            dataTestId="unknown-icon"
          />
          {!iconOnly && status}
        </>
      );
  }
};
