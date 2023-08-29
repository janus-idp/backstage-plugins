import { createElement } from 'react';

import SvgIcon from '@material-ui/core/SvgIcon';
import CheckCircleRounded from '@material-ui/icons/CheckCircleRounded';
import ErrorRounded from '@material-ui/icons/ErrorRounded';
import InfoOutlined from '@material-ui/icons/InfoOutlined';
import RemoveCircleRounded from '@material-ui/icons/RemoveCircleRounded';
import ReportProblemRounded from '@material-ui/icons/ReportProblemRounded';
import WarningRounded from '@material-ui/icons/WarningRounded';

type SvgIconComponent = typeof SvgIcon;

export const Colors = {
  error: 'error',
  info: 'primary',
  ok: 'green',
  warning: 'rgb(255, 152, 0)',
};
export type ComponentIcon = {
  props: { [key: string]: any };
  icon: SvgIconComponent;
};

export const ErrorCoreComponent: ComponentIcon = {
  props: { color: Colors.error },
  icon: ErrorRounded,
};

export const ErrorAddonComponent: ComponentIcon = {
  props: { htmlColor: Colors.warning },
  icon: ReportProblemRounded,
};

export const NotReadyComponent: ComponentIcon = {
  props: { color: Colors.info },
  icon: RemoveCircleRounded,
};

export const WarningIcon: ComponentIcon = {
  props: { htmlColor: Colors.warning },
  icon: WarningRounded,
};

export const InfoIcon: ComponentIcon = {
  props: { color: Colors.info },
  icon: InfoOutlined,
};

export const OkIcon: ComponentIcon = {
  props: { htmlColor: Colors.ok },
  icon: CheckCircleRounded,
};

export const SuccessComponent = OkIcon;
export const ErrorIcon = ErrorCoreComponent;

export const createIcon = (
  icon: ComponentIcon,
  extraProp?: { [key: string]: string },
) => {
  let iconProps = icon.props;
  if (extraProp) {
    iconProps = { ...iconProps, ...extraProp };
  }
  return createElement(icon.icon, iconProps);
};

export * from './MTLSStatusFull';
export * from './MTLSStatusPartial';
