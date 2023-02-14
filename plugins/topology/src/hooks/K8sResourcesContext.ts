import * as React from 'react';
import { K8sResponse } from '../types/topology-types';

export const K8sResourcesContext = React.createContext<K8sResponse>({});
