import React from 'react';

import { Chip, Grid, Tooltip } from '@material-ui/core';
import { ClusterIcon } from '@patternfly/react-icons';

import { MessageCenter } from '../../../components/MessageCenter/MessageCenter';
import { homeCluster } from '../../../config';
import { KialiAppState, KialiContext } from '../../../store';
import { HelpKiali } from './HelpKiali';
import { NamespaceSelector } from './NamespaceSelector';

export const KialiHeaderEntity = () => {
  const kialiState = React.useContext(KialiContext) as KialiAppState;

  return (
    <div style={{ marginLeft: '20px' }}>
      <Grid container spacing={0}>
        <Grid item xs={5}>
          <NamespaceSelector />
        </Grid>
        <Grid item xs={6}>
          <div
            style={{
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'right',
            }}
          >
            <Tooltip title={<div>Kiali home cluster: {homeCluster?.name}</div>}>
              <Chip
                color="primary"
                icon={<ClusterIcon />}
                label={homeCluster?.name}
              />
            </Tooltip>
            <HelpKiali />
            <MessageCenter />
          </div>
        </Grid>
        {kialiState.authentication.session && (
          <Grid item xs={1} style={{ marginTop: '5px' }}>
            <div
              style={{
                display: 'flex',
                flexDirection: 'row',
                justifyContent: 'space-between',
              }}
            >
              <span>
                <b>User : </b>
                {kialiState.authentication.session.username || 'anonymous'}
              </span>
            </div>
          </Grid>
        )}
      </Grid>
    </div>
  );
};
