import * as _ from 'lodash';
import { flatMap, get, uniq } from 'lodash';

import { K8sWorkloadResource } from '../types/types';
import { DeviceType, K8sResourceKind, VMIPhase } from '../types/vms';

// Find VMI
export const findVMI = (
  vm?: K8sWorkloadResource,
  vmis?: Array<K8sWorkloadResource>,
) => {
  if (!vm || !vmis) return null;
  const vmUID = vm?.metadata?.uid;
  const vmi = vmis.filter(v => {
    const vmiOwnerReferences = v?.metadata?.ownerReferences;
    return (
      v?.metadata?.namespace === vm?.metadata?.namespace &&
      vmiOwnerReferences &&
      vmiOwnerReferences.some(
        vmiOwnerReference => vmiOwnerReference.uid === vmUID,
      )
    );
  });
  return vmi?.[0];
};

// Find Pods from VMI
export const findPodFromVMI = (
  vmi?: K8sWorkloadResource | null,
  pods?: Array<K8sWorkloadResource> | null,
) => {
  if (!pods || !vmi) {
    return null;
  }
  const vmUID = vmi?.metadata?.uid;
  return pods.filter(p => {
    const podOwnerReferences = p?.metadata?.ownerReferences;
    return (
      p?.metadata?.namespace === vmi?.metadata?.namespace &&
      podOwnerReferences &&
      podOwnerReferences.some(
        podOwnerReference => podOwnerReference.uid === vmUID,
      )
    );
  });
};

// Labeled Device

const transformDevices = (
  disks: Array<Object> = [],
  nics: Array<Object> = [],
) => {
  const transformedDisks = disks.map(disk => ({
    type: DeviceType.DISK,
    typeLabel: Object.keys(disk)?.[1].toUpperCase(), // Need to update
    value: disk,
  }));
  const transformedNics = nics.map(nic => ({
    type: DeviceType.NIC,
    typeLabel: 'NIC', // Need to update
    value: nic,
  }));

  return [...transformedDisks, ...transformedNics];
};
const getInterfaces = (vm: K8sWorkloadResource) =>
  _.get(vm, 'spec.template.spec.domain.devices.interfaces') === null
    ? []
    : vm?.spec?.template?.spec.domain.devices.interfaces;

const getDisks = (vm: K8sWorkloadResource) =>
  _.get(vm, 'spec.template.spec.domain.devices.disks') === null
    ? []
    : vm?.spec?.template?.spec?.domain?.devices?.disks;
const getNetworkInterfaces = (vm: K8sWorkloadResource) => getInterfaces(vm);

export const getLabeledDevices = (vm: K8sWorkloadResource) =>
  transformDevices(getDisks(vm), getNetworkInterfaces(vm));

// Boot Order

export const deviceKey = (device: Object) => {
  return `${device?.type}-${device?.value?.name}`;
};

export const deviceLabel = (device: Object) => {
  const name = device?.value?.name;

  if (name.match(/^\$\{[A-Z_]+\}$/)) {
    return `${name} (${device?.typeLabel}), template parameter`;
  }

  return `${name} (${device?.typeLabel})`;
};

// IP Address

export const getVmiIpAddresses = (vmi: K8sWorkloadResource | null) => {
  if (!vmi) return [];
  return uniq(
    flatMap(
      // get IPs only for named interfaces because Windows reports IPs for other devices like Loopback Pseudo-Interface 1 etc.
      get(vmi, 'status.interfaces', []).filter(i => !!i.name),
      i => {
        const arr = [];
        if (i.ipAddress) {
          // the "ipAddress" is deprecated but still can contain useful value
          arr.push(i.ipAddress.trim());
        }
        if (
          i.ipAddresses &&
          Array.isArray(i.ipAddresses) &&
          i.ipAddresses.length > 0
        ) {
          arr.push(...i.ipAddresses.map(ip => ip.trim()));
        }
        return arr;
      },
    ).filter(ip => ip && ip.length > 0),
  );
};

// Description
export const getDescription = (resource: K8sWorkloadResource) =>
  resource?.metadata?.annotations?.description;

// Template Name

export const getLabel = (value: any, label: string, defaultValue?: string) =>
  _.has(value, 'metadata.labels') ? value.metadata.labels[label] : defaultValue;

// Node
export const getVMINodeName = (vmi: any) =>
  vmi && vmi.status && vmi.status.nodeName;

export const getNodeName = (pod: any) =>
  pod && pod.spec ? pod.spec.nodeName : undefined;

// Hardware GPU , Host Devices
export const getGPUDevices = (vm: K8sWorkloadResource) =>
  vm?.spec?.template?.spec?.domain?.devices?.gpus || [];
export const getHostDevices = (vm: K8sWorkloadResource) =>
  vm?.spec?.template?.spec?.domain?.devices?.hostDevices || [];

// SSH Keys
const getStatusPhase = <T = string>(entity: K8sResourceKind): T =>
  entity?.status?.phase;

export const isVMIReady = (vmi: any) =>
  getStatusPhase(vmi) === VMIPhase.Running;
