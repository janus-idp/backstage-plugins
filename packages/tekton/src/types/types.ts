export type GroupVersionKind = {
  kind: string;
  apiVersion: string;
  apiGroup?: string;
};

export type TektonResponseData = {
  [key: string]: { data: any[] };
};

export type ClusterError = {
  errorType?: string;
  message?: string;
  resourcePath?: string;
  statusCode?: number;
};

export type ClusterErrors = ClusterError[];

export type TektonResourcesContextData = {
  watchResourcesData?: TektonResponseData;
  loaded?: boolean;
  responseError?: string;
  selectedClusterErrors?: ClusterErrors;
  clusters: string[];
  selectedCluster?: number;
  setSelectedCluster: React.Dispatch<React.SetStateAction<number>>;
};
