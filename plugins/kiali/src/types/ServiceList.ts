import { ServiceHealth } from './Health';
import { ObjectReference, ObjectValidation, Validations } from './IstioObjects';
import { Namespace } from './Namespace';
import { AdditionalItem } from './Workload';

export interface ServiceList {
  namespace: Namespace;
  services: ServiceOverview[];
  validations: Validations;
}

export interface ServiceOverview {
  name: string;
  cluster?: string;
  istioSidecar: boolean;
  istioAmbient: boolean;
  additionalDetailSample?: AdditionalItem;
  labels: { [key: string]: string };
  ports: { [key: string]: number };
  istioReferences: ObjectReference[];
  kialiWizard: string;
  serviceRegistry: string;
  health: ServiceHealth;
}

export interface ServiceListItem extends ServiceOverview {
  type: string;
  namespace: string;
  validation?: ObjectValidation;
}
