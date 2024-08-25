import { GroupVersionKind, Model } from './types/types';

export const VirtualMachineGVK: GroupVersionKind = {
  apiVersion: 'v1',
  apiGroup: 'kubevirt.io',
  kind: 'VirtualMachine',
};

export const VirtualMachineInstanceGVK: GroupVersionKind = {
  apiVersion: 'v1',
  apiGroup: 'kubevirt.io',
  kind: 'VirtualMachineInstance',
};
// export const ReplicationControllerGVK: GroupVersionKind = {
//   apiVersion: 'v1',
//   kind: 'ReplicationController',
// };
export const VirtualMachineModel: Model = {
  ...VirtualMachineGVK,
  abbr: 'VM',
  labelPlural: 'VirtualMachines',
  color: '#2b9af3',
  plural: 'virtualmachines',
};
export const VirtualMachineInstanceModel: Model = {
  ...VirtualMachineInstanceGVK,
  abbr: 'VMI',
  labelPlural: 'VirtualMachineInstances',
  color: '#2b9af3',
  plural: 'virtualmachineinstances',
};
