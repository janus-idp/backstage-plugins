import { KialiAppAction } from '../actions/KialiAppAction';
import { CertsInfo } from '../types/CertsInfo';
import { RawDate, TimeRange, UserName } from '../types/Common';
import { ComponentStatus } from '../types/IstioStatus';
import { NotificationGroup } from '../types/MessageCenter';
import { Namespace } from '../types/Namespace';
import { StatusState } from '../types/StatusState';
import { TLSStatus } from '../types/TLSStatus';
import { AlertUtils } from '../utils/Alertutils';

export interface NamespaceState {
  readonly activeNamespaces: Namespace[];
  readonly filter: string;
  readonly items?: Namespace[];
  readonly isFetching: boolean;
  readonly lastUpdated?: Date;
  readonly namespacesPerCluster?: Map<string, string[]>;
}

export interface MessageCenterState {
  nextId: number; // This likely will go away once we have persistence
  groups: NotificationGroup[];
  hidden: boolean;
  expanded: boolean;
  expandedGroupId?: string;
}

export enum LoginStatus {
  logging,
  loggedIn,
  loggedOut,
  error,
  expired,
}

export interface LoginSession {
  expiresOn: RawDate;
  username: UserName;
  kialiCookie: string;
}

export interface LoginState {
  landingRoute?: string;
  message: string;
  session?: LoginSession;
  status: LoginStatus;
}

export interface InterfaceSettings {
  navCollapse: boolean;
}

export interface UserSettings {
  duration: number;
  interface: InterfaceSettings;
  refreshInterval: number;
  replayActive: boolean;
  replayQueryTime: number;
  timeRange: TimeRange;
}

// This defines the Kiali Global Application State
export interface KialiAppState {
  // Global state === across multiple pages
  // could also be session state
  /** Page Settings */
  authentication: LoginState;
  istioStatus: ComponentStatus[];
  istioCertsInfo: CertsInfo[];
  messageCenter: MessageCenterState;
  meshTLSStatus: TLSStatus;
  namespaces: NamespaceState;
  statusState: StatusState;
  /** User Settings */
  userSettings: UserSettings;
  dispatch: { [key: string]: React.Dispatch<KialiAppAction> };
  alertUtils?: AlertUtils;
}
