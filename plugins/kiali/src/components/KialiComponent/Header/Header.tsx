import React from 'react';

import { ContentHeader } from '@backstage/core-components';

import { Chip, Drawer, IconButton, Tooltip } from '@material-ui/core';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import Info from '@material-ui/icons/Info';
import StorageRounded from '@material-ui/icons/StorageRounded';

import {
  KialiConfigT,
  KialiInfo,
} from '@janus-idp/backstage-plugin-kiali-common';

import { getHomeCluster } from '../../../helper';
import { StatusContent } from './StatusContent';

const useDrawerStyles = makeStyles((theme: Theme) =>
  createStyles({
    paper: {
      width: '50%',
      justifyContent: 'space-between',
      padding: theme.spacing(2.5),
    },
  }),
);

export const KialiHeader = (props: {
  title: string;
  kialiStatus: KialiInfo;
  config: KialiConfigT;
}) => {
  const [isOpen, toggleDrawer] = React.useState<boolean>(false);
  const kialiHomeCluster = getHomeCluster(props.config.server);
  const classes = useDrawerStyles();
  return (
    <ContentHeader title={props.title}>
      {props.config.username && (
        <div
          style={{
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'space-between',
          }}
        >
          <span style={{ margin: '10px' }}>
            <b>User : </b>
            {props.config.username}
          </span>
        </div>
      )}
      {kialiHomeCluster && (
        <Tooltip
          title={<div>Kiali home cluster: {kialiHomeCluster?.name}</div>}
        >
          <Chip icon={<StorageRounded />} label={kialiHomeCluster?.name} />
        </Tooltip>
      )}
      <Tooltip title="Show Kiali information">
        <IconButton
          aria-label="info"
          onClick={() => toggleDrawer(true)}
          style={{ marginTop: '-10px' }}
        >
          <Info />
        </IconButton>
      </Tooltip>
      <Drawer
        classes={{
          paper: classes.paper,
        }}
        variant="persistent"
        anchor="right"
        open={isOpen}
        onClose={() => toggleDrawer(false)}
      >
        <StatusContent
          toggleDrawer={toggleDrawer}
          kialiStatus={props.kialiStatus}
          config={props.config}
        />
      </Drawer>
    </ContentHeader>
  );
};
