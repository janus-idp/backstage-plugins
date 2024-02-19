import { KialiAppAction } from '../actions/KialiAppAction';
import { TracingState } from '../reducers';
import { CertsInfo } from '../types/CertsInfo';
import { RawDate, TimeRange, UserName } from '../types/Common';
import { EdgeLabelMode, EdgeMode, GraphDefinition, GraphType, Layout, NodeParamsType, RankMode, RankResult, SummaryData, TrafficRate } from '../types/Graph';
import { ComponentStatus } from '../types/IstioStatus';
import { NotificationGroup } from '../types/MessageCenter';
import { Namespace } from '../types/Namespace';
import { StatusState } from '../types/StatusState';
import { TLSStatus } from '../types/TLSStatus';
import { AlertUtils } from '../utils/Alertutils';
import { TourInfo } from '../components/Tour/TourStop';

export interface NamespaceState {
  readonly activeNamespaces: Namespace[];
  readonly filter: string;
  readonly items?: Namespace[];
  readonly isFetching: boolean;
  readonly lastUpdated?: Date;
  readonly namespacesPerCluster?: Map<string, string[]>;
}

export interface GlobalState {
  readonly loadingCounter: number;
  readonly isPageVisible: boolean;
  readonly kiosk: string;
  readonly theme: string;
}

export interface GraphToolbarState {
  // dropdown props
  edgeLabels: EdgeLabelMode[];
  graphType: GraphType;
  rankBy: RankMode[];
  trafficRates: TrafficRate[];
  // find props
  findValue: string;
  hideValue: string;
  showFindHelp: boolean;
  // Toggle props
  boxByCluster: boolean;
  boxByNamespace: boolean;
  compressOnHide: boolean;
  showIdleEdges: boolean;
  showIdleNodes: boolean;
  showLegend: boolean;
  showOutOfMesh: boolean;
  showOperationNodes: boolean;
  showRank: boolean;
  showSecurity: boolean;
  showServiceNodes: boolean;
  showTrafficAnimation: boolean;
  showVirtualServices: boolean;
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

export interface GraphState {
  edgeMode: EdgeMode;
  graphDefinition: GraphDefinition | null; // Not for consumption. Only for "Debug" dialog.
  layout: Layout;
  namespaceLayout: Layout;
  node?: NodeParamsType;
  rankResult: RankResult;
  summaryData: SummaryData | null;
  toolbarState: GraphToolbarState;
  updateTime: number;
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

export interface TourState {
  activeTour?: TourInfo;
  activeStop?: number; // index into the TourInfo.stops array
}

// This defines the Kiali Global Application State
export interface KialiAppState {
  // Global state === across multiple pages
  // could also be session state
  /** Page Settings */
  authentication: LoginState;
  globalState: GlobalState;
  graph: GraphState;
  istioStatus: ComponentStatus[];
  istioCertsInfo: CertsInfo[];
  messageCenter: MessageCenterState;
  meshTLSStatus: TLSStatus;
  namespaces: NamespaceState;
  statusState: StatusState;
  tourState: TourState;
  tracingState: TracingState;
  /** User Settings */
  userSettings: UserSettings;
  dispatch: { [key: string]: React.Dispatch<KialiAppAction> };
  alertUtils?: AlertUtils;
}
