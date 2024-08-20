import { GroupVersionKind, Model } from './types/types';

export const VirtualMachineGVK: GroupVersionKind = {
  apiVersion: 'v1',
  apiGroup: 'kubevirt.io',
  kind: 'VirtualMachine',
};
export const VirtualMachineModel: Model = {
  ...VirtualMachineGVK,
  abbr: 'VM',
  labelPlural: 'VirtualMachines',
  color: '#2b9af3',
  plural: 'virtualmachines',
};
