import { ModelsPlural } from '../models';
import { K8sWorkloadResource } from './types';

export const VM_TYPE: string = ModelsPlural.virtualmachines;

export enum VMIPhase {
  Pending = 'Pending',
  Scheduling = 'Scheduling',
  Scheduled = 'Scheduled',
  Running = 'Running',
  Succeeded = 'Succeeded',
  Failed = 'Failed',
  Unknown = 'Unknown',
}

export type K8sResourceKind = K8sWorkloadResource & {
  spec?: {
    [key: string]: any;
  };
  status?: { [key: string]: any };
  data?: { [key: string]: any };
};

export enum DeviceType {
  NIC = 'NIC',
  DISK = 'DISK',
}
export type BootableDeviceType = {
  type: DeviceType;
  typeLabel: string;
  value: Object;
};
