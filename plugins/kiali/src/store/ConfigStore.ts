// defaults to localStorage for web and AsyncStorage for react-native
import {
  INITIAL_GLOBAL_STATE,
  INITIAL_GRAPH_STATE,
  INITIAL_ISTIO_CERTS_INFO_STATE,
  INITIAL_ISTIO_STATUS_STATE,
  INITIAL_LOGIN_STATE,
  INITIAL_MESH_TLS_STATE,
  INITIAL_MESSAGE_CENTER_STATE,
  INITIAL_NAMESPACE_STATE,
  INITIAL_STATUS_STATE,
  INITIAL_TOUR_STATE,
  INITIAL_TRACING_STATE,
  INITIAL_USER_SETTINGS_STATE,
} from '../reducers';
import { KialiAppState } from './Store';

// Setup the initial state of the Redux store with defaults
// (instead of having things be undefined until they are populated by query)
// Redux 4.0 actually required this
export const initialStore: KialiAppState = {
  globalState: INITIAL_GLOBAL_STATE,
  authentication: INITIAL_LOGIN_STATE,
  graph: INITIAL_GRAPH_STATE,
  istioStatus: INITIAL_ISTIO_STATUS_STATE,
  istioCertsInfo: INITIAL_ISTIO_CERTS_INFO_STATE,
  meshTLSStatus: INITIAL_MESH_TLS_STATE,
  messageCenter: INITIAL_MESSAGE_CENTER_STATE,
  namespaces: INITIAL_NAMESPACE_STATE,
  statusState: INITIAL_STATUS_STATE,
  tourState: INITIAL_TOUR_STATE,
  tracingState: INITIAL_TRACING_STATE,
  userSettings: INITIAL_USER_SETTINGS_STATE,
  dispatch: {},
};
