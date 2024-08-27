const DEFAULT_NODE_PAD = 20;
const DEFAULT_GROUP_PAD = 40;

export const NODE_WIDTH = 104;
export const NODE_HEIGHT = 104;
export const NODE_PADDING = [0, DEFAULT_NODE_PAD];

export const GROUP_WIDTH = 300;
export const GROUP_HEIGHT = 180;
export const GROUP_PADDING = [
  DEFAULT_GROUP_PAD,
  DEFAULT_GROUP_PAD,
  DEFAULT_GROUP_PAD + 20,
  DEFAULT_GROUP_PAD,
];

export const MAXSHOWRESCOUNT = 3;

export const RESOURCE_NAME_TRUNCATE_LENGTH = 13;

export const TYPE_WORKLOAD = 'workload';
export const TYPE_VM = 'virtualmachine';
export const TYPE_APPLICATION_GROUP = 'part-of';
export const TYPE_CONNECTS_TO = 'connects-to';
export const INSTANCE_LABEL = 'app.kubernetes.io/instance';

export const MEMO: { [key: string]: any } = {};

export const SHOW_POD_COUNT_FILTER_ID = 'show-pod-count';

export const TOPOLOGY_FILTERS = [
  {
    id: SHOW_POD_COUNT_FILTER_ID,
    label: 'Pod count',
    value: false,
    disabled: false,
  },
];

export const LABEL_USED_TEMPLATE_NAME = 'vm.kubevirt.io/template';
