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
        <Grid item xs={9}>
          <NamespaceSelector />
        </Grid>
        <Grid item xs>
          <Tooltip title={<div>Kiali home cluster: {homeCluster?.name}</div>}>
            <Chip
              color="primary"
              icon={<ClusterIcon />}
              label={homeCluster?.name}
            />
          </Tooltip>
          <HelpKiali />
          <MessageCenter />
        </Grid>
        {kialiState.authentication.session && (
          <Grid item xs>
            <div
              style={{
                display: 'flex',
                flexDirection: 'row',
                justifyContent: 'space-between',
              }}
            >
              <span style={{ margin: '10px' }}>
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
