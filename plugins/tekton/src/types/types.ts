export const tektonGroupColor = '#38812f';

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
  selectedStatus: string;
  setSelectedStatus: React.Dispatch<React.SetStateAction<string>>;
  isExpanded?: boolean;
  setIsExpanded: React.Dispatch<React.SetStateAction<boolean>>;
};

export type Order = 'asc' | 'desc';

export type OpenRowStatus = {
  [x: string]: boolean;
};
