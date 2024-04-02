import { AppHealth } from './Health';
import { ObjectReference } from './IstioObjects';
import { Namespace } from './Namespace';

export interface AppOverview {
  cluster?: string;
  health: AppHealth;
  istioAmbient: boolean;
  istioReferences: ObjectReference[];
  istioSidecar: boolean;
  labels: { [key: string]: string };
  name: string;
}

export interface AppListItem extends AppOverview {
  namespace: string;
}

export interface AppList {
  applications: AppOverview[];
  namespace: Namespace;
}

export interface AppListQuery {
  health: 'true' | 'false';
  istioResources: 'true' | 'false';
  rateInterval: string;
}
