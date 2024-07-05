// @ts-nocheck
import React from 'react';

import BlockIcon from '@material-ui/icons/Block';
import BuildIcon from '@material-ui/icons/Build';
import CodeIcon from '@material-ui/icons/Code';
import CompareArrowsIcon from '@material-ui/icons/CompareArrows';
import FilterNoneIcon from '@material-ui/icons/FilterNone';
import ImportantDevicesIcon from '@material-ui/icons/ImportantDevices';
import LanguageIcon from '@material-ui/icons/Language';
import LockIcon from '@material-ui/icons/Lock';
import OfflineBoltIcon from '@material-ui/icons/OfflineBolt';
import PlayCircleOutlineIcon from '@material-ui/icons/PlayCircleOutline';
import ScheduleIcon from '@material-ui/icons/Schedule';
import SecurityIcon from '@material-ui/icons/Security';
import ShareIcon from '@material-ui/icons/Share';

import hollowPinIcon from '../assets/img/hollow-pin.png';
import solidPinIcon from '../assets/img/solid-pin.png';

export { solidPinIcon, hollowPinIcon };

export type IconType = {
  ascii?: string;
  className: string;
  color?: string;
  icon: React.ComponentClass<any, any>;
  name: string;
  text: string;
  type: string;
};

// The unicode values in the ascii fields come from:
// https://www.patternfly.org/v3/styles/icons/index.html
// or from the font awesome site: https://fontawesome.com/icons
const mutIcons = {
  istio: {
    circuitBreaker: {
      ascii: '\uf0e7 ',
      className: 'fa fa-bolt',
      icon: OfflineBoltIcon,
      name: 'bolt',
      text: 'Circuit Breaker',
      type: 'fa',
    } as IconType,
    missingLabel: {
      ascii: '\uE932',
      className: 'fa fa-wrench',
      color: 'red',
      icon: BuildIcon,
      name: 'wrench',
      text: 'Missing Label',
      type: 'fa',
    } as IconType,
    faultInjection: {
      ascii: '\uf05e ',
      className: 'fa fa-ban',
      icon: BlockIcon,
      name: 'ban',
      text: 'Fault Injection',
      type: 'fa',
    } as IconType,
    gateway: {
      className: 'pf-icon pf-icon-globe-route',
      icon: LanguageIcon,
      name: 'globe-route',
      text: 'Gateway',
      type: 'pf',
    } as IconType,
    mirroring: {
      className: 'pf-icon pf-icon-migration',
      icon: CompareArrowsIcon,
      name: 'migration',
      text: 'Mirroring',
      type: 'pf',
    } as IconType,
    missingAuthPolicy: {
      ascii: '\ue946 ',
      className: 'pf-icon pf-icon-security',
      color: 'red',
      icon: SecurityIcon,
      name: 'security',
      text: 'Missing Auth Policy',
      type: 'pf',
    } as IconType,
    missingSidecar: {
      ascii: '\ue915 ',
      className: 'pf-icon pf-icon-blueprint',
      color: 'red',
      icon: FilterNoneIcon,
      name: 'blueprint',
      text: 'Missing Sidecar',
      type: 'pf',
    } as IconType,
    mtls: {
      ascii: '\ue923 ',
      className: 'pf-icon pf-icon-locked',
      icon: LockIcon,
      name: 'locked',
      text: 'mTLS',
      type: 'pf',
    } as IconType,
    requestRouting: {
      ascii: '\uf126 ',
      className: 'fa fa-code-branch',
      icon: CodeIcon,
      name: 'code-fork',
      text: 'Request Routing',
      type: 'fa',
    } as IconType,
    requestTimeout: {
      ascii: '\uf017 ',
      className: 'fa fa-clock',
      icon: ScheduleIcon,
      name: 'clock',
      text: 'request Timeout',
      type: 'fa',
    },
    root: {
      ascii: '\uf35a ',
      className: 'fa fa-arrow-alt-circle-right',
      icon: PlayCircleOutlineIcon,
      name: 'arrow-alt-circle-right',
      text: 'Traffic Source',
      type: 'fa',
    } as IconType,
    trafficShifting: {
      ascii: '\uf1e0 ',
      className: 'fa fa-share-alt',
      icon: ShareIcon,
      name: 'share-alt',
      text: 'Traffic Shifting',
      type: 'fa',
    } as IconType,
    virtualService: {
      ascii: '\uf126 ',
      className: 'fa fa-code-branch',
      icon: CodeIcon,
      name: 'code-fork',
      text: 'Virtual Service',
      type: 'fa',
    } as IconType,
    workloadEntry: {
      ascii: '\uf126 ',
      className: 'pf-icon pf-icon-virtual-machine',
      icon: ImportantDevicesIcon,
      name: 'virtual-machine',
      text: 'Workload Entry',
      type: 'pf',
    } as IconType,
  },
};

export const icons = mutIcons as typeof mutIcons;
