import * as React from 'react';
import { K8sResponse } from '../types/topology-types';

export const K8sResourcesContext = React.createContext<K8sResponse>({});

export const K8sResourcesClusterContext = React.createContext<number>(0);

export const K8sResourcesClustersContext = React.createContext<string[]>([]);
