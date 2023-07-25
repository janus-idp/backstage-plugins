export enum StatusKey {
  DISABLED_FEATURES = 'Disabled features',
  KIALI_CORE_COMMIT_HASH = 'Kiali commit hash',
  KIALI_CORE_VERSION = 'Kiali version',
  KIALI_CONTAINER_VERSION = 'Kiali container version',
  KIALI_STATE = 'Kiali state',
  MESH_NAME = 'Mesh name',
  MESH_VERSION = 'Mesh version',
}

export type StatusT = { [K in StatusKey]?: string };

export interface ExternalServiceInfo {
  name: string;
  version?: string;
  url?: string;
}

export interface IstioEnvironment {
  isMaistra: boolean;
  istioAPIEnabled: boolean;
}

export interface StatusState {
  status: StatusT;
  externalServices: ExternalServiceInfo[];
  warningMessages: string[];
  istioEnvironment: IstioEnvironment;
}

export const INITIAL_STATUS_STATE: StatusState = {
  status: {},
  externalServices: [],
  warningMessages: [],
  istioEnvironment: {
    isMaistra: false,
    istioAPIEnabled: true,
  },
};
