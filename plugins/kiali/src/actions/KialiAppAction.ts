import { HelpDropdownAction } from './HelpDropdownActions';
import { IstioCertsInfoAction } from './IstioCertsInfoActions';
import { IstioStatusAction } from './IstioStatusActions';
import { LoginAction } from './LoginActions';
import { MeshTlsAction } from './MeshTlsActions';
import { MessageCenterAction } from './MessageCenterActions';
import { NamespaceAction } from './NamespaceAction';
import { UserSettingsAction } from './UserSettingsActions';

export type KialiAppAction =
  | HelpDropdownAction
  | LoginAction
  | NamespaceAction
  | UserSettingsAction
  | IstioCertsInfoAction
  | IstioStatusAction
  | MeshTlsAction
  | MessageCenterAction;
