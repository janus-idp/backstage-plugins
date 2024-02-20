import { AppHealthResponse } from '../types/Health';
import { Namespace } from './Namespace';
import { Runtime } from './Workload';

export interface AppId {
  app: string;
  cluster?: string;
  namespace: string;
}

export interface AppWorkload {
  istioSidecar: boolean;
  istioAmbient: boolean;
  labels: { [key: string]: string };
  serviceAccountNames: string[];
  workloadName: string;
}

export interface App {
  cluster?: string;
  health: AppHealthResponse;
  name: string;
  namespace: Namespace;
  runtimes: Runtime[];
  serviceNames: string[];
  workloads: AppWorkload[];
}

export interface AppQuery {
  health: 'true' | 'false';
  rateInterval: string;
}
