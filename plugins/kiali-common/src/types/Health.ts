import { RequestHealth } from './';

export type NamespaceHealth = {
  workloadStatuses?: WorkloadStatus[];
  WorkloadStatus?: WorkloadStatus;
  requests: RequestHealth;
};

export interface WorkloadStatus {
  name: string;
  desiredReplicas: number;
  currentReplicas: number;
  availableReplicas: number;
  syncedProxies: number;
}

export type HealthAnnotationType = { [key: string]: string };
