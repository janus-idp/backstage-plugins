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
          icon={<ClusterIcon />}
          label={homeCluster?.name}
        />
      </Tooltip>
      <HelpKiali color="white" />
      <MessageCenter color="white" />
      {kialiState.authentication.session && (
        <div
          style={{
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'space-between',
          }}
        >
          <span style={{ margin: '10px', color: 'white' }}>
            <b>User : </b>
            {kialiState.authentication.session.username || 'anonymous'}
          </span>
        </div>
      )}
    </Header>
  );
};
