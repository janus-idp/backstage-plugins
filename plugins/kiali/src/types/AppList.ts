import { AppHealth } from './Health';
import { ObjectReference } from './IstioObjects';

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
