import { V1Ingress } from '@kubernetes/client-node';

export type IngressData = {
  ingress: V1Ingress;
  url?: string;
};

export type IngressesData = IngressData[];
