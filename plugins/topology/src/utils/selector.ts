import * as _ from 'lodash';

import { K8sResourceKind, VMIKind, VMKind } from '../types/vm';
import { VirtualMachineInstanceModel } from '../vm-models';

type StringHashMap = {
  [key: string]: string;
};

const getSuffixValue = (key: string) => {
  const index = key ? key.lastIndexOf('/') : -1;
  return index > 0 ? key.substring(index + 1) : '';
};
const getPrefixedKey = (obj: StringHashMap, keyPrefix: string) =>
  obj ? Object.keys(obj).find(key => key.startsWith(keyPrefix)) : '';

export const findKeySuffixValue = (obj: StringHashMap, keyPrefix: string) =>
  getSuffixValue(getPrefixedKey(obj, keyPrefix) || '');

export const getValueByPrefix = (
  keyPrefix: string,
  obj: { [key: string]: string } = {},
): string => {
  const objectKey = Object.keys(obj).find(key => key.startsWith(keyPrefix));
  return objectKey ? obj[objectKey] : '';
};

// Annotations
export const getAnnotations = (
  vm: VMKind,
  defaultValue?: { [key: string]: string },
): { [key: string]: string } | undefined =>
  _.get(vm, 'metadata.annotations', defaultValue);

export const getLabels = (
  entity: K8sResourceKind,
  defaultValue?: { [key: string]: string },
) => {
  const metadata = _.get(entity, 'metadata', {});
  const labels = (metadata as { labels?: { [key: string]: string } }).labels;

  return labels || defaultValue || {};
};

export const getVMIConditionsByType = (
  vmi: VMIKind,
  condType: string,
): VMIKind['status']['conditions'] => {
  const conditions = vmi && vmi.status && vmi.status.conditions;
  return (conditions || []).filter(cond => cond.type === condType);
};

const getName = (vmi: VMIKind) => _.get(vmi, 'metadata.name');

const getNamespace = (vmi: VMIKind) => _.get(vmi, 'metadata.namespace');

// replacing config.getString('baseUrl')} with process.env.PLUGIN_BASE_URL || 'http://localhost:3000'
export const getVMISubresourcePath = () =>
  `${process.env.PLUGIN_BASE_URL || 'http://localhost:3000'}/apis/subresources.${VirtualMachineInstanceModel.apiGroup}`;

// replacing getKubevirtModelAvailableVersion(VirtualMachineInstanceModel)} => v1
export const getVMIApiPath = (vmi: VMIKind) =>
  `v1/namespaces/${getNamespace(
    vmi,
  )}/${VirtualMachineInstanceModel.plural}/${getName(vmi)}`;
