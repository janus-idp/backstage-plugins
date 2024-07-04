import React from 'react';

import { Header } from '@backstage/core-components';

import { Chip, Tooltip } from '@material-ui/core';
import { ClusterIcon } from '@patternfly/react-icons';

import { MessageCenter } from '../../../components/MessageCenter/MessageCenter';
import { homeCluster } from '../../../config';
import { KialiAppState, KialiContext } from '../../../store';
import { HelpKiali } from './HelpKiali';
import { NamespaceSelector } from './NamespaceSelector';

export const KialiHeader = () => {
  const kialiState = React.useContext(KialiContext) as KialiAppState;

  return (
    <Header title="Kiali" subtitle={<NamespaceSelector page />}>
      <Tooltip
        title={<div>Kiali home cluster: {homeCluster?.name}</div>}
        style={{ marginTop: '10px' }}
      >
        <Chip
          color="primary"
          variant="outlined"
          icon={<ClusterIcon />}
          label={homeCluster?.name}
          data-test="home-cluster"
        />
      </Tooltip>
      <HelpKiali />
      <MessageCenter />
      {kialiState.authentication.session && (
        <div
          style={{
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'space-between',
          }}
          data-test="user"
        >
          <span style={{ margin: '10px' }}>
            <b>User : </b>
            {kialiState.authentication.session.username || 'anonymous'}
          </span>
        </div>
      )}
    </Header>
  );
};
