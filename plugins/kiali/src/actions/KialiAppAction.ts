import { GraphAction } from './GraphActions';
import { GraphToolbarAction } from './GraphToolbarActions';
import { HelpDropdownAction } from './HelpDropdownActions';
import { IstioCertsInfoAction } from './IstioCertsInfoActions';
import { IstioStatusAction } from './IstioStatusActions';
import { LoginAction } from './LoginActions';
import { MeshTlsAction } from './MeshTlsActions';
import { TracingAction } from './TracingActions';
import { MessageCenterAction } from './MessageCenterActions';
import { NamespaceAction } from './NamespaceAction';
import { UserSettingsAction } from './UserSettingsActions';
import { TourAction } from './TourActions';

export type KialiAppAction =
  | GraphAction
  | GraphToolbarAction
  | HelpDropdownAction
  | IstioCertsInfoAction
  | IstioStatusAction
  | TracingAction
  | LoginAction
  | MeshTlsAction
  | MessageCenterAction
  | NamespaceAction
  | TourAction
  | UserSettingsAction;
