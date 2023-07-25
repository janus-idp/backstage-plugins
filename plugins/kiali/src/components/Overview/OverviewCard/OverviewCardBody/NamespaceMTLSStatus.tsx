import React from 'react';

import { Tooltip } from '@material-ui/core';

import { MTLSStatuses } from '@janus-idp/backstage-plugin-kiali-common';

import {
  MTLSStatusFull,
  MTLSStatusFullDark,
  MTLSStatusPartial,
  MTLSStatusPartialDark,
} from '../../../Icons';

type NamespaceMTLSStatusProps = {
  status: string;
};

enum MTLSIconTypes {
  LOCK_FULL = 'LOCK_FULL',
  LOCK_HOLLOW = 'LOCK_HOLLOW',
  LOCK_FULL_DARK = 'LOCK_FULL_DARK',
  LOCK_HOLLOW_DARK = 'LOCK_HOLLOW_DARK',
}

const emptyDescriptor = {
  message: '',
  icon: '',
  showStatus: false,
};

type StatusDescriptor = {
  message: string;
  icon: string;
  showStatus: boolean;
};

const statusDescriptors = new Map<string, StatusDescriptor>([
  [
    MTLSStatuses.ENABLED,
    {
      message: 'mTLS is enabled for this namespace',
      icon: MTLSIconTypes.LOCK_FULL_DARK,
      showStatus: true,
    },
  ],
  [
    MTLSStatuses.ENABLED_EXTENDED,
    {
      message:
        'mTLS is enabled for this namespace, extended from Mesh-wide config',
      icon: MTLSIconTypes.LOCK_FULL_DARK,
      showStatus: true,
    },
  ],
  [
    MTLSStatuses.PARTIALLY,
    {
      message: 'mTLS is partially enabled for this namespace',
      icon: MTLSIconTypes.LOCK_HOLLOW_DARK,
      showStatus: true,
    },
  ],
  [MTLSStatuses.DISABLED, emptyDescriptor],
  [MTLSStatuses.NOT_ENABLED, emptyDescriptor],
]);

const nameToSource: { [key: string]: JSX.Element } = {
  LOCK_FULL: <MTLSStatusFull />,
  LOCK_HOLLOW: <MTLSStatusFullDark />,
  LOCK_FULL_DARK: <MTLSStatusPartial />,
  LOCK_HOLLOW_DARK: <MTLSStatusPartialDark />,
};

export const NamespaceMTLSStatus = (props: NamespaceMTLSStatusProps) => {
  const stat = statusDescriptors.get(props.status) || emptyDescriptor;

  return (
    <Tooltip aria-label="mTLS status" title={stat.message} placement="right">
      <>{nameToSource[stat.icon]}</>
    </Tooltip>
  );
};
